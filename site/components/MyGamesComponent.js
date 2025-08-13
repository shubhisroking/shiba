import { useEffect, useState, useRef } from "react";
import CreateGameModal from "@/components/CreateGameModal";
import useAudioManager from "@/components/useAudioManager";


function ShaderToyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) return;

    const vertexSource = `#version 300 es\nprecision highp float;\nvoid main(){\n  const vec2 verts[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));\n  gl_Position = vec4(verts[gl_VertexID], 0.0, 1.0);\n}`;

    const fragmentSource = `#version 300 es\nprecision highp float;\nout vec4 outColor;\nuniform vec3 iResolution;\nuniform float iTime;\n\n#define pi 3.145191\n#define wither 1.7825638\n#define mzkzoz 4.2396529\n#define euler 2.64\n#define res 1.24536783\n#define less 0.5\n\nconst int SHADER_TYPE_MOVING              = 0;\nconst int SHADER_TYPE_DISTORTION_GLITCH   = 1;\nconst int SHADER_TYPE_VERTICAL_LINEAR     = 2;\nconst int SHADER_TYPE_HORIZONTAL_LINEAR   = 3;\nconst int SHADER_TYPE_CENTER_LINEAR       = 4;\nconst int SHADER_TYPE_CURTAIN             = 5;\n\nconst int HUD_TYPE_BORDERS                 = 0;\nconst int HUD_TYPE_ROUNDED_BORDERS         = 1;\nconst int HUD_TYPE_CENTER_COLUMN           = 2;\nconst int HUD_TYPE_CRAZY_LINES             = 3;\nconst int HUD_TYPE_MAYBE_VERTICAL_DIRTY    = 4;\nconst int HUD_TYPE_MAYBE_VERTICAL          = 5;\nconst int HUD_TYPE_HALF                    = 6;\n\nconst int HUD_TYPE_DISTORTION_GLITCH_NORMAL        = 7;\nconst int HUD_TYPE_DISTORTION_GLITCH_EXTENDED      = 10;\nconst int HUD_TYPE_DISTORTION_GLITCH_FADE_IN       = 11;\nconst int HUD_TYPE_DISTORTION_GLITCH_FADE_IN_DIRTY = 12;\n\nconst int HUD_TYPE_CURTAIN_RED_HEATED      = 13;\nconst int HUD_TYPE_CURTAIN_GREEN_HEATED    = 14;\nconst int HUD_TYPE_CURTAIN_BLUE_HEATED     = 15;\nconst int HUD_TYPE_CURTAIN_MIXED           = 16;\nconst int HUD_TYPE_CURTAIN_GREEN_YELLOW    = 17;\nconst int HUD_TYPE_CURTAIN_YELLOW_GREEN    = 18;\nconst int HUD_TYPE_CURTAIN_BLUE_PINK       = 19;\nconst int HUD_TYPE_CURTAIN_WHITE_PINK      = 21;\n\nconst int shaderType = SHADER_TYPE_CURTAIN;\nconst int hudType = HUD_TYPE_CURTAIN_BLUE_PINK;\nconst int distortionGlitchType = HUD_TYPE_DISTORTION_GLITCH_NORMAL;\nconst bool shaderPaused = false;\nconst float shaderPausedValue = 12.32;\n\nconst float uFrequency = 1.0;\nconst float velocity = 100.0;\nconst float amount = 1.0;\nconst bool horizontalLines = false;\nconst bool coloredBorders = false;\n\nconst int amplitudeType     = 0;\nconst int WAS               = 0;\nconst int redPower          = 0;\nconst int greenPower        = 0;\nconst int bluePower         = 0;\n\nconst int amplitudeMultiplier   = 0;\nconst int WASMultiplier         = 0;\nconst int redMultiplier         = 0;\nconst int greenMultiplier       = 0;\nconst int blueMultiplier        = 0;\n\nconst float alpha               = 1.0;\n\nfloat hudMulti(float var) {\n    switch (hudType) {\n        case HUD_TYPE_ROUNDED_BORDERS:return sin(var * pi);\n        case HUD_TYPE_CENTER_COLUMN:return cos(var);\n        case HUD_TYPE_CRAZY_LINES:return tan(var);\n        case HUD_TYPE_MAYBE_VERTICAL_DIRTY:return sinh(var);\n        case HUD_TYPE_MAYBE_VERTICAL:return cosh(var);\n        case HUD_TYPE_HALF:return asin(var);\n    }\n    return sin(var);\n}\nfloat convertible(float var, int use){\n    switch (use) {\n        case 1:return sin(var);\n        case 2:return cos(var);\n        case 3:return tan(var);\n\n        case 4:return asin(var);\n        case 5:return acos(var);\n        case 6:return atan(var);\n\n        case 7:return sinh(var);\n        case 8:return cosh(var);\n        case 9:return tanh(var);\n\n        case 10:return asinh(var);\n        case 11:return acosh(var);\n        case 12:return atanh(var);\n    }\n    return var;\n}\nfloat multiply(int multi){switch (multi) {\n        case 1:return pi;\n        case 2:return wither;\n        case 3:return mzkzoz;\n        case 4:return euler;\n        case 5:return res;\n        case 6:return less;\n    }\n    return 1.0;\n}\nfloat hudGlitchType(float var) {\n    switch (distortionGlitchType) {\n        case HUD_TYPE_DISTORTION_GLITCH_EXTENDED:return tan(var);\n        case HUD_TYPE_DISTORTION_GLITCH_FADE_IN:return cos(var);\n        case HUD_TYPE_DISTORTION_GLITCH_FADE_IN_DIRTY:return asinh(var);\n    }\n    return var;\n}\n\nfloat colorF(float colorIn){\n   return abs(sin(pi * abs(colorIn * pi)) / sin(cos(wither) * euler));\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 uv = fragCoord/iResolution.xy;\n    float r = 1.0;\n    float g = 1.0;\n    float b = 1.0;\n    if (shaderType == SHADER_TYPE_MOVING) {\n        float data = uv.x;\n        float yData = uv.y;\n        bool thing = coloredBorders;\n        if (horizontalLines == true) {\n            data = uv.y;\n            thing = !thing;\n        }\n        if (coloredBorders == true) {\n            yData = uv.x;\n        }\n        if (shaderPaused == true) {\n            r = abs(colorF(abs(colorF(yData) * (shaderPausedValue * velocity))));\n        } else {\n            r = abs(colorF(abs(colorF(yData) * (iTime * velocity))));\n        }\n        g = colorF(data);\n        b = mod(colorF(r * uFrequency) * convertible(mzkzoz * pi, WAS) * multiply(WASMultiplier),\n            sin(convertible(g * wither / euler, amplitudeType) * multiply(amplitudeMultiplier)));\n    } else if (shaderType == SHADER_TYPE_DISTORTION_GLITCH) {\n        float lines = 3.0;\n        float data = uv.x;\n        float notData = uv.y;\n        if (horizontalLines == false) {\n            data = uv.y;\n            notData = uv.x;\n        }\n        if (shaderPaused == true) {\n            r = abs(data * convertible(data * data * shaderPausedValue * data, redPower) * hudMulti(uFrequency));\n            g = colorF(data * convertible(shaderPausedValue * (velocity * hudGlitchType(wither)) * sin(mod(shaderPausedValue, notData)), greenPower));\n            b = abs(hudMulti(shaderPausedValue) * velocity * convertible(tanh(notData) * wither * euler * lines * sin(pi), bluePower));\n        } else {\n            r = abs(data * convertible(data * data * iTime * data, redPower) * hudMulti(uFrequency));\n            g = colorF(data * convertible(iTime * (velocity * hudGlitchType(wither)) * sin(mod(iTime, notData)), greenPower));\n            b = abs(hudMulti(iTime) * velocity * convertible(tanh(notData) * wither * euler * lines * sin(pi), bluePower));\n        }\n    } else if(shaderType == SHADER_TYPE_VERTICAL_LINEAR) {\n        if (shaderPaused == true) {\n            r = abs(shaderPausedValue * uv.x * (velocity * amount) * multiply(amplitudeMultiplier));\n        } else {\n            r = abs(iTime * uv.x * (velocity * amount) * multiply(amplitudeMultiplier));\n        }\n        g = sin((r));\n        b = cos(g);\n    } else if(shaderType == SHADER_TYPE_HORIZONTAL_LINEAR) {\n        if (shaderPaused == true) {\n            r = abs(shaderPausedValue * uv.y * (velocity * amount) * multiply(amplitudeMultiplier));\n        } else {\n            r = abs(iTime * uv.y * (velocity * amount) * multiply(amplitudeMultiplier));\n        }\n        g = sin((r));\n        b = cos(g);\n    } else if(shaderType == SHADER_TYPE_CENTER_LINEAR) {\n        if (shaderPaused == true) {\n            r = abs(shaderPausedValue * uv.x * uv.y * (velocity * amount) * multiply(amplitudeMultiplier));\n        } else {\n            r = abs(iTime * uv.x * uv.y * (velocity * amount) * multiply(amplitudeMultiplier));\n        }\n        g = sin((r));\n        b = cos(g);\n    } else if(shaderType == SHADER_TYPE_CURTAIN) {\n        switch(hudType) {\n            case HUD_TYPE_CURTAIN_GREEN_YELLOW:\n                if (horizontalLines) {\n                    if(shaderPaused) {\n                        r = mod(uv.y * shaderPausedValue, uv.x) * uFrequency;\n                    } else {\n                        r = mod(uv.y * iTime, uv.x) * uFrequency;\n                    }\n                } else {\n                    if(shaderPaused) {\n                        r = mod(uv.x * shaderPausedValue, uv.y) * uFrequency;\n                    } else {\n                        r = mod(uv.x * iTime, uv.y) * uFrequency;\n                    }\n                }\n                g = 0.0;\n                b = 1.0;\n            case HUD_TYPE_CURTAIN_YELLOW_GREEN:\n                if (horizontalLines) {\n                    if(shaderPaused) {\n                        r = mod(uv.y * shaderPausedValue, uv.x) * uFrequency;\n                    } else {\n                        r = mod(uv.y * iTime, uv.x) * uFrequency;\n                    }\n                } else {\n                    if(shaderPaused) {\n                        r = mod(uv.x * shaderPausedValue, uv.y) * uFrequency;\n                    } else {\n                        r = mod(uv.x * iTime, uv.y) * uFrequency;\n                    }\n                }\n                g = 0.0;\n                b = 0.0;\n            case HUD_TYPE_CURTAIN_BLUE_PINK:\n                if (horizontalLines) {\n                    if(shaderPaused) {\n                        r = mod(uv.y * shaderPausedValue, uv.x) * uFrequency;\n                    } else {\n                        r = mod(uv.y * iTime, uv.x) * uFrequency;\n                    }\n                } else {\n                    if(shaderPaused) {\n                        r = mod(uv.x * shaderPausedValue, uv.y) * uFrequency;\n                    } else {\n                        r = mod(uv.x * iTime, uv.y) * uFrequency;\n                    }\n                }\n                g = 1.0;\n                b = 1.0;\n            case HUD_TYPE_CURTAIN_WHITE_PINK:\n                if (horizontalLines) {\n                    if(shaderPaused) {\n                        g = mod(uv.y * shaderPausedValue, uv.x) * uFrequency;\n                    } else {\n                        g = mod(uv.y * iTime, uv.x) * uFrequency;\n                    }\n                } else {\n                    if(shaderPaused) {\n                        g = mod(uv.x * shaderPausedValue, uv.y) * uFrequency;\n                    } else {\n                        g = mod(uv.x * iTime, uv.y) * uFrequency;\n                    }\n                }\n                r = 1.0;\n                b = 1.0;\n        }\n    }\n    fragColor = vec4(\n        convertible(r, redPower)   * multiply(redMultiplier),\n        convertible(g, greenPower) * multiply(greenMultiplier),\n        convertible(b, bluePower)  * multiply(blueMultiplier),\n        alpha\n    );\n}\n\nvoid main(){\n  vec4 color;\n  mainImage(color, gl_FragCoord.xy);\n  outColor = color;\n}`;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.useProgram(program);
    const uResolution = gl.getUniformLocation(program, 'iResolution');
    const uTime = gl.getUniformLocation(program, 'iTime');

    let raf = 0;
    const start = performance.now();

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const width = Math.floor(canvas.clientWidth * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      resize();
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      gl.useProgram(null);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      aria-hidden
    />
  );
}

