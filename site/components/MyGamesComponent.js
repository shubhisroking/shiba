import { useEffect, useState, useRef } from "react";
import CreateGameModal from "@/components/CreateGameModal";


export default function MyGamesComponent({ disableTopBar, setDisableTopBar, goHome, token, SlackId }) {
  
  const [myGames, setMyGames] = useState([]);
  const [createGamePopupOpen, setCreateGamePopupOpen] = useState(false);

  const [mySelectedGameId, setMySelectedGameId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle top bar depending on whether a game is selected (detail view)
  useEffect(() => {
    try {
      if (typeof setDisableTopBar === 'function') {
        setDisableTopBar(Boolean(mySelectedGameId));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [mySelectedGameId, setDisableTopBar]);



  useEffect(() => {
    let isMounted = true;
    const fetchMyGames = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch("/api/GetMyGames", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => []);
        if (!Array.isArray(data)) return;
        const normalized = data.map((g) => ({
          id: g.id || g.ID || null,
          name: g.name ?? g.Name ?? "",
          description: g.description ?? g.Description ?? "",
          thumbnailUrl: g.thumbnailUrl ?? "",
          GitHubURL: g.GitHubURL ?? "",
          HackatimeProjects: g.HackatimeProjects ?? "",
          posts: Array.isArray(g.posts) ? g.posts : [],
        }));
        if (isMounted) setMyGames(normalized);
      } catch (e) {
        console.error(e);
        // swallow for now
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMyGames();
    return () => { isMounted = false; };
  }, [token]);

  const refresh = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/GetMyGames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) {
        const normalized = data.map((g) => ({
          id: g.id || g.ID || null,
          name: g.name ?? g.Name ?? "",
          description: g.description ?? g.Description ?? "",
          thumbnailUrl: g.thumbnailUrl ?? "",
          GitHubURL: g.GitHubURL ?? "",
          HackatimeProjects: g.HackatimeProjects ?? "",
          posts: Array.isArray(g.posts) ? g.posts : [],
        }));
        setMyGames(normalized);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Creation handled by CreateGameModal; just refresh after

  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {mySelectedGameId
        ? (() => {
            const selected = myGames.find((x) => x.id === mySelectedGameId);
            if (!selected) return null;
            return (
              <DetailView
                game={selected}
                onBack={() => setMySelectedGameId(null)}
                token={token}
                onUpdated={(updated) => {
                  setMyGames((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
                }}
                SlackId={SlackId}
              />
            );
          })()
        : (
          <>
            <p>My Games Component</p>

            <button onClick={() => {
              setCreateGamePopupOpen(true);
            }}>Create Game</button>

            <ul>
              {myGames.map((g, idx) => (
                <li key={g.id || `${g.name}-${idx}`}>
                  <span
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                      if (g.id) setMySelectedGameId(g.id);
                    }}
                  >
                    {g.name || "Untitled"}
                  </span>
                  <span
                    style={{ color: 'red', marginLeft: 8, cursor: 'pointer' }}
                    onClick={async () => {
                      const confirmText = `DELETE ${g.name || 'Untitled'}`;
                      const input = window.prompt(`Type \"${confirmText}\" to confirm deletion`);
                      if (input !== confirmText) return;
                      try {
                        const res = await fetch('/api/deleteGame', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token, gameId: g.id }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (res.ok && data?.ok) {
                          await refresh();
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    Delete Item
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

      <CreateGameModal
        isOpen={createGamePopupOpen}
        onClose={() => setCreateGamePopupOpen(false)}
        token={token}
        onCreated={refresh}
      />


      {/* <button onClick={() => {
        goHome();
        setDisableTopBar(false);
      }}>Go Home</button> */}
    </div>
  );
}



function DetailView({ game, onBack, token, onUpdated, SlackId }) {
  const [name, setName] = useState(game?.name || "");
  const [description, setDescription] = useState(game?.description || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(game?.thumbnailUrl || "");
  const [previewUrl, setPreviewUrl] = useState(game?.thumbnailUrl || "");
  const [GitHubURL, setGitHubURL] = useState(game?.GitHubURL || "");
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectsCsv, setSelectedProjectsCsv] = useState(game?.HackatimeProjects || "");
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const projectPickerContainerRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postMessage, setPostMessage] = useState("");
  const [postFiles, setPostFiles] = useState([]);

  useEffect(() => {
    setName(game?.name || "");
    setDescription(game?.description || "");
    setThumbnailUrl(game?.thumbnailUrl || "");
    setThumbnailFile(null);
    setPreviewUrl(game?.thumbnailUrl || "");
    setGitHubURL(game?.GitHubURL || "");
    setSelectedProjectsCsv(game?.HackatimeProjects || "");
    setPostContent("");
    setPostMessage("");
  }, [game?.id]);

  useEffect(() => {
    // Fetch Hackatime projects via server proxy to avoid CORS
    const fetchProjects = async () => {
      if (!SlackId) return;
      try {
        const res = await fetch(`/api/hackatimeProjects?slackId=${encodeURIComponent(SlackId)}`);
        const json = await res.json().catch(() => ({}));
        const names = Array.isArray(json?.projects) ? json.projects : [];
        setAvailableProjects(names);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    };
    fetchProjects();
  }, [SlackId]);

  // Close picker when clicking outside of the input/picker container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showProjectPicker) return;
      const node = projectPickerContainerRef.current;
      if (node && !node.contains(event.target)) {
        setShowProjectPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProjectPicker]);

  // When user selects a file or types a new URL, update the preview accordingly
  useEffect(() => {
    let objectUrl = null;
    if (thumbnailFile) {
      objectUrl = URL.createObjectURL(thumbnailFile);
      setPreviewUrl(objectUrl);
    } else if (thumbnailUrl) {
      setPreviewUrl(thumbnailUrl);
    } else {
      setPreviewUrl("");
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnailFile, thumbnailUrl]);

  const handleUpdate = async () => {
    if (!token || !game?.id) return;
    setSaving(true);
    try {
      let uploadedUrl = thumbnailUrl;
      let thumbnailUpload = null;
      if (thumbnailFile) {
        // Convert selected file to base64 for direct Airtable content upload (<= 5MB)
        const toBase64 = (file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        const base64 = await toBase64(thumbnailFile);
        thumbnailUpload = {
          fileBase64: base64,
          contentType: thumbnailFile.type || 'application/octet-stream',
          filename: thumbnailFile.name || 'upload',
        };
      }
      const res = await fetch('/api/updateGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, gameId: game.id, name, description, thumbnailUrl: uploadedUrl, thumbnailUpload, GitHubURL, HackatimeProjects: selectedProjectsCsv }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok && data?.game) {
        const updated = {
          id: game.id,
          name: data.game.name,
          description: data.game.description,
          thumbnailUrl: data.game.thumbnailUrl || uploadedUrl || '',
          GitHubURL: data.game.GitHubURL || GitHubURL || '',
          HackatimeProjects: data.game.HackatimeProjects || selectedProjectsCsv || '',
        };
        onUpdated?.(updated);
        // sync local input/preview/state to server response
        setName(updated.name);
        setDescription(updated.description);
        setThumbnailFile(null);
        setThumbnailUrl(updated.thumbnailUrl);
        setGitHubURL(updated.GitHubURL);
        setSelectedProjectsCsv(updated.HackatimeProjects);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'row', gap: 16 }}>
      {/* Left column: existing form */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Edit Game</p>
          <button onClick={onBack}>Back</button>
        </div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Game Name" />
        <input
          type="text"
          value={GitHubURL}
          onChange={(e) => setGitHubURL(e.target.value)}
          placeholder="GitHub Link (https://github.com/{user}/{project})"
          onBlur={() => {
            const pattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
            if (GitHubURL && !pattern.test(GitHubURL)) {
              alert('Please use format: https://github.com/{user}/{project}');
            }
          }}
        />
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Game Description" />
        {/* Hackatime projects input with inline dropdown multi-select */}
        <label style={{ fontWeight: 500 }}>Hackatime Projects</label>
        <div ref={projectPickerContainerRef} style={{ position: 'relative', width: 400, maxWidth: 400 }}>
          <input
            type="text"
            value={selectedProjectsCsv}
            readOnly
            placeholder="Select projects"
            style={{ width: '100%', maxWidth: 400, paddingRight: 36 }}
            onClick={() => setShowProjectPicker((s) => !s)}
          />
          {showProjectPicker && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 10,
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: 8,
                background: '#fff',
                maxHeight: 260,
                overflow: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {availableProjects.length === 0 && (
                <div style={{ opacity: 0.6 }}>No projects found</div>
              )}
              {availableProjects.map((name, index) => {
                const current = Array.from(new Set(selectedProjectsCsv.split(',').map((s) => s.trim()).filter(Boolean)));
                const checked = current.includes(name);
                return (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 8px',
                      cursor: 'pointer',
                      borderTop: index === 0 ? 'none' : '1px solid #eee',
                    }}
                    onClick={(e) => {
                      // make entire row toggle
                      const set = new Set(current);
                      if (checked) set.delete(name); else set.add(name);
                      setSelectedProjectsCsv(Array.from(set).join(', '));
                    }}
                    role="checkbox"
                    aria-checked={checked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        const set = new Set(current);
                        if (checked) set.delete(name); else set.add(name);
                        setSelectedProjectsCsv(Array.from(set).join(', '));
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      style={{ pointerEvents: 'none' }}
                    />
                    <span style={{ fontSize: 12, color: '#333' }}>{name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Thumbnail upload */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="thumbnail"
            style={{ width: 160, height: 160, objectFit: 'cover', border: '1px solid #ccc', cursor: 'pointer' }}
            onClick={() => {
              const input = document.getElementById('thumbnail-file-input');
              if (input) input.click();
            }}
          />
        ) : null}
        <input
          id="thumbnail-file-input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setThumbnailFile(file);
          }}
        />
        <button disabled={saving} onClick={handleUpdate}>{saving ? 'Updating...' : 'Update'}</button>
      </div>
      <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid #ccc', paddingLeft: 16 }}>
        <p>Shiba Moments</p>
      <div style={{ marginTop: 16 }}>
        <textarea
          style={{ width: '100%', minHeight: 100, resize: 'vertical', fontSize: 14, padding: 8, boxSizing: 'border-box' }}
          placeholder="Write your update here..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <input
          type="file"
          accept="image/*,image/gif"
          multiple
          style={{ marginTop: 8 }}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setPostFiles(files);
          }}
        />
        <button
          style={{ marginTop: 8 }}
          disabled={isPosting || !postContent.trim()}
          onClick={async () => {
            if (!token || !game?.id || !postContent.trim()) return;
            setIsPosting(true);
            setPostMessage("");
            try {
              // Prepare optional attachments as base64
              const attachmentsUpload = await (async () => {
                const items = [];
                for (const f of postFiles) {
                  // Limit 5MB as Airtable content endpoint limit
                  if (typeof f.size === 'number' && f.size > 5 * 1024 * 1024) continue;
                  const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(f);
                  });
                  items.push({ fileBase64: base64, contentType: f.type || 'application/octet-stream', filename: f.name || 'upload' });
                }
                return items;
              })();
              const res = await fetch('/api/createPost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, gameId: game.id, content: postContent.trim(), attachmentsUpload }),
              });
              const data = await res.json().catch(() => ({}));
              if (res.ok && data?.ok) {
                setPostContent("");
                setPostFiles([]);
                setPostMessage('Posted!');
                setTimeout(() => setPostMessage("") , 2000);
                // Update parent state with the new post for this game
                const newPost = {
                  id: data.post?.id || undefined,
                  postId: data.post?.PostID || undefined,
                  content: data.post?.content || '',
                  createdAt: data.post?.createdAt || new Date().toISOString(),
                  attachments: Array.isArray(data.post?.attachments) ? data.post.attachments : [],
                };
                onUpdated?.({ id: game.id, posts: [newPost, ...(Array.isArray(game.posts) ? game.posts : [])] });
              } else {
                setPostMessage(data?.message || 'Failed to post');
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e);
              setPostMessage('Failed to post');
            } finally {
              setIsPosting(false);
            }
          }}
        >
          {isPosting ? 'Posting…' : 'Post'}
        </button>
        {postMessage ? <p style={{ marginTop: 8, opacity: 0.7 }}>{postMessage}</p> : null}
        {Array.isArray(game.posts) && game.posts.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {game.posts.map((p, pIdx) => (
              <div key={p.id || pIdx} style={{ paddingTop: 8, marginTop: 8, borderTop: '1px solid #eee' }}>
                <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{p.content}</div>
                {Array.isArray(p.attachments) && p.attachments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {p.attachments.map((att, attIdx) => (
                      <img key={att.id || attIdx} src={att.url} alt={att.filename || ''} style={{ width: 88, height: 88, objectFit: 'cover', border: '1px solid #ddd' }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
