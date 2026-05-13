import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import colorsData from "./colors.json";
import { useTheme } from "../ThemeContext";

// ---------------------------------------------------------------------------
// Theme colour tokens
// ---------------------------------------------------------------------------
const LIGHT = {
  bg:        "#ffffff",
  bgAlt:     "#f5f4f0",
  bgDeep:    "#eceae4",
  border:    "#d8d6ce",
  borderSub: "#e8e6e0",
  textPri:   "#1a1a18",
  textSec:   "#5a5a54",
  textHint:  "#9a9a90",
  accent:    "#0f6e56",
  accentBg:  "#e1f5ee",
  danger:    "#a32d2d",
  dangerBg:  "#fcebeb",
  white:     "#ffffff",
};

const DARK = {
  bg:        "#161b22",
  bgAlt:     "#1c2333",
  bgDeep:    "#21262d",
  border:    "#30363d",
  borderSub: "#21262d",
  textPri:   "#e6edf3",
  textSec:   "#8b949e",
  textHint:  "#6e7681",
  accent:    "#58a6ff",
  accentBg:  "#1f3a5e",
  danger:    "#f85149",
  dangerBg:  "#3d1b1b",
  white:     "#161b22",
};

const ColorsContext = createContext(LIGHT);
const useC = () => useContext(ColorsContext);

// ---------------------------------------------------------------------------
// Shared style helpers (functions of C so they react to theme changes)
// ---------------------------------------------------------------------------
const card = (C) => ({
  background: C.bg,
  border: "1px solid " + C.border,
  borderRadius: 10,
  padding: "12px 14px",
});

const sectionLabel = (C) => ({
  fontSize: 10, fontWeight: 600,
  color: C.textSec,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display: "block",
  marginBottom: 7,
});

const btn = (C, extra) => Object.assign({
  fontSize: 11, padding: "4px 9px",
  borderRadius: 6,
  border: "1px solid " + C.border,
  background: C.bgAlt,
  color: C.textSec,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex", alignItems: "center", gap: 4,
}, extra || {});

const inputSt = (C) => ({
  padding: "7px 10px",
  border: "1px solid " + C.border,
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "inherit",
  color: C.textPri,
  background: C.bg,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
});

// ---------------------------------------------------------------------------
// Paint data
// ---------------------------------------------------------------------------
function buildPaintList(data) {
  const paints = [];
  const seen = new Set();
  (data.colors || []).forEach((entry) => {
    const hex = entry.color || "#888888";
    if (entry.cit && entry.cit !== "-" && entry.cit !== "N/A") {
      const key = "cit-" + entry.cit;
      if (!seen.has(key)) {
        seen.add(key);
        paints.push({ key, brand: "citadel", name: entry.cit, hex, ttcMatch: entry.ttc });
      }
    }
    if (entry.ttc) {
      const key = "ttc-" + entry.ttc;
      if (!seen.has(key)) {
        seen.add(key);
        paints.push({ key, brand: "ttc", name: entry.ttc, hex, citMatch: (entry.cit !== "-" && entry.cit !== "N/A") ? entry.cit : null });
      }
    }
  });
  return paints;
}

const ALL_PAINTS = buildPaintList(colorsData);
const STORAGE_KEY = "wh-paint-schemes-v3";

const SAMPLE_SCHEMES = [
  {
    id: "s1", name: "Ultramarines Veteran", faction: "Space Marines",
    coverImage: null,
    notes: "Classic Ultramarine scheme. Thin paints well for smooth armour. Varnish before transfers.",
    steps: [
      { id: "st1", title: "Prime & base coat", desc: "Black spray prime, then basecoat armour panels.",
        paints: [{ key: "cit-Macragge Blue", brand: "citadel", name: "Macragge Blue", hex: "#44496F" }] },
      { id: "st2", title: "Shade recesses", desc: "Wash into all recesses and panel lines.",
        paints: [{ key: "ttc-Tempest Blue Wash", brand: "ttc", name: "Tempest Blue Wash", hex: "#2C465A" }] },
      { id: "st3", title: "Edge highlight", desc: "Thin highlight on raised edges.",
        paints: [{ key: "cit-Blue Horror", brand: "citadel", name: "Blue Horror", hex: "#6992C0" }] },
    ],
    references: [], tags: [],
  },
];