export default function MyGamesComponent({ disableTopBar, setDisableTopBar, goHome, token, SlackId }) {
  
  const [myGames, setMyGames] = useState([]);
  const [createGamePopupOpen, setCreateGamePopupOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [visibleItemsCount, setVisibleItemsCount] = useState(0);
  const { play: playSound } = useAudioManager(["popSound.mp3", "loadingSound.mp3"]);
  const gridRef = useRef(null);
  const [gridStep, setGridStep] = useState({ x: 256, y: 256 });
  const [gridOffset, setGridOffset] = useState({ left: 16, top: 0 });

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
        let loadStart = Date.now();
        playSound("loadingSound.mp3");
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
        const elapsed = typeof loadStart === 'number' ? (Date.now() - loadStart) : 0;
        const remaining = Math.max(0, 2000 - elapsed);
        if (remaining > 0) {
          await new Promise((r) => setTimeout(r, remaining));
        }
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMyGames();
    return () => { isMounted = false; };
  }, [token]);

  // Staggered reveal sequence for list view (includes the "+" card at the end)
  useEffect(() => {

    if (mySelectedGameId) return; // Only animate in list view
    const total = (Array.isArray(myGames) ? myGames.length : 0) + 1; // include "+"
    let cancelled = false;
    const timeouts = [];
    setVisibleItemsCount(0);
    const initialDelayMs = 1000; // wait 1s before first pop
    const gapMs = 500; // 500ms between items
    playSound("popSound.mp3");

    for (let i = 0; i < total; i++) {

      const t = setTimeout(() => {
        if (cancelled) return;
        setVisibleItemsCount((current) => Math.max(current, i + 1));
      }, initialDelayMs + i * gapMs);
      timeouts.push(t);
    }
    return () => {
      cancelled = true;
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [myGames, mySelectedGameId]);

  // Fixed grid lines based on 240px squares and 16px gaps (no flex)
  useEffect(() => {
    setGridStep({ x: 240, y: 240 });
  }, []);

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
      <div style={{ width: '100vw', display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", height: '100vh', maxWidth: '100vw', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
        <ShaderToyBackground />
        <p style={{ position: 'relative', zIndex: 1 }}>Loading...</p>
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
          <div
            style={{
              width: '100vw',
              margin: '0 auto',
              minHeight: '100vh',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <ShaderToyBackground />
            <div
              ref={gridRef}
              style={{
                display: 'grid',
                paddingLeft: 16,
                paddingRight: 16,

                gridTemplateColumns: 'repeat(auto-fill, 240px)',
                gap: 0,
                marginTop: 12,
                justifyContent: 'start',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {myGames.map((g, idx) => {
                const title = g.name || 'Untitled';
                const hasImage = Boolean(g.thumbnailUrl);
                return (
                  <div key={g.id || `${title}-${idx}`} className={`pop-seq-item${visibleItemsCount > idx ? ' visible' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '240px',
                        aspectRatio: '1 / 1',
                        background: '#fff',
                        border: '1px solid #000',
                        borderRadius: 4,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: g.id ? 'pointer' : 'default',
                      }}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onClick={() => {
                        if (g.id) setMySelectedGameId(g.id);
                      }}
                    >
                      {hasImage ? (
                        <img
                          src={g.thumbnailUrl}
                          alt={title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ padding: 8, textAlign: 'center' }}>{title}</span>
                      )}

                    <div style={{ display: hoverIndex === idx ? 'flex' : 'none', position: 'absolute', top: 8, right: 8, cursor: 'pointer', justifyContent: 'center' }}>
                      <button
                        style={{ fontSize: 12, cursor: 'pointer', color: '#b00020' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmText = `DELETE ${title}`;
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
                        Delete
                      </button>
                    </div>
                    </div>

                  </div>
                );
              })}
              <div key="create-new" className={`pop-seq-item${visibleItemsCount > myGames.length ? ' visible' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    background: '#fff',
                    border: '1px solid #000',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setCreateGamePopupOpen(true);
                  }}
                  title="Create Game"
                  aria-label="Create Game"
                >
                  <span style={{ fontSize: 40, lineHeight: 1, userSelect: 'none' }}>+</span>
                </div>
              </div>
            </div>
            <style jsx>{`
              .pop-seq-item {
                visibility: hidden;
                transform: scale(0);
              }
              .pop-seq-item.visible {
                visibility: visible;
                animation: popIn 1000ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              }
              @keyframes popIn {
                0% { transform: scale(0); opacity: 0; }
                60% { transform: scale(1.08); opacity: 1; }
                80% { transform: scale(0.98); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.28)'
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
