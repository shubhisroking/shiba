import { useState } from "react";

export default function CreateGameModal({ isOpen, onClose, token, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!token || !name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/CreateNewGame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: name.trim(), description }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setName("");
        setDescription("");
        onClose?.();
        onCreated?.();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 0,
          minWidth: 320,
          maxWidth: 480,
          width: "90%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Header HSTACK */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>Create Game</p>
          <button onClick={onClose}>Close</button>
        </div>

        {/* Body VStack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            type="text"
            placeholder="Game Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            rows={4}
            placeholder="Game Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: "vertical" }}
          />
          <button disabled={submitting || !name.trim()} onClick={handleCreate}>
            {submitting ? "Creating..." : "Create Game"}
          </button>
        </div>
      </div>
    </div>
  );
}


