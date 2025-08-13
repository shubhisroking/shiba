// Load env from api/.env or repo root .env if present
try {
    require('dotenv').config({ path: require('path').join(__dirname, '.env') });
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch {}

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs');
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const mime = require('mime-types');

// ================================
// Setup
// ================================
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ================================
// Configuration (Cloudflare R2)
// ================================
// Required env vars:
// R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_REGION, R2_BUCKET, R2_ENDPOINT, UPLOAD_AUTH_TOKEN
const {
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_REGION,
	R2_BUCKET,
	R2_ENDPOINT,
	UPLOAD_AUTH_TOKEN
} = process.env;

const R2_ENABLED = !!(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_REGION && R2_BUCKET && R2_ENDPOINT);
if (!R2_ENABLED) {
	console.warn('[api] Missing one or more R2 env vars. Falling back to local storage for upload/play.');
}

const s3 = R2_ENABLED ? new S3Client({
	region: R2_REGION || 'auto',
	endpoint: R2_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID || '',
		secretAccessKey: R2_SECRET_ACCESS_KEY || ''
	}
}) : null;

// Where in the bucket we place game files
const GAMES_PREFIX = 'games';
const LOCAL_STORAGE_DIR = path.join(__dirname, 'local_storage');
try { if (!R2_ENABLED) fs.mkdirSync(path.join(LOCAL_STORAGE_DIR, GAMES_PREFIX), { recursive: true }); } catch {}

// ================================
// Utilities
// ================================
function requireUploadAuth(req, res) {
	const auth = req.headers['authorization'] || '';
	const token = auth.startsWith('Bearer ')
		? auth.slice('Bearer '.length)
		: (req.query.token || req.body?.token || '');
	if (!UPLOAD_AUTH_TOKEN || token !== UPLOAD_AUTH_TOKEN) {
		res.status(401).json({ error: 'Unauthorized: invalid or missing upload token' });
		return false;
	}
	return true;
}

function sanitizeZipEntryPath(entryPath) {
	// Normalize to POSIX and prevent path traversal
	const normalized = path.posix.normalize(entryPath).replace(/^\/+/, '');
	if (normalized.startsWith('..')) {
		return null;
	}
	return normalized;
}

function contentTypeForKey(key) {
	return mime.lookup(key) || 'application/octet-stream';
}

async function uploadStreamToR2(key, bodyStream, contentType, cacheControl) {
	const uploader = new Upload({
		client: s3,
		params: {
			Bucket: R2_BUCKET,
			Key: key,
			Body: bodyStream,
			ContentType: contentType,
			CacheControl: cacheControl
		}
	});
	return uploader.done();
}

async function uploadStreamToLocalFile(key, bodyStream) {
	return new Promise((resolve, reject) => {
		const filePath = path.join(LOCAL_STORAGE_DIR, key);
		fs.mkdir(path.dirname(filePath), { recursive: true }, (dirErr) => {
			if (dirErr) return reject(dirErr);
			const writeStream = fs.createWriteStream(filePath);
			bodyStream.pipe(writeStream);
			writeStream.on('finish', resolve);
			writeStream.on('error', reject);
			bodyStream.on('error', reject);
		});
	});
}

async function streamR2ObjectToResponse(key, req, res) {
	try {
		const rangeHeader = req.headers['range'];
		const getParams = {
			Bucket: R2_BUCKET,
			Key: key
		};
		if (rangeHeader) {
			getParams.Range = rangeHeader;
		}
		const object = await s3.send(new GetObjectCommand(getParams));
		const contentType = object.ContentType || contentTypeForKey(key);
		const contentLength = object.ContentLength;
		res.setHeader('Content-Type', contentType);
		if (object.CacheControl) res.setHeader('Cache-Control', object.CacheControl);
		if (object.ETag) res.setHeader('ETag', object.ETag);
		if (object.LastModified) res.setHeader('Last-Modified', object.LastModified.toUTCString());
		res.setHeader('Accept-Ranges', 'bytes');
		if (rangeHeader && object.ContentRange) {
			res.status(206);
			res.setHeader('Content-Range', object.ContentRange);
		}
		if (typeof contentLength === 'number') {
			res.setHeader('Content-Length', String(contentLength));
		}
		// Pipe body to response
		object.Body.pipe(res);
		object.Body.on('error', (err) => {
			console.error('[api] Stream error from R2:', err);
			if (!res.headersSent) res.status(500).end('Stream error');
		});
	} catch (err) {
		if (err && err.$metadata && err.$metadata.httpStatusCode === 404) {
			return res.status(404).json({ error: 'Not found' });
		}
		console.error('[api] Failed to get object from R2', err);
		return res.status(500).json({ error: 'Failed to fetch object' });
	}
}

