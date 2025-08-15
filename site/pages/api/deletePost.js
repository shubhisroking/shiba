const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appg245A41MWc6Rej';
const AIRTABLE_POSTS_TABLE = process.env.AIRTABLE_POSTS_TABLE || 'Posts';
const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!AIRTABLE_API_KEY) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const { token, postId } = req.body || {};
  if (!token || !postId) {
    return res.status(400).json({ message: 'Missing required fields: token, postId' });
  }

  try {
    // Find user by token to verify ownership
    const userRecord = await findUserByToken(token);
    if (!userRecord) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Delete the post record
    await airtableRequest(`${encodeURIComponent(AIRTABLE_POSTS_TABLE)}/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
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
    const text = await response.text().catch(() => '');
    throw new Error(`Airtable error ${response.status}: ${text}`);
  }
  return response.json();
}

async function findUserByToken(token) {
  const tokenEscaped = escapeFormulaString(token);
  
  // Try different field names like in newLogin.js
  const candidateFields = ['token', 'Token', 'User Token'];
  
  for (const fieldName of candidateFields) {
    const formula = `{${fieldName}} = "${tokenEscaped}"`;
    const params = new URLSearchParams({
      filterByFormula: formula,
      pageSize: '1',
    });

    try {
      const data = await airtableRequest(`${encodeURIComponent('Users')}?${params.toString()}`, {
        method: 'GET',
      });
      
      if (data.records && data.records.length > 0) {
        return data.records[0];
      }
    } catch (error) {
      // Continue to next field name
    }
  }
  
  return null;
}
