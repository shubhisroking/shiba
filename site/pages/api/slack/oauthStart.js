const CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const REDIRECT_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  if (!CLIENT_ID || !REDIRECT_BASE) {
    return res.status(500).json({ message: 'Slack OAuth not configured' });
  }
  const state = encodeURIComponent(String(req.query.state || ''));
  const redirectUri = `${REDIRECT_BASE}/api/slack/oauthCallback`;
  // Use Slack OpenID Connect for Sign in with Slack (no bot install required)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'openid profile email',
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });
  const url = `https://slack.com/openid/connect/authorize?${params.toString()}`;
  res.redirect(url);
}