async function streamLocalFileToResponse(key, req, res) {
	try {
		const filePath = path.join(LOCAL_STORAGE_DIR, key);
		const stat = await fs.promises.stat(filePath);
		const total = stat.size;
		const contentType = contentTypeForKey(filePath);
		res.setHeader('Content-Type', contentType);
		res.setHeader('Accept-Ranges', 'bytes');
		const range = req.headers['range'];
		if (range) {
			const match = /bytes=(\d*)-(\d*)/.exec(range);
			let start = match && match[1] ? parseInt(match[1], 10) : 0;
			let end = match && match[2] ? parseInt(match[2], 10) : total - 1;
			if (isNaN(start)) start = 0;
			if (isNaN(end) || end >= total) end = total - 1;
			const chunkSize = (end - start) + 1;
			res.status(206);
			res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
			res.setHeader('Content-Length', String(chunkSize));
			fs.createReadStream(filePath, { start, end }).pipe(res);
			return;
		}
		res.setHeader('Content-Length', String(total));
		fs.createReadStream(filePath).pipe(res);
	} catch (err) {
		if (err && err.code === 'ENOENT') return res.status(404).json({ error: 'Not found' });
		console.error('[api] Failed to stream local file', err);
		return res.status(500).json({ error: 'Failed to fetch file' });
	}
}

// ================================
// Upload: POST /api/uploadGame
// ================================
// Usage:
// - Auth: Send header Authorization: Bearer <UPLOAD_AUTH_TOKEN>
// - Form: multipart/form-data with fields:
//   - file: the .zip of your Godot HTML5 export
//   - gameId (optional): a unique id/slug, e.g. "my-cool-game". If omitted, a timestamp id is generated
// - Behavior: The zip is extracted and each file is uploaded to R2 at `games/<gameId>/...`
// - Response: { ok: true, gameId, playUrl: "/play/<gameId>" }

const UPLOADS_DIR = path.join(__dirname, 'uploads');
try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch {}
const upload = multer({ dest: UPLOADS_DIR });

