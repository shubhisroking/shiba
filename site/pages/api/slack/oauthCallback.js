const CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const REDIRECT_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { code } = req.query;
    if (!code || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_BASE) {
      return res.status(400).send('Slack OAuth not configured');
    }
    const redirectUri = `${REDIRECT_BASE}/api/slack/oauthCallback`;
    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: redirectUri }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.ok) {
      return res.status(400).send('Slack OAuth failed');
    }
    const slackUserId = tokenJson.authed_user && tokenJson.authed_user.id;
    // Pass slackUserId back to app via simple HTML to postMessage the id then close
    return res.send(`<!doctype html><html><body><script>window.opener && window.opener.postMessage({ type: 'SLACK_CONNECTED', slackId: '${slackUserId || ''}' }, '*'); window.close();</script></body></html>`);
  } catch (e) {
    return res.status(500).send('OAuth error');
  }
}


