/* eslint-disable react/prop-types */
import React from "react";
import dynamic from "next/dynamic";

const PlayGameComponent = dynamic(() => import("@/components/utils/playGameComponent"), { ssr: false });

export default function PostAttachmentRenderer({ content, attachments, playLink, gameName, thumbnailUrl }) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ whiteSpace: 'pre-wrap' }}>{content || ''}</div>
      {gameId ? (
        <PlayGameComponent gameId={gameId} gameName={gameName} thumbnailUrl={thumbnailUrl} />
      ) : null}
      {Array.isArray(attachments) && attachments.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {attachments.map((att, idx) => {
            const url = att?.url;
            const type = att?.type || att?.contentType || "";
            if (!url) return null;
            if (type.startsWith("image/")) {
              return <img key={att.id || idx} src={url} alt={att.filename || ""} style={{ width: 160, height: 160, objectFit: "cover", border: "1px solid #ddd", borderRadius: 8 }} />;
            }
            return (
              <a key={att.id || idx} href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                {att.filename || url}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}


