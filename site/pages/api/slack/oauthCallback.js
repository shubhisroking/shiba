const CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const REDIRECT_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appg245A41MWc6Rej';
const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || 'Users';
const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { code, state } = req.query;
    if (!code || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_BASE) {
      return res.status(400).send('Slack OAuth not configured');
    }
    const redirectUri = `${REDIRECT_BASE}/api/slack/oauthCallback`;
    const tokenRes = await fetch('https://slack.com/api/openid.connect.token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: redirectUri }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.ok) {
      return res.status(400).send('Slack OAuth failed');
    }
    const accessToken = tokenJson.access_token;
    // Fetch userinfo for profile and user id
    const userInfoRes = await fetch('https://slack.com/api/openid.connect.userInfo', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await userInfoRes.json();
    const slackUserId = userInfo && (userInfo['https://slack.com/user_id'] || userInfo.sub || '');

    // If we have a token captured in state (from opener), update user immediately in Airtable
    const userToken = typeof state === 'string' ? state : '';
    if (userToken && slackUserId && AIRTABLE_API_KEY) {
      try {
        const user = await findUserByToken(userToken);
        if (user && user.id) {
          await airtableRequest(`${encodeURIComponent(AIRTABLE_USERS_TABLE)}/${encodeURIComponent(user.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ fields: { 'slack id': String(slackUserId) } }),
          });
        }
      } catch (_) {}
    }

    // Pass slackUserId back to app via simple HTML to postMessage the id then close
    return res.send(`<!doctype html><html><body><script>window.opener && window.opener.postMessage({ type: 'SLACK_CONNECTED', slackId: '${slackUserId || ''}' }, '*'); window.close();</script></body></html>`);
  } catch (e) {
    return res.status(500).send('OAuth error');
  }
}

function escapeFormulaString(value) {
  return String(value).replace(/"/g, '\\"');
}

async function airtableRequest(path, options = {}) {
  const url = `${AIRTABLE_API_BASE}/${AIRTABLE_BASE_ID}/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const _ = await response.text().catch(() => '');
    throw new Error('airtable update failed');
  }
  return response.json();
}

async function findUserByToken(token) {
  const tokenEscaped = escapeFormulaString(token);
  const params = new URLSearchParams({
    filterByFormula: `{token} = "${tokenEscaped}"`,
    pageSize: '1',
  });
  const data = await airtableRequest(`${encodeURIComponent(AIRTABLE_USERS_TABLE)}?${params.toString()}`, {
    method: 'GET',
  });
  return (data.records && data.records[0]) || null;
}