async function extractAndUploadZip(tmpZipPath, gameId) {
	const prefix = `${GAMES_PREFIX}/${gameId}/`;
	const stream = fs.createReadStream(tmpZipPath).pipe(unzipper.Parse());
	const uploads = [];

	return new Promise((resolve, reject) => {
		stream.on('entry', (entry) => {
			const entryPath = sanitizeZipEntryPath(entry.path);
			if (!entryPath) {
				entry.autodrain();
				return;
			}
			if (entry.type === 'Directory') {
				entry.autodrain();
				return;
			}
			const key = prefix + entryPath;
			const contentType = contentTypeForKey(key);
			const cacheControl = /\.(?:html?)$/i.test(key)
				? 'no-cache'
				: 'public, max-age=300';
			// Upload this file stream
			if (R2_ENABLED) {
				uploads.push(
					uploadStreamToR2(key, entry, contentType, cacheControl).catch((err) => {
						console.error('[api] Upload failed for', key, err);
						throw err;
					})
				);
			} else {
				uploads.push(
					uploadStreamToLocalFile(key, entry).catch((err) => {
						console.error('[api] Local write failed for', key, err);
						throw err;
					})
				);
			}
		});
		stream.on('error', reject);
		stream.on('close', async () => {
			try {
				await Promise.all(uploads);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	});
}

app.post(['/api/uploadGame', '/uploadGame'], upload.single('file'), async (req, res) => {
	if (!requireUploadAuth(req, res)) return;
	if (!req.file) {
		return res.status(400).json({ error: 'Missing file field "file" (zip)' });
	}
	const providedGameId = (req.body.gameId || '').trim();
	const gameId = providedGameId || `game-${Date.now()}`;
	const tmpPath = req.file.path;

	try {
		await extractAndUploadZip(tmpPath, gameId);
		res.json({ ok: true, gameId, playUrl: `/play/${encodeURIComponent(gameId)}` });
	} catch (err) {
		console.error('[api] Upload failed', err);
		res.status(500).json({ error: 'Upload failed', details: String(err?.message || err) });
	} finally {
		fs.unlink(tmpPath, () => {});
	}
});

// ================================
// Play: GET /play/:gameId and /play/:gameId/*
// ================================
// Serves uploaded game files directly from R2.
// - /play/:gameId -> serves index.html
// - /play/:gameId/<path> -> serves that asset
// Supports Range requests for audio/video.

app.get('/play/:gameId', async (req, res) => {
	const gameId = req.params.gameId;
	const key = `${GAMES_PREFIX}/${gameId}/index.html`;
	return R2_ENABLED ? streamR2ObjectToResponse(key, req, res) : streamLocalFileToResponse(key, req, res);
});

app.get('/play/:gameId/*', async (req, res) => {
	const gameId = req.params.gameId;
	// express stores * as req.params[0]
	const rest = (req.params[0] || '').replace(/^\/+/, '');
	const key = `${GAMES_PREFIX}/${gameId}/${rest}`;
	return R2_ENABLED ? streamR2ObjectToResponse(key, req, res) : streamLocalFileToResponse(key, req, res);
});

// ================================
// R2 -> Local sync
// ================================
async function listAllKeysUnderPrefix(prefix) {
	const keys = [];
	let ContinuationToken = undefined;
	while (true) {
		const cmd = new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, ContinuationToken });
		const resp = await s3.send(cmd);
		for (const obj of resp.Contents || []) {
			if (obj.Key && !obj.Key.endsWith('/')) keys.push(obj.Key);
		}
		if (!resp.IsTruncated) break;
		ContinuationToken = resp.NextContinuationToken;
	}
	return keys;
}

async function downloadR2ObjectToLocalFile(key) {
	const filePath = path.join(LOCAL_STORAGE_DIR, key);
	await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
	const obj = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
	return new Promise((resolve, reject) => {
		const write = fs.createWriteStream(filePath);
		obj.Body.pipe(write);
		write.on('finish', resolve);
		write.on('error', reject);
		obj.Body.on('error', reject);
	});
}

async function syncFromR2ToLocal() {
	if (!R2_ENABLED) return { ok: false, reason: 'R2 not enabled' };
	const prefix = `${GAMES_PREFIX}/`;
	console.log('[api] Sync from R2 to local starting...');
	try {
		const keys = await listAllKeysUnderPrefix(prefix);
		for (const key of keys) {
			await downloadR2ObjectToLocalFile(key);
		}
		console.log(`[api] Sync complete. Downloaded ${keys.length} objects.`);
		return { ok: true, count: keys.length };
	} catch (err) {
		console.error('[api] Sync failed', err);
		return { ok: false, error: String(err?.message || err) };
	}
}

// Manual sync endpoint (protected by the same upload token)
app.post('/admin/syncFromR2', async (req, res) => {
	if (!requireUploadAuth(req, res)) return;
	const result = await syncFromR2ToLocal();
	res.json(result);
});

// ================================
// Health & Root
// ================================
app.get('/health', (req, res) => {
	res.json({ ok: true });
});

app.get('/', (req, res) => {
	res.type('text/plain').send('Shiba API running');
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
	// Kick off background sync on startup if R2 is configured
	if (R2_ENABLED) {
		syncFromR2ToLocal().catch(() => {});
	}
});
