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
  const url = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&scope=users:read&user_scope=identity.basic&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  res.redirect(url);
}


