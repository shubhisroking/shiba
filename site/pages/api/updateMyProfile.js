const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appg245A41MWc6Rej';
const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || 'Users';
const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!AIRTABLE_API_KEY) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const { token, profile } = req.body || {};
  if (!token || typeof profile !== 'object' || profile === null) {
    return res.status(400).json({ message: 'Missing required fields: token, profile' });
  }

  try {
    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const updates = buildAirtableFieldsFromProfile(profile);
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ ok: true, profile: normalizeProfileFields(user.fields || {}) });
    }

    const payload = { fields: updates };
    await airtableRequest(`${encodeURIComponent(AIRTABLE_USERS_TABLE)}/${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    // Read back
    const refreshed = await getUserById(user.id);
    const normalized = normalizeProfileFields((refreshed && refreshed.fields) || {});
    return res.status(200).json({ ok: true, profile: normalized });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('updateMyProfile error:', e);
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
  const params = new URLSearchParams({
    filterByFormula: `{token} = "${tokenEscaped}"`,
    pageSize: '1',
  });
  const data = await airtableRequest(`${encodeURIComponent(AIRTABLE_USERS_TABLE)}?${params.toString()}`, {
    method: 'GET',
  });
  return (data.records && data.records[0]) || null;
}

async function getUserById(id) {
  const data = await airtableRequest(`${encodeURIComponent(AIRTABLE_USERS_TABLE)}/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
  return data || null;
}

function buildAirtableFieldsFromProfile(p) {
  const out = {};
  if (typeof p.githubUsername === 'string') out['github username'] = p.githubUsername;
  if (typeof p.firstName === 'string') out['First Name'] = p.firstName;
  if (typeof p.lastName === 'string') out['Last Name'] = p.lastName;
  if (typeof p.birthday === 'string') {
    const trimmed = p.birthday.trim();
    // Expecting HTML date input (YYYY-MM-DD). If empty or invalid, omit field to avoid Airtable 422
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      out['birthday'] = trimmed;
    }
  }
  if (typeof p.slackId === 'string') out['slack id'] = p.slackId;
  if (p.address && typeof p.address === 'object') {
    if (typeof p.address.street1 === 'string') out['street address'] = p.address.street1;
    if (typeof p.address.street2 === 'string') out['street address #2'] = p.address.street2;
    if (typeof p.address.city === 'string') out['city'] = p.address.city;
    if (typeof p.address.zipcode === 'string') out['zipcode'] = p.address.zipcode;
    if (typeof p.address.country === 'string') out['country'] = p.address.country;
  }
  return out;
}

function normalizeProfileFields(f) {
  return {
    email: typeof f.Email === 'string' ? f.Email : '',
    githubUsername: typeof f['github username'] === 'string' ? f['github username'] : '',
    firstName: typeof f['First Name'] === 'string' ? f['First Name'] : '',
    lastName: typeof f['Last Name'] === 'string' ? f['Last Name'] : '',
    birthday: typeof f['birthday'] === 'string' ? f['birthday'] : '',
    slackId: typeof f['slack id'] === 'string' ? f['slack id'] : '',
    address: {
      street1: typeof f['street address'] === 'string' ? f['street address'] : '',
      street2: typeof f['street address #2'] === 'string' ? f['street address #2'] : '',
      city: typeof f['city'] === 'string' ? f['city'] : '',
      zipcode: typeof f['zipcode'] === 'string' ? f['zipcode'] : '',
      country: typeof f['country'] === 'string' ? f['country'] : '',
    },
  };
}