// ---------------------------------------------------------------------------
// PaintChip
// ---------------------------------------------------------------------------
function PaintChip({ paint, onRemove }) {
  const C = useC();
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 99,
      border: "1px solid " + C.borderSub,
      background: C.bgAlt,
      fontSize: 11, color: C.textPri,
    }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: paint.hex, flexShrink: 0, border: "1px solid " + C.border }} />
      {paint.name}
      <span style={{ fontSize: 10, color: C.textHint }}>· {paint.brand === "ttc" ? "TTC" : "Citadel"}</span>
      {onRemove && (
        <button onClick={onRemove} aria-label={"Remove " + paint.name}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: C.textHint, display: "flex", alignItems: "center" }}>
          <i className="ti ti-x" style={{ fontSize: 10 }} />
        </button>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PaintSearch
// ---------------------------------------------------------------------------
function PaintSearch({ onAdd, existingKeys }) {
  const C = useC();
  existingKeys = existingKeys || [];
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  const filtered = query.trim().length < 1 ? [] : ALL_PAINTS.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(query.toLowerCase());
    const matchB = brandFilter === "all" || p.brand === brandFilter;
    return matchQ && matchB;
  }).slice(0, 8);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px",
          border: "1px solid " + C.border,
          borderRadius: 6, background: C.bg,
        }}>
          <i className="ti ti-search" style={{ fontSize: 12, color: C.textHint }} aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={"Search " + ALL_PAINTS.length + " paints…"}
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, color: C.textPri, flex: 1, fontFamily: "inherit" }} />
        </div>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
          style={{ fontSize: 11, border: "1px solid " + C.border, borderRadius: 6, padding: "0 8px", background: C.bgAlt, color: C.textSec, fontFamily: "inherit" }}>
          <option value="all">All brands</option>
          <option value="citadel">Citadel</option>
          <option value="ttc">Two Thin Coats</option>
        </select>
      </div>

      {query.trim().length > 0 && (
        <div style={{ border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden", background: C.bg }}>
          {filtered.length === 0 && (
            <div style={{ padding: "9px 12px", fontSize: 12, color: C.textHint }}>No paints found</div>
          )}
          {filtered.map((p) => {
            const added = existingKeys.includes(p.key);
            const match = p.brand === "citadel" ? p.ttcMatch : p.citMatch;
            return (
              <div key={p.key} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 11px",
                borderBottom: "1px solid " + C.borderSub,
                background: added ? C.bgAlt : C.bg,
              }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: p.hex, flexShrink: 0, border: "1px solid " + C.border }} />
                <span style={{ fontWeight: 600, color: C.textPri, fontSize: 12, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 10, color: C.textHint, background: C.bgAlt, padding: "1px 6px", borderRadius: 99, border: "1px solid " + C.borderSub }}>
                  {p.brand === "ttc" ? "TTC" : "Citadel"}
                </span>
                {match && <span style={{ fontSize: 10, color: C.textHint }}>{"≈ " + match}</span>}
                <button onClick={() => !added && onAdd(p)} disabled={added}
                  style={btn(C, { background: added ? C.bgDeep : C.bg, color: added ? C.textHint : C.accent, borderColor: added ? C.border : C.accent })}>
                  {added ? "Added" : "+ Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImageSearch
// ---------------------------------------------------------------------------
function ImageSearch({ onAdd }) {
  const C = useC();
  const [query, setQuery] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const searchImages = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: "You search for Warhammer miniature painting references. Return ONLY a raw JSON array (no markdown, no preamble) of 4-6 items. Each item: {\"url\":\"...\",\"title\":\"...\",\"source\":\"...\"}.",
          messages: [{ role: "user", content: "Find Warhammer painting reference images for: \"" + query + "\"" }],
        }),
      });
      const data = await resp.json();
      const text = (data.content || []).map((b) => b.text || "").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResults(Array.isArray(parsed) ? parsed : []);
    } catch {
      setError("Search failed — paste an image URL below instead.");
    }
    setLoading(false);
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onAdd({ url: urlInput.trim(), title: "Reference image", source: "URL" });
    setUrlInput("");
  };

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => onAdd({ url: e.target.result, title: "Pasted image", source: "Clipboard" });
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      const text = await navigator.clipboard.readText();
      if (text.startsWith("http")) onAdd({ url: text.trim(), title: "Reference image", source: "Clipboard URL" });
    } catch { setError("Clipboard access denied — paste a URL below."); }
  }, [onAdd]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", border: "1px solid " + C.border, borderRadius: 6, background: C.bg }}>
          <i className="ti ti-photo-search" style={{ fontSize: 12, color: C.textHint }} aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchImages()}
            placeholder="Search for reference images…"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, color: C.textPri, flex: 1, fontFamily: "inherit" }} />
        </div>
        <button onClick={searchImages} disabled={loading} style={btn(C)}>
          {loading ? <i className="ti ti-loader" style={{ fontSize: 12 }} /> : "Search"}
        </button>
        <button onClick={handlePaste} title="Paste from clipboard" style={btn(C)}>
          <i className="ti ti-clipboard" style={{ fontSize: 12 }} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addUrl()}
          placeholder="Or paste an image URL…" style={inputSt(C)} />
        <button onClick={addUrl} style={btn(C, { flexShrink: 0 })}>Add</button>
      </div>
      {error && <p style={{ fontSize: 11, color: C.danger, margin: 0 }}>{error}</p>}
      {results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {results.map((r, i) => (
            <div key={i} style={{ border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden", background: C.bgAlt }}>
              <img src={r.url} alt={r.title} style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
              <div style={{ padding: "5px 7px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{r.title}</span>
                <button onClick={() => onAdd(r)} style={btn(C, { marginLeft: 5, flexShrink: 0 })}>+ Add</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepCard
// ---------------------------------------------------------------------------
function StepCard({ step, index, onUpdate, onDelete }) {
  const C = useC();
  const [editing, setEditing] = useState(false);
  const [addingPaints, setAddingPaints] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [desc, setDesc] = useState(step.desc);

  const removePaint = (key) => onUpdate({ ...step, paints: step.paints.filter((p) => p.key !== key) });
  const addPaint = (p) => { if (!step.paints.find((x) => x.key === p.key)) onUpdate({ ...step, paints: [...step.paints, p] }); };
  const saveEdit = () => { onUpdate({ ...step, title, desc }); setEditing(false); };

  return (
    <div style={{ ...card(C), borderLeft: "3px solid " + C.border }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: editing ? 8 : (step.desc ? 6 : 4) }}>
        <span style={{
          width: 22, height: 22, borderRadius: "50%",
          background: C.bgDeep, border: "1px solid " + C.border,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: C.textSec, flexShrink: 0, marginTop: 1,
        }}>{index + 1}</span>

        {editing ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputSt(C)} />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} style={{ ...inputSt(C), resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={saveEdit} style={btn(C, { background: C.accent, color: C.white, border: "1px solid " + C.accent })}>Save</button>
              <button onClick={() => setEditing(false)} style={btn(C)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textPri, flex: 1, lineHeight: 1.4 }}>{step.title}</span>
            <div style={{ display: "flex", gap: 3 }}>
              <button onClick={() => setEditing(true)} style={btn(C, { padding: "2px 6px" })} aria-label="Edit step">
                <i className="ti ti-edit" style={{ fontSize: 11 }} />
              </button>
              <button onClick={() => onDelete(step.id)} style={btn(C, { padding: "2px 6px", color: C.danger, borderColor: C.dangerBg })} aria-label="Delete step">
                <i className="ti ti-trash" style={{ fontSize: 11 }} />
              </button>
            </div>
          </>
        )}
      </div>

      {!editing && step.desc && (
        <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.55, margin: "0 0 8px 32px" }}>{step.desc}</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginLeft: 32, marginBottom: step.paints.length ? 8 : 4 }}>
        {step.paints.map((p) => <PaintChip key={p.key} paint={p} onRemove={() => removePaint(p.key)} />)}
      </div>

      <div style={{ marginLeft: 32 }}>
        {addingPaints ? (
          <div style={{ background: C.bgAlt, border: "1px solid " + C.borderSub, borderRadius: 6, padding: "10px 10px 6px" }}>
            <PaintSearch onAdd={addPaint} existingKeys={step.paints.map((p) => p.key)} />
            <button onClick={() => setAddingPaints(false)} style={{ ...btn(C), marginTop: 6 }}>Done</button>
          </div>
        ) : (
          <button onClick={() => setAddingPaints(true)}
            style={btn(C, { border: "1px dashed " + C.border, background: "transparent", color: C.textHint })}>
            <i className="ti ti-plus" style={{ fontSize: 11 }} /> Add paints
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SchemeView
// ---------------------------------------------------------------------------
function SchemeView({ scheme, onUpdate, onDelete, onDuplicate }) {
  const C = useC();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState(scheme.notes || "");
  const [showRefs, setShowRefs] = useState(false);
  const [addingStep, setAddingStep] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [coverExpanded, setCoverExpanded] = useState(false);
  const fileRef = useRef();

  const allPaints = Array.from(new Map(
    (scheme.steps || []).flatMap((s) => s.paints || []).map((p) => [p.key, p])
  ).values());

  const saveNotes = () => { onUpdate({ ...scheme, notes: notesVal }); setEditingNotes(false); };
  const addStep = () => {
    if (!newTitle.trim()) return;
    onUpdate({ ...scheme, steps: [...scheme.steps, { id: "st" + Date.now(), title: newTitle, desc: newDesc, paints: [] }] });
    setNewTitle(""); setNewDesc(""); setAddingStep(false);
  };
  const updateStep = (s) => onUpdate({ ...scheme, steps: scheme.steps.map((x) => x.id === s.id ? s : x) });
  const deleteStep = (id) => onUpdate({ ...scheme, steps: scheme.steps.filter((s) => s.id !== id) });
  const addRef = (ref) => onUpdate({ ...scheme, references: [...(scheme.references || []), { ...ref, id: "r" + Date.now() }] });
  const removeRef = (id) => onUpdate({ ...scheme, references: scheme.references.filter((r) => r.id !== id) });
  const handleCoverUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ ...scheme, coverImage: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Cover image */}
      <div style={{ border: "1px solid " + C.border, borderRadius: 10, overflow: "hidden", background: C.bgAlt }}>
        {scheme.coverImage ? (
          <>
            <img src={scheme.coverImage} alt="Cover" onClick={() => setCoverExpanded((v) => !v)}
              style={{ width: "100%", height: coverExpanded ? "auto" : 130, objectFit: coverExpanded ? "contain" : "cover", display: "block", cursor: "pointer", background: C.bgAlt }} />
            <div style={{ display: "flex", gap: 6, padding: "7px 10px", borderTop: "1px solid " + C.border, background: C.bgAlt }}>
              <button onClick={() => setCoverExpanded((v) => !v)} style={btn(C)}>
                <i className={"ti ti-" + (coverExpanded ? "minimize" : "maximize")} style={{ fontSize: 11 }} />
                {coverExpanded ? "Collapse" : "Expand"}
              </button>
              <button onClick={() => fileRef.current.click()} style={btn(C)}>
                <i className="ti ti-photo" style={{ fontSize: 11 }} /> Change image
              </button>
            </div>
          </>
        ) : (
          <div onClick={() => fileRef.current.click()}
            style={{ height: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}>
            <i className="ti ti-photo-plus" style={{ fontSize: 22, color: C.textHint }} aria-hidden="true" />
            <span style={{ fontSize: 11, color: C.textHint }}>Click to add cover image</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
      </div>

      {/* Notes */}
      <div style={{ ...card(C), background: C.bgAlt }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={sectionLabel(C)}>General notes</span>
          {!editingNotes && (
            <button onClick={() => { setEditingNotes(true); setNotesVal(scheme.notes || ""); }} style={btn(C)}>
              <i className="ti ti-edit" style={{ fontSize: 11 }} /> Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea value={notesVal} onChange={(e) => setNotesVal(e.target.value)} rows={3} autoFocus
              style={{ ...inputSt(C), resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={saveNotes} style={btn(C, { background: C.accent, color: C.white, border: "1px solid " + C.accent })}>Save</button>
              <button onClick={() => setEditingNotes(false)} style={btn(C)}>Cancel</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: scheme.notes ? C.textSec : C.textHint, lineHeight: 1.65, margin: 0 }}>
            {scheme.notes || "No general notes yet. Click Edit to add tips or context."}
          </p>
        )}
      </div>

      {/* Paint summary */}
      {allPaints.length > 0 && (
        <div style={{ ...card(C), background: C.bgDeep }}>
          <span style={sectionLabel(C)}>All paints in this scheme</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {allPaints.map((p) => <PaintChip key={p.key} paint={p} />)}
          </div>
        </div>
      )}

      {/* Steps */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={sectionLabel(C)}>Painting steps</span>
          <button onClick={() => setAddingStep(true)} style={btn(C)}>
            <i className="ti ti-plus" style={{ fontSize: 11 }} /> Add step
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(scheme.steps || []).map((step, idx) => (
            <StepCard key={step.id} step={step} index={idx} onUpdate={updateStep} onDelete={deleteStep} />
          ))}
          {addingStep && (
            <div style={{ ...card(C), borderStyle: "dashed", background: C.bgAlt }}>
              <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Step title (e.g. Base coat)" style={{ ...inputSt(C), marginBottom: 6 }} />
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)" rows={2} style={{ ...inputSt(C), resize: "none", marginBottom: 6 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addStep} style={btn(C, { background: C.accent, color: C.white, border: "1px solid " + C.accent })}>Add step</button>
                <button onClick={() => setAddingStep(false)} style={btn(C)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* References */}
      <div style={card(C)}>
        <button onClick={() => setShowRefs((v) => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5, width: "100%" }}
          aria-expanded={showRefs}>
          <i className={"ti ti-chevron-" + (showRefs ? "up" : "down")} style={{ fontSize: 12, color: C.textSec }} />
          <span style={{ ...sectionLabel(C), marginBottom: 0 }}>
            {"References" + (scheme.references && scheme.references.length ? " (" + scheme.references.length + ")" : "")}
          </span>
        </button>
        {showRefs && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <ImageSearch onAdd={addRef} />
            {scheme.references && scheme.references.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 7, marginTop: 4 }}>
                {scheme.references.map((ref) => (
                  <div key={ref.id} style={{ border: "1px solid " + C.border, borderRadius: 6, overflow: "hidden" }}>
                    <img src={ref.url} alt={ref.title} style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                    <div style={{ padding: "4px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bgAlt }}>
                      <span style={{ fontSize: 10, color: C.textSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{ref.source}</span>
                      <button onClick={() => removeRef(ref.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textHint, padding: 0 }}>
                        <i className="ti ti-x" style={{ fontSize: 10 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
        <button onClick={() => onDuplicate(scheme)} style={btn(C)}>
          <i className="ti ti-copy" style={{ fontSize: 11 }} /> Duplicate as template
        </button>
        <button onClick={() => { if (window.confirm("Delete this scheme?")) onDelete(scheme.id); }}
          style={btn(C, { color: C.danger, borderColor: C.dangerBg, background: C.dangerBg })}>
          <i className="ti ti-trash" style={{ fontSize: 11 }} /> Delete
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NewSchemeForm
// ---------------------------------------------------------------------------
function NewSchemeForm({ onSave, onCancel }) {
  const C = useC();
  const [name, setName] = useState("");
  const [faction, setFaction] = useState("");
  const submit = () => {
    if (!name.trim()) return;
    onSave({ id: "s" + Date.now(), name, faction, coverImage: null, notes: "", steps: [], references: [], tags: [] });
  };
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, background: C.bg }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: C.textPri, margin: 0 }}>New scheme</p>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Scheme name" style={inputSt(C)} />
      <input value={faction} onChange={(e) => setFaction(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Faction / army" style={inputSt(C)} />
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={submit} style={btn(C, { background: C.accent, color: C.white, border: "1px solid " + C.accent })}>Create</button>
        <button onClick={onCancel} style={btn(C)}>Cancel</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
function PaintSchemeTracker() {
  const { theme } = useTheme();
  const C = theme === "dark" ? DARK : LIGHT;

  const [schemes, setSchemes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filterFaction, setFilterFaction] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          setSchemes(parsed);
          if (parsed.length) setSelectedId(parsed[0].id);
        } else {
          setSchemes(SAMPLE_SCHEMES);
          setSelectedId(SAMPLE_SCHEMES[0].id);
        }
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            setSchemes(parsed);
            if (parsed.length) setSelectedId(parsed[0].id);
          } else {
            setSchemes(SAMPLE_SCHEMES);
            setSelectedId(SAMPLE_SCHEMES[0].id);
          }
        } catch {
          setSchemes(SAMPLE_SCHEMES);
          setSelectedId(SAMPLE_SCHEMES[0].id);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const persist = async (updated) => {
    setSchemes(updated);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(updated)); } catch {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    }
  };

  const updateScheme = (s) => persist(schemes.map((x) => x.id === s.id ? s : x));
  const deleteScheme = (id) => {
    const next = schemes.filter((s) => s.id !== id);
    persist(next);
    setSelectedId(next.length ? next[0].id : null);
  };
  const addScheme = (s) => { persist([...schemes, s]); setSelectedId(s.id); setAddingNew(false); };
  const duplicateScheme = (s) => {
    const now = Date.now();
    const copy = { ...s, id: "s" + now, name: s.name + " (copy)",
      steps: s.steps.map((st, i) => ({ ...st, id: "st" + now + i })), references: [] };
    addScheme(copy);
  };

  const allFactions = ["All"].concat(Array.from(new Set(schemes.map((s) => s.faction).filter(Boolean))));
  const filtered = filterFaction === "All" ? schemes : schemes.filter((s) => s.faction === filterFaction);
  const selected = schemes.find((s) => s.id === selectedId);

  if (loading) return (
    <ColorsContext.Provider value={C}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.textHint, fontSize: 13 }}>
        <i className="ti ti-loader" style={{ fontSize: 18, marginRight: 8 }} aria-hidden="true" /> Loading…
      </div>
    </ColorsContext.Provider>
  );

  return (
    <ColorsContext.Provider value={C}>
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden", background: C.bgAlt, fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 13, color: C.textPri }}>

        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0, background: C.bgDeep, borderRight: "2px solid " + C.border, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid " + C.border, background: C.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <i className="ti ti-palette" style={{ fontSize: 16, color: C.accent }} aria-hidden="true" />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.textPri }}>Paint schemes</span>
            </div>
            <select value={filterFaction} onChange={(e) => setFilterFaction(e.target.value)}
              style={{ width: "100%", fontSize: 11, padding: "5px 8px", border: "1px solid " + C.border, borderRadius: 6, background: C.bgAlt, color: C.textSec, fontFamily: "inherit" }}>
              {allFactions.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {filtered.map((s) => {
              const active = s.id === selectedId;
              return (
                <div key={s.id} onClick={() => { setSelectedId(s.id); setAddingNew(false); }}
                  style={{
                    padding: "9px 11px", borderRadius: 8, cursor: "pointer", marginBottom: 3,
                    border: "1px solid " + (active ? C.accent : C.borderSub),
                    background: active ? C.bg : "transparent",
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textPri, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: C.textHint }}>
                    {s.faction && <span style={{ marginRight: 6, color: C.accent, fontWeight: 600 }}>{s.faction}</span>}
                    {(s.steps || []).length > 0 && <span>{s.steps.length} steps</span>}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p style={{ fontSize: 12, color: C.textHint, padding: "10px 4px" }}>No schemes for this faction.</p>
            )}
          </div>

          <div style={{ padding: 10, borderTop: "1px solid " + C.border, background: C.bg }}>
            <button onClick={() => setAddingNew(true)}
              style={{ width: "100%", padding: 8, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 6, background: C.accentBg, border: "1px solid " + C.accent, color: C.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
              <i className="ti ti-plus" style={{ fontSize: 13 }} /> New scheme
            </button>
          </div>
        </aside>

        {/* Main panel */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {addingNew ? (
            <NewSchemeForm onSave={addScheme} onCancel={() => setAddingNew(false)} />
          ) : selected ? (
            <>
              <div style={{ padding: "13px 18px", borderBottom: "2px solid " + C.border, background: C.bg, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.textPri }}>{selected.name}</span>
                  {selected.faction && (
                    <span style={{ fontSize: 10, padding: "2px 9px", borderRadius: 99, background: C.accentBg, color: C.accent, fontWeight: 700, border: "1px solid " + C.accent }}>{selected.faction}</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: C.textHint }}>
                  {(selected.steps || []).length} steps &middot; {new Set((selected.steps || []).flatMap((s) => (s.paints || []).map((p) => p.key))).size} paints
                </span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                <SchemeView scheme={selected} onUpdate={updateScheme} onDelete={deleteScheme} onDuplicate={duplicateScheme} />
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: 10, color: C.textHint }}>
              <i className="ti ti-palette" style={{ fontSize: 36 }} aria-hidden="true" />
              <p style={{ fontSize: 13 }}>Select a scheme or create a new one</p>
            </div>
          )}
        </main>
      </div>
    </ColorsContext.Provider>
  );
}

export default PaintSchemeTracker;
