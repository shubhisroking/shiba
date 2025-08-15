/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const PlayGameComponent = dynamic(() => import("@/components/utils/playGameComponent"), { ssr: false });

export default function PostAttachmentRenderer({ content, attachments, playLink, gameName, thumbnailUrl, slackId, createdAt, token, onPlayCreated }) {
  const [slackProfile, setSlackProfile] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!slackId) return;
      try {
        const res = await fetch(`https://cachet.dunkirk.sh/users/${encodeURIComponent(slackId)}`);
        const json = await res.json().catch(() => ({}));
        if (!cancelled && json && (json.displayName || json.image)) {
          setSlackProfile({ displayName: json.displayName || '', image: json.image || '' });
        }
      } catch (_) {
        // best-effort only
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slackId]);
  // Prefer explicit PlayLink field provided by API
  let playHref = typeof playLink === 'string' && playLink.trim() ? playLink.trim() : null;

  // If attachments contain a text/plain with a play URL, fallback (rare)
  if (!playHref && Array.isArray(attachments)) {
    const txt = attachments.find((a) => (a?.type || a?.contentType || "").startsWith("text/"));
    if (txt && typeof txt.url === "string") {
      playHref = txt.url;
    }
  }

  let gameId = '';
  if (playHref) {
    try {
      const path = playHref.startsWith('http') ? new URL(playHref).pathname : playHref;
      const m = /\/play\/([^\/?#]+)/.exec(path);
      gameId = m && m[1] ? decodeURIComponent(m[1]) : '';
    } catch (_) {
      gameId = '';
    }
  }

  // Utility: classify attachment kind using MIME and filename extension
  const classifyKind = (att) => {
    const rawType = String(att?.type || att?.contentType || '').toLowerCase();
    const filename = String(att?.filename || '');
    let ext = '';
    if (filename && filename.includes('.')) {
      ext = filename.split('.').pop().toLowerCase();
    } else if (att?.url) {
      try {
        const u = new URL(att.url, 'https://dummy');
        const p = u.pathname || '';
        if (p.includes('.')) ext = p.split('.').pop().toLowerCase();
      } catch (_) {
        // ignore
      }
    }
    const imageExts = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']);
    const videoExts = new Set(['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv']);
    const audioExts = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac']);

    if (rawType.startsWith('image/') || imageExts.has(ext)) return 'image';
    if (rawType.startsWith('video/') || videoExts.has(ext)) return 'video';
    if (rawType.startsWith('audio/') || audioExts.has(ext)) return 'audio';
    return 'other';
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {slackId ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.18)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#fff',
              backgroundImage: slackProfile?.image ? `url(${slackProfile.image})` : 'none',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 12 }}>
              <strong>{slackProfile?.displayName || slackId}</strong>
              {gameName ? <em style={{ opacity: 0.8 }}>(making {gameName})</em> : null}
            </div>
            {createdAt ? (
              <span style={{ fontSize: 11, opacity: 0.6 }}>
                {new Date(createdAt).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      <div style={{ whiteSpace: 'pre-wrap' }}>{content || ''}</div>
      {gameId ? (
        <PlayGameComponent 
          gameId={gameId} 
          gameName={gameName} 
          thumbnailUrl={thumbnailUrl} 
          token={token}
          onPlayCreated={onPlayCreated}
        />
      ) : null}
      {Array.isArray(attachments) && attachments.length > 0 && (() => {
        const media = attachments.filter((att) => {
          const kind = classifyKind(att);
          return kind === 'image' || kind === 'video';
        });
        const mediaCount = media.length;
        const columns = Math.max(1, Math.min(mediaCount, 3)); // 1 col for 1, 2 cols for 2, 3+ cols => 3
        const imageMax = Math.max(160, Math.floor(480 / columns));
        const videoMax = Math.max(200, Math.floor(540 / columns));
        return (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
            {attachments.map((att, idx) => {
              const url = att?.url;
              const kind = classifyKind(att);
              if (!url) return null;
              if (kind === 'image') {
                return (
                  <img
                    key={att.id || idx}
                    src={url}
                    alt={att.filename || ''}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: imageMax,
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      background: '#fff',
                    }}
                  />
                );
              }
              if (kind === 'video') {
                return (
                  <video
                    key={att.id || idx}
                    src={url}
                    controls
                    playsInline
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: videoMax,
                      borderRadius: 8,
                      background: '#000',
                    }}
                  />
                );
              }
              if (kind === 'audio') {
                return (
                  <div key={att.id || idx} style={{ gridColumn: columns > 1 ? `span ${columns}` : 'auto' }}>
                    <audio src={url} controls style={{ width: '100%' }} />
                  </div>
                );
              }
              return (
                <a
                  key={att.id || idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  style={{ fontSize: 12, gridColumn: columns > 1 ? `span ${columns}` : 'auto' }}
                >
                  {att.filename || url}
                </a>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}


