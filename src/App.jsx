import { useState, useRef, useEffect } from "react";
import storage from "./lib/storage";
import herbIcon from "./assets/herb.svg";

/* ═══════ THEME ═══════ */
const LIGHT = {
  bg: "#fff", sidebar: "#f8f8f5", border: "#ddd", text: "#111", textSub: "#888", textMuted: "#aaa",
  chatBg: "#fff", userBubble: "#e6f1fb", userText: "#185fa5", aiBubble: "#f5f5f0", aiText: "#111",
  mergeBubble: "#fef9ef", mergeText: "#854F0B", accent: "#1A1A2E", accentText: "#fff",
  graphBg: "#f8f8f5", hover: "#fff", hoverSidebar: "#f5f5f0", codeBg: "#1e1e2e", codeText: "#cdd6f4",
  inlineCode: "#e8e8e4",
};
const DARK = {
  bg: "#1a1a2e", sidebar: "#16162a", border: "#2a2a4a", text: "#e0e0e0", textSub: "#888", textMuted: "#666",
  chatBg: "#1a1a2e", userBubble: "#1e3a5f", userText: "#7db8f0", aiBubble: "#242444", aiText: "#d0d0d0",
  mergeBubble: "#3a2a10", mergeText: "#f0c060", accent: "#3a3a6e", accentText: "#fff",
  graphBg: "#16162a", hover: "#242444", hoverSidebar: "#1e1e3a", codeBg: "#0e0e1e", codeText: "#cdd6f4",
  inlineCode: "#2a2a4a",
};

/* ═══════ MARKDOWN ═══════ */
function renderInline(text, keyRef, t) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIdx = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(<span key={keyRef.k++}>{text.slice(lastIdx, match.index)}</span>);
    if (match[2]) parts.push(<strong key={keyRef.k++}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={keyRef.k++}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={keyRef.k++} style={{ background: t.inlineCode, padding: "1px 4px", borderRadius: 3, fontSize: "0.9em", fontFamily: "monospace" }}>{match[4]}</code>);
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) parts.push(<span key={keyRef.k++}>{text.slice(lastIdx)}</span>);
  return parts;
}

function renderMd(text, t) {
  if (!text) return null;
  const kr = { k: 0 };
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      i++;
      elements.push(
        <pre key={kr.k++} style={{ background: t.codeBg, color: t.codeText, padding: "10px 12px", borderRadius: 8, fontSize: 12, lineHeight: 1.5, overflowX: "auto", fontFamily: "monospace", margin: "6px 0" }}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }
    if (line.startsWith("### ")) { elements.push(<div key={kr.k++} style={{ fontSize: 13, fontWeight: 700, margin: "10px 0 4px" }}>{renderInline(line.slice(4), kr, t)}</div>); i++; continue; }
    if (line.startsWith("## ")) { elements.push(<div key={kr.k++} style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 4px" }}>{renderInline(line.slice(3), kr, t)}</div>); i++; continue; }
    if (line.startsWith("# ")) { elements.push(<div key={kr.k++} style={{ fontSize: 16, fontWeight: 700, margin: "14px 0 4px" }}>{renderInline(line.slice(2), kr, t)}</div>); i++; continue; }
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      elements.push(<ul key={kr.k++} style={{ margin: "4px 0", paddingLeft: 20 }}>{items.map(it => <li key={kr.k++} style={{ fontSize: 13, lineHeight: 1.7 }}>{renderInline(it, kr, t)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      elements.push(<ol key={kr.k++} style={{ margin: "4px 0", paddingLeft: 20 }}>{items.map(it => <li key={kr.k++} style={{ fontSize: 13, lineHeight: 1.7 }}>{renderInline(it, kr, t)}</li>)}</ol>);
      continue;
    }
    if (line.trim() === "") { elements.push(<div key={kr.k++} style={{ height: 6 }} />); i++; continue; }
    elements.push(<div key={kr.k++} style={{ fontSize: 13, lineHeight: 1.7 }}>{renderInline(line, kr, t)}</div>);
    i++;
  }
  return elements;
}

/* ═══════ ICONS ═══════ */
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

/* ═══════ DATA ═══════ */
let cc = 100;
function mkId() { return "c" + (++cc) + "_" + Math.random().toString(36).slice(2, 5); }
function mkCommit(parentId, prompt, response, branch, mergeIds) {
  return { id: mkId(), parentId, mergeIds: mergeIds || [], prompt, response, branch, ts: Date.now() };
}
function getThread(commits, hid) {
  const t = []; let id = hid; const v = new Set();
  while (id && !v.has(id)) { v.add(id); const c = commits.find(x => x.id === id); if (!c) break; t.unshift(c); id = c.parentId; }
  return t;
}
function bNames(c) { return [...new Set(c.map(x => x.branch))]; }
function bHead(c, b) { const bc = c.filter(x => x.branch === b); return bc.length ? bc[bc.length - 1] : null; }

/* ═══════ COLORS ═══════ */
const BC = ["#1D9E75", "#378ADD", "#D85A30", "#D4537E", "#7F77DD", "#BA7517", "#E24B4A", "#639922"];
function bCol(names, b) { return BC[names.indexOf(b) % BC.length] || "#888"; }

/* ═══════ TIMELINE HELPERS ═══════ */
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
function formatDate(d) {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function formatDateLabel(d) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function formatHour(h) {
  if (h === 0 || h === 12) return (h === 0 ? "12" : "12") + (h < 12 ? " AM" : " PM");
  return (h > 12 ? h - 12 : h) + (h < 12 ? " AM" : " PM");
}

function parseShowDate(input) {
  const msg = input.trim();
  if (msg === "/show today") {
    const d = new Date(); d.setHours(0,0,0,0);
    return { date: d, label: "Today" };
  }
  if (msg === "/show yesterday") {
    const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0,0,0,0);
    return { date: d, label: "Yesterday" };
  }
  const m = msg.match(/^\/show\s+(\d{6})$/);
  if (m) {
    const s = m[1];
    const mm = parseInt(s.slice(0,2),10), dd = parseInt(s.slice(2,4),10), yy = parseInt(s.slice(4,6),10);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { error: "Invalid date: month must be 01-12, day 01-31" };
    const d = new Date(2000 + yy, mm - 1, dd);
    if (d.getMonth() !== mm - 1 || d.getDate() !== dd) return { error: "Invalid date: " + s };
    d.setHours(0,0,0,0);
    return { date: d, label: formatDateLabel(d) };
  }
  if (msg.startsWith("/show")) return { error: "Usage: /show today, /show yesterday, or /show MMDDYY" };
  return null;
}

function detectSessions(conv, targetDate) {
  const cms = conv.commits || [];
  if (!cms.length) return [];
  const dayStart = targetDate.getTime();
  const dayEnd = dayStart + 86400000;

  // Collect all timestamps for this conversation on target date
  const allTs = [];
  cms.forEach(cm => {
    if (cm.ts) allTs.push(cm.ts);
    if (cm.responseTs) allTs.push(cm.responseTs);
  });
  allTs.sort((a, b) => a - b);
  const dayTs = allTs.filter(ts => ts >= dayStart && ts < dayEnd);
  if (!dayTs.length) return [];

  // Split into sessions (30min gap)
  const sessions = [];
  let sessionStart = dayTs[0];
  let prev = dayTs[0];
  for (let i = 1; i < dayTs.length; i++) {
    if (dayTs[i] - prev >= 30 * 60 * 1000) {
      sessions.push({ startTime: sessionStart, isPrimary: sessions.length === 0 });
      sessionStart = dayTs[i];
    }
    prev = dayTs[i];
  }
  sessions.push({ startTime: sessionStart, isPrimary: sessions.length === 0 });
  return sessions;
}


/* ═══════ GIT GRAPH ═══════ */
function Graph({ commits, headId, activeBranch, names, onCheckout, onEdit, onNew, onDelete, mergeMode, selected, onToggleSel, parentRef, onGoToParent, childRefs, onGoToChild, hoveredCid, panelW, t, readOnly }) {
  const [ctx, setCtx] = useState(null);
  const hasParent = !!parentRef;

  // Build vnodes with individual timestamps, then sort chronologically
  const unsorted = [];
  if (hasParent) {
    unsorted.push({ vid: "ghost", cid: null, type: "ghost", branch: "main", label: parentRef.promptSummary || "Parent conversation", parentVid: null, mergeVids: [], _ts: 0 });
  }
  commits.forEach(cm => {
    unsorted.push({ vid: cm.id + "_p", cid: cm.id, type: "p", branch: cm.branch, label: cm.prompt || "", parentVid: cm.parentId ? cm.parentId + "_r" : (hasParent ? "ghost" : null), mergeVids: (cm.mergeIds || []).map(m => m + "_r"), _ts: cm.ts });
    const rTs = cm.responseTs || (cm.ts + 1);
    const aiSum = cm.response ? cm.response.replace(/\*\*/g, "").replace(/\n/g, " ").trim() : "...";
    unsorted.push({ vid: cm.id + "_r", cid: cm.id, type: "r", branch: cm.branch, label: aiSum, parentVid: cm.id + "_p", mergeVids: [], _ts: rTs });
    if (childRefs) {
      childRefs.filter(cr => cr.commitId === cm.id).forEach(cr => {
        unsorted.push({ vid: "child_" + cr.convId, cid: null, type: "child", branch: cm.branch, label: cr.convTitle, parentVid: cm.id + "_r", mergeVids: [], childConvId: cr.convId, _ts: rTs + 1 });
      });
    }
  });
  const vnodes = unsorted.sort((a, b) => a._ts - b._ts);

  if (!vnodes.length) return <div style={{ padding: 20, textAlign: "center", color: t.textMuted, fontSize: 12 }}>Start a conversation</div>;

  const lW = 22, rH = 36, pL = 18, nR = 6;
  const lX = pL + Math.max(names.length, 1) * lW + 10;
  const W = panelW || 280, H = vnodes.length * rH + 30;
  const maxChars = Math.max(12, Math.floor((W - lX - 20) / 5.5));
  const trunc = (s, n) => s && s.length > n ? s.slice(0, n) + ".." : s;
  const pos = {};
  vnodes.forEach((n, i) => {
    const lane = n.type === "ghost" ? 0 : names.indexOf(n.branch);
    pos[n.vid] = { x: pL + lane * lW, y: 18 + i * rH };
  });

  return (
    <div className="graph-scroll" style={{ overflowY: "auto", overflowX: "hidden", flex: 1, position: "relative" }} onClick={() => setCtx(null)}>
      {/* Branch tabs */}
      <div style={{ padding: "6px 8px", display: "flex", flexWrap: "wrap", gap: 3, borderBottom: "0.5px solid " + t.border, position: "sticky", top: 0, background: t.graphBg, zIndex: 2 }}>
        {names.map(b => {
          const c = bCol(names, b), act = b === activeBranch;
          return <button key={b} onClick={() => { if (readOnly) return; const h = bHead(commits, b); if (h) onCheckout(h.id, b); }}
            style={{ fontSize: 8, padding: "2px 7px", borderRadius: 3, cursor: readOnly ? "default" : "pointer", fontFamily: "monospace", fontWeight: act ? 600 : 400, background: act ? c + "20" : "transparent", color: c, border: act ? "1px solid " + c + "50" : "0.5px solid " + t.border }}>
            {b}{act ? " \u25CF" : ""}
          </button>;
        })}
      </div>

      <svg width={W} height={H} style={{ display: "block" }}>
        {names.map(b => {
          const bv = vnodes.filter(n => n.branch === b && n.type !== "ghost");
          if (!bv.length) return null;
          const p1 = pos[bv[0].vid], p2 = pos[bv[bv.length - 1].vid];
          if (!p1 || !p2) return null;
          return <line key={b} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={bCol(names, b)} strokeWidth="2" opacity="0.25" />;
        })}

        {vnodes.map(n => {
          const to = pos[n.vid]; if (!to) return null;
          const parents = [n.parentVid, ...(n.mergeVids || [])].filter(Boolean);
          return parents.map(pid => {
            const fr = pos[pid]; if (!fr) return null;
            const isGhostEdge = pid === "ghost" || n.type === "child";
            const col = isGhostEdge ? t.textMuted : bCol(names, n.branch);
            const isMrg = n.mergeVids?.includes(pid);
            const dash = (isMrg || isGhostEdge) ? "4 3" : "none";
            const op = (isMrg || isGhostEdge) ? 0.3 : 0.35;
            const sw = (isMrg || isGhostEdge) ? 1.5 : 2;
            if (fr.x === to.x) return <line key={pid + "-" + n.vid} x1={fr.x} y1={fr.y + nR + 1} x2={to.x} y2={to.y - nR - 1} stroke={col} strokeWidth={sw} opacity={op} strokeDasharray={dash} />;
            const mY = (fr.y + to.y) / 2;
            return <path key={pid + "-" + n.vid} d={`M${fr.x} ${fr.y + nR + 1} C${fr.x} ${mY} ${to.x} ${mY} ${to.x} ${to.y - nR - 1}`} fill="none" stroke={col} strokeWidth={sw} opacity={op} strokeDasharray={dash} />;
          });
        })}

        {vnodes.map(n => {
          const p = pos[n.vid]; if (!p) return null;

          if (n.type === "ghost") {
            return (
              <g key={n.vid} style={{ cursor: readOnly ? "default" : "pointer" }} onClick={e => { e.stopPropagation(); if (!readOnly) onGoToParent(); }}>
                <circle cx={p.x} cy={p.y} r={5} fill="none" stroke={t.textMuted} strokeWidth="1.5" strokeDasharray="3 2" />
                <text x={lX} y={p.y - 2} fontSize="9" fill={t.textMuted} fontStyle="italic" style={{ fontFamily: "system-ui" }}>
                  {trunc(n.label, maxChars)}
                </text>
                <text x={lX} y={p.y + 9} fontSize="7" fill={t.textMuted} style={{ fontFamily: "monospace" }}>
                  {"\u2197 go to parent chat"}
                </text>
              </g>
            );
          }

          if (n.type === "child") {
            return (
              <g key={n.vid} style={{ cursor: readOnly ? "default" : "pointer" }} onClick={e => { e.stopPropagation(); if (!readOnly) onGoToChild(n.childConvId); }}>
                <circle cx={p.x} cy={p.y} r={5} fill="none" stroke={t.textMuted} strokeWidth="1.5" strokeDasharray="3 2" />
                <text x={lX} y={p.y - 2} fontSize="9" fill={t.textMuted} fontStyle="italic" style={{ fontFamily: "system-ui" }}>
                  {"\u2198 " + trunc(n.label, maxChars - 2)}
                </text>
                <text x={lX} y={p.y + 9} fontSize="7" fill={t.textMuted} style={{ fontFamily: "monospace" }}>
                  go to child chat
                </text>
              </g>
            );
          }

          const col = bCol(names, n.branch);
          const cm = commits.find(c => c.id === n.cid);
          const cur = cm?.id === headId;
          const isPr = n.type === "p";
          const isMrg = (cm?.mergeIds || []).length > 0 && isPr;
          const sel = selected?.includes(n.cid);
          const hov = hoveredCid === n.cid;
          const r = cur ? 5 : (isMrg ? 5 : nR);

          return (
            <g key={n.vid} style={{ cursor: readOnly ? "default" : "pointer" }}
              onClick={e => { e.stopPropagation(); if (readOnly) return; setCtx(null); if (mergeMode) { onToggleSel(n.cid); return; } if (cm) onCheckout(cm.id, cm.branch); }}
              onContextMenu={e => { if (readOnly) return; e.preventDefault(); e.stopPropagation(); setCtx({ x: e.clientX, y: e.clientY, cid: n.cid, isPrompt: isPr }); }}>
              {(cur || sel || hov) && <circle cx={p.x} cy={p.y} r={hov ? 11 : 9} fill={sel ? "#BA7517" : col} opacity={hov ? 0.25 : 0.15} />}
              {isMrg
                ? <rect x={p.x - r} y={p.y - r} width={r * 2} height={r * 2} rx={2} fill={col} stroke={col} strokeWidth="1.5" />
                : <circle cx={p.x} cy={p.y} r={r} fill={isPr ? t.bg : col} stroke={sel ? "#BA7517" : col} strokeWidth={cur ? 2.5 : (hov ? 2.5 : 1.5)} />}
              {sel && <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">{"\u2713"}</text>}
              <text x={lX} y={p.y - 2} fontSize="9" fontWeight={(cur || hov) ? "600" : "400"} fill={(cur || hov) ? col : isPr ? t.text : t.textSub} style={{ fontFamily: "system-ui" }}>
                {isMrg ? "\u2B85 " : ""}{trunc(n.label, maxChars)}
              </text>
              <text x={lX} y={p.y + 9} fontSize="7" fill={t.textMuted} style={{ fontFamily: "monospace" }}>
                {n.branch} {n.cid.slice(0, 7)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Context menu */}
      {!readOnly && ctx && !ctx.confirm && (
        <div style={{ position: "fixed", left: ctx.x, top: ctx.y, zIndex: 100, background: t.bg, border: "0.5px solid " + t.border, borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", padding: "4px 0", minWidth: 110 }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => { const cid = ctx.cid; setCtx(null); onEdit(cid); }}
            style={{ display: "block", width: "100%", padding: "6px 14px", fontSize: 11, color: t.text, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverSidebar} onMouseLeave={e => e.currentTarget.style.background = "none"}>
            edit
          </button>
          <button onClick={() => { const cid = ctx.cid; setCtx(null); onNew(cid); }}
            style={{ display: "block", width: "100%", padding: "6px 14px", fontSize: 11, color: "#378ADD", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverSidebar} onMouseLeave={e => e.currentTarget.style.background = "none"}>
            new
          </button>
          <div style={{ height: 1, background: t.border, margin: "4px 0" }} />
          <button onClick={() => setCtx({ ...ctx, confirm: true })}
            style={{ display: "block", width: "100%", padding: "6px 14px", fontSize: 11, color: "#c00", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fee"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
            delete
          </button>
        </div>
      )}

      {!readOnly && ctx && ctx.confirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.1)" }} onClick={() => setCtx(null)}>
          <div style={{ position: "fixed", left: ctx.x, top: ctx.y, zIndex: 100, background: t.bg, border: "0.5px solid " + t.border, borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.15)", padding: "12px 14px", minWidth: 200 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text, marginBottom: 10 }}>Delete this commit and all its children?</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { const cid = ctx.cid; setCtx(null); onDelete(cid); }}
                style={{ flex: 1, padding: "6px", fontSize: 11, fontWeight: 500, borderRadius: 5, background: "#c00", color: "#fff", border: "none", cursor: "pointer" }}>Delete</button>
              <button onClick={() => setCtx(null)}
                style={{ flex: 1, padding: "6px", fontSize: 11, borderRadius: 5, background: "transparent", border: "0.5px solid " + t.border, cursor: "pointer", color: t.textSub }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ TIMELINE VIEW ═══════ */
function TimelineView({ date, label, convs, onGoToConv, onBack, t }) {
  const [hovCard, setHovCard] = useState(null);
  const scrollRef = useRef(null);
  const dayStart = date.getTime();
  const dayEnd = dayStart + 86400000;

  // Build cards from all conversations with sessions on this day
  const cards = [];
  let colorIdx = 0;
  convs.forEach(cv => {
    const sessions = detectSessions(cv, date);
    if (!sessions.length) return;
    const color = BC[colorIdx % BC.length];
    const names = bNames(cv.commits || []);
    const lastPrompt = (cv.commits || []).filter(c => c.prompt).slice(-1)[0]?.prompt || "";
    const mergeCount = (cv.commits || []).filter(c => (c.mergeIds || []).length > 0).length;
    const commitCount = (cv.commits || []).length;
    sessions.forEach(s => {
      cards.push({
        key: cv.id + "_" + s.startTime,
        convId: cv.id,
        conv: cv,
        startTime: s.startTime,
        isPrimary: s.isPrimary,
        color,
        names,
        lastPrompt,
        mergeCount,
        commitCount,
      });
    });
    colorIdx++;
  });

  cards.sort((a, b) => a.startTime - b.startTime);

  // 12 AM – 11 PM range (0–23), but hide the 12 AM label
  const minHour = 0, maxHour = 23;
  const hourPx = 100;
  const totalH = 24 * hourPx;

  // Find first activity hour for auto-scroll
  let firstActivityHour = -1;
  if (cards.length) {
    firstActivityHour = new Date(cards[0].startTime).getHours();
  }

  // Auto-scroll to first activity
  useEffect(() => {
    if (scrollRef.current && firstActivityHour >= 0) {
      const scrollTo = Math.max(0, firstActivityHour * hourPx - 20);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [firstActivityHour]);

  // Position cards
  const PRIMARY_H = 72, CONTINUED_H = 34;
  const positioned = cards.map(c => {
    const d = new Date(c.startTime);
    const minutesSinceStart = d.getHours() * 60 + d.getMinutes();
    const top = (minutesSinceStart / 60) * hourPx;
    const h = c.isPrimary ? PRIMARY_H : CONTINUED_H;
    return { ...c, top, height: h };
  });

  // Overlap resolution
  const groups = [];
  const used = new Set();
  for (let i = 0; i < positioned.length; i++) {
    if (used.has(i)) continue;
    const group = [i];
    used.add(i);
    let groupBottom = positioned[i].top + positioned[i].height;
    for (let j = i + 1; j < positioned.length; j++) {
      if (used.has(j)) continue;
      if (positioned[j].top < groupBottom) {
        group.push(j);
        used.add(j);
        groupBottom = Math.max(groupBottom, positioned[j].top + positioned[j].height);
      }
    }
    groups.push(group);
  }
  const layout = new Array(positioned.length);
  groups.forEach(group => {
    const n = group.length;
    group.forEach((idx, i) => {
      layout[idx] = { widthPct: 100 / n, leftPct: (100 / n) * i };
    });
  });

  const headerLabel = (label === "Today" || label === "Yesterday")
    ? label + " \u2014 " + formatDate(date)
    : label;

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "0.5px solid " + t.border, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "0.5px solid " + t.border, background: "transparent", color: t.textSub, cursor: "pointer" }}>
          &larr; Back
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{headerLabel}</div>
      </div>

      {cards.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, fontSize: 14 }}>
          No conversations on this date
        </div>
      ) : (
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px 16px 10px 70px" }}>
          <div style={{ position: "relative", height: totalH }}>
            {/* Hour lines + labels */}
            {Array.from({ length: maxHour - minHour + 1 }, (_, i) => {
              const h = minHour + i;
              const y = i * hourPx;
              if (h === 0) return null;
              return (
                <div key={h}>
                  <div style={{ position: "absolute", left: -60, top: y - 7, fontSize: 10, color: t.textMuted, width: 50, textAlign: "right", fontFamily: "monospace" }}>
                    {formatHour(h)}
                  </div>
                  <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, background: t.border, opacity: 0.5 }} />
                </div>
              );
            })}

            {/* Cards */}
            {positioned.map((c, idx) => {
              const l = layout[idx];
              const isHov = hovCard === c.key;
              if (c.isPrimary) {
                return (
                  <div key={c.key}
                    onClick={() => onGoToConv(c.conv)}
                    onMouseEnter={() => setHovCard(c.key)}
                    onMouseLeave={() => setHovCard(null)}
                    style={{
                      position: "absolute", top: c.top, height: c.height,
                      left: l.leftPct + "%", width: l.widthPct + "%",
                      boxSizing: "border-box", paddingRight: 6,
                      cursor: "pointer",
                    }}>
                    <div style={{
                      height: "100%", display: "flex", flexDirection: "column", justifyContent: "center",
                      padding: "8px 14px 8px 11px",
                      background: t.bg, borderRadius: "0 8px 8px 0",
                      borderLeft: "3px solid " + c.color,
                      border: "0.5px solid " + (isHov ? t.textMuted : t.border),
                      borderLeftWidth: 3, borderLeftColor: c.color,
                      transition: "border-color 0.15s",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.conv.title || "Untitled"}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                        {c.lastPrompt}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#E1F5EE", color: "#0F6E56" }}>{c.names.length} {c.names.length === 1 ? "branch" : "branches"}</span>
                        {c.mergeCount > 0 && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#FAEEDA", color: "#854F0B" }}>{c.mergeCount} {c.mergeCount === 1 ? "merge" : "merges"}</span>}
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "transparent", border: "0.5px solid " + t.border, color: t.textSub }}>{c.commitCount} {c.commitCount === 1 ? "commit" : "commits"}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              // Continued card
              return (
                <div key={c.key}
                  onClick={() => onGoToConv(c.conv)}
                  onMouseEnter={() => setHovCard(c.key)}
                  onMouseLeave={() => setHovCard(null)}
                  style={{
                    position: "absolute", top: c.top, height: c.height,
                    left: l.leftPct + "%", width: l.widthPct + "%",
                    boxSizing: "border-box", paddingRight: 6,
                    cursor: "pointer", opacity: 0.55,
                  }}>
                  <div style={{
                    height: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 14px 6px 0",
                    background: t.bg, borderRadius: "0 6px 6px 0",
                    borderLeft: "3px solid " + c.color,
                    border: "0.5px solid " + (isHov ? t.textMuted : t.border),
                    borderLeftWidth: 3, borderLeftColor: c.color,
                    transition: "border-color 0.15s",
                  }}>
                    <div style={{ marginLeft: 8, flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: c.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.conv.title || "Untitled"}
                      </span>
                      <span style={{ fontSize: 10, color: t.textMuted, flexShrink: 0 }}>continued</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ MAIN ═══════ */
export default function App() {
  const [dark, setDark] = useState(() => storage.get("theme")?.value === "dark");
  const t = dark ? DARK : LIGHT;

  const [commits, setCommits] = useState([]);
  const [headId, setHeadId] = useState(null);
  const [branch, setBranch] = useState("main");
  const [input, setInput] = useState("");
  const [graph, setGraph] = useState(true);
  const [mm, setMm] = useState(false);
  const [sel, setSel] = useState([]);
  const [editId, setEditId] = useState(null);
  const [newFromRef, setNewFromRef] = useState(null);
  const [convs, setConvs] = useState([]);
  const [convId, setConvId] = useState(null);
  const [parentRef, setParentRef] = useState(null);
  const [graphW, setGraphW] = useState(280);
  const [scrollTarget, setScrollTarget] = useState(null);
  const [hoveredCid, setHoveredCid] = useState(null);
  const [chatMenu, setChatMenu] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [timelineView, setTimelineView] = useState(null); // null | { date: Date, label: string }

  // Turn-based state: "prompt" or "response"
  const [turn, setTurn] = useState("prompt");

  const dragging = useRef(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const cRef = useRef(commits); cRef.current = commits;

  // Persist theme
  useEffect(() => { storage.set("theme", dark ? "dark" : "light"); }, [dark]);

  // Load conversations
  useEffect(() => {
    const r = storage.list("conv:");
    if (r?.keys?.length) {
      const cs = [];
      for (const k of r.keys) { const p = storage.get(k); if (p?.value) { try { cs.push(JSON.parse(p.value)); } catch {} } }
      const sorted = cs.sort((a, b) => (b.u || "").localeCompare(a.u || ""));
      setConvs(sorted);
    }
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [commits, headId]);

  useEffect(() => {
    if (scrollTarget) {
      const el = document.getElementById("cm-" + scrollTarget);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollTarget(null);
    }
  }, [scrollTarget, headId]);

  const save = (title, cm, hid, br, pRef, forceNewId) => {
    const id = forceNewId || convId || "conv:" + Date.now();
    const existing = convs.find(c => c.id === id);
    const finalTitle = existing?.title || title || (cm.length > 0 ? cm[0].prompt?.slice(0, 40) : "Untitled");
    const cv = { id, title: finalTitle, commits: cm, headId: hid, branch: br, parentRef: pRef || parentRef || null, u: new Date().toISOString() };
    storage.set(id, JSON.stringify(cv));
    setConvs(p => [cv, ...p.filter(c => c.id !== id)]);
    setConvId(id);
  };

  const load = cv => {
    setCommits(cv.commits || []); setHeadId(cv.headId); setBranch(cv.branch || "main");
    setConvId(cv.id); setParentRef(cv.parentRef || null);
    cc = Math.max(cc, (cv.commits || []).length + 10);
    setMm(false); setSel([]); setEditId(null); setNewFromRef(null);
    setTimelineView(null);
    // Determine turn: if last commit has empty response, we're in response turn
    const lastCommit = (cv.commits || []).length > 0 ? (cv.commits || [])[(cv.commits || []).length - 1] : null;
    if (lastCommit && lastCommit.response === "") {
      setTurn("response");
    } else {
      setTurn("prompt");
    }
  };
  const del = id => { storage.del(id); setConvs(p => p.filter(c => c.id !== id)); if (convId === id) { setCommits([]); setHeadId(null); setConvId(null); setParentRef(null); setTurn("prompt"); } };
  const renameConv = (id, newTitle) => {
    const cv = convs.find(c => c.id === id);
    if (!cv || !newTitle.trim()) return;
    const updated = { ...cv, title: newTitle.trim(), u: new Date().toISOString() };
    storage.set(id, JSON.stringify(updated));
    setConvs(p => p.map(c => c.id === id ? updated : c));
  };
  const newConv = () => { setCommits([]); setHeadId(null); setBranch("main"); setConvId(null); setParentRef(null); setMm(false); setSel([]); setEditId(null); setNewFromRef(null); setTurn("prompt"); setTimelineView(null); };

  const thread = getThread(commits, headId);
  const names = bNames(commits);

  const childRefs = convId ? convs.filter(cv => cv.parentRef?.convId === convId && cv.id !== convId).map(cv => ({
    convId: cv.id, commitId: cv.parentRef.commitId, convTitle: cv.title || "Untitled",
  })) : [];

  const showGraph = graph || commits.length > 0;

  // ─── SEND (turn-based) ───
  const send = () => {
    if (!input.trim()) return;
    const msg = input.trim();

    // Check for /show commands
    if (msg.startsWith("/show")) {
      setInput("");
      const parsed = parseShowDate(msg);
      if (!parsed) { /* not a /show command, fall through */ }
      else if (parsed.error) {
        // Show error as a commit in current conversation
        const errCm = mkCommit(headId, msg, parsed.error, branch);
        const nc = [...cRef.current, errCm]; setCommits(nc); cRef.current = nc; setHeadId(errCm.id);
        return;
      } else {
        setTimelineView({ date: parsed.date, label: parsed.label });
        return;
      }
    }

    setInput("");
    let pid = headId, br = branch;

    // Auto-show graph on first message
    if (!graph && commits.length === 0) setGraph(true);

    // ── Response turn ──
    if (turn === "response") {
      // Find the last commit (the one with empty response) and fill it
      const lastCommit = cRef.current.find(c => c.id === headId);
      if (lastCommit) {
        const nc = cRef.current.map(c => c.id === headId ? { ...c, response: msg, responseTs: Date.now() } : c);
        setCommits(nc); cRef.current = nc;
        save(null, nc, headId, br);
      }
      setTurn("prompt");
      return;
    }

    // ── Prompt turn ──

    // newFromRef: create new conversation from a parent commit
    if (newFromRef) {
      const pRef = { convId: newFromRef.convId, commitId: newFromRef.commitId, convTitle: newFromRef.convTitle, promptSummary: newFromRef.promptSummary };
      const newId = "conv:" + Date.now();
      setCommits([]); cRef.current = [];
      setHeadId(null); setBranch("main"); setConvId(newId);
      setParentRef(pRef); setNewFromRef(null); setGraph(true);

      const cm = mkCommit(null, msg, "", "main");
      const nc = [cm];
      setCommits(nc); cRef.current = nc; setHeadId(cm.id);
      save(msg.slice(0, 40), nc, cm.id, "main", pRef, newId);
      setTurn("response");
      return;
    }

    // editId: editing an existing commit (creates a branch)
    if (editId) {
      const ec = cRef.current.find(c => c.id === editId);
      if (ec) {
        if (!ec.parentId) {
          // Editing root: create new conversation
          setEditId(null);
          const newId = "conv:" + Date.now();
          setCommits([]); cRef.current = [];
          setHeadId(null); setBranch("main"); setConvId(newId);
          setParentRef(null);

          const cm = mkCommit(null, msg, "", "main");
          const nc = [cm];
          setCommits(nc); cRef.current = nc; setHeadId(cm.id);
          save(msg.slice(0, 40), nc, cm.id, "main", null, newId);
          setTurn("response");
          return;
        }
        pid = ec.parentId; br = "branch-" + names.length; setBranch(br);
      }
      setEditId(null); setGraph(true);
    }

    // Normal prompt: create commit with empty response
    const cm = mkCommit(pid, msg, "", br);
    const nc = [...cRef.current, cm]; setCommits(nc); cRef.current = nc; setHeadId(cm.id);
    save(msg.slice(0, 40), nc, cm.id, br);
    setTurn("response");
  };

  // ─── MERGE (turn-based) ───
  const merge = () => {
    if (!input.trim() || !sel.length) return;
    const msg = input.trim(); setInput(""); setMm(false);

    if (turn === "response") {
      // Fill the merge commit's response
      const lastCommit = cRef.current.find(c => c.id === headId);
      if (lastCommit) {
        const nc = cRef.current.map(c => c.id === headId ? { ...c, response: msg, responseTs: Date.now() } : c);
        setCommits(nc); cRef.current = nc;
        save(null, nc, headId, branch);
      }
      setSel([]);
      setTurn("prompt");
      return;
    }

    // Prompt turn: create merge commit with empty response
    const cm = mkCommit(headId, msg, "", branch, sel);
    const nc = [...cRef.current, cm]; setCommits(nc); cRef.current = nc; setHeadId(cm.id); setSel([]);
    save(null, nc, cm.id, branch);
    setTurn("response");
  };

  // ─── HANDLERS ───
  const startEdit = cid => { const cm = commits.find(c => c.id === cid); if (!cm) return; setEditId(cid); setNewFromRef(null); setInput(cm.prompt); setTurn("prompt"); inputRef.current?.focus(); };
  const checkout = (id, b) => {
    setHeadId(id); setBranch(b); setMm(false); setSel([]); setEditId(null); setNewFromRef(null); setScrollTarget(id);
    // Check if the checked-out commit needs a response
    const cm = commits.find(c => c.id === id);
    if (cm && cm.response === "") {
      setTurn("response");
    } else {
      setTurn("prompt");
    }
  };
  const toggleSel = id => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const startNew = (cid) => {
    const cm = commits.find(c => c.id === cid);
    if (!cm) return;
    const th = getThread(commits, cid);
    const currentConv = convs.find(c => c.id === convId);
    setNewFromRef({
      convId, commitId: cid, thread: th,
      convTitle: currentConv?.title || "Untitled",
      promptSummary: cm.prompt?.slice(0, 30) + (cm.prompt?.length > 30 ? ".." : ""),
    });
    setEditId(null); setMm(false); setSel([]);
    setInput(""); setTurn("prompt"); inputRef.current?.focus();
  };

  const goToParent = () => {
    if (!parentRef) return;
    const cv = convs.find(c => c.id === parentRef.convId);
    if (cv) { load(cv); setScrollTarget(parentRef.commitId); }
  };

  const goToChild = (childConvId) => {
    const cv = convs.find(c => c.id === childConvId);
    if (cv) load(cv);
  };

  const deleteCommit = (cid) => {
    const toDelete = new Set();
    const queue = [cid];
    while (queue.length) { const id = queue.shift(); toDelete.add(id); commits.filter(c => c.parentId === id).forEach(c => queue.push(c.id)); }
    const nc = commits.filter(c => !toDelete.has(c.id));
    setCommits(nc); cRef.current = nc;
    let newHeadId = headId, newBranch = branch;
    if (toDelete.has(headId)) {
      const deleted = commits.find(c => c.id === cid);
      if (deleted?.parentId) { const parent = nc.find(c => c.id === deleted.parentId); if (parent) { newHeadId = parent.id; newBranch = parent.branch; } }
      if (!nc.find(c => c.id === newHeadId) || toDelete.has(newHeadId)) {
        if (nc.length > 0) { newHeadId = nc[nc.length - 1].id; newBranch = nc[nc.length - 1].branch; }
        else { newHeadId = null; newBranch = "main"; }
      }
      setHeadId(newHeadId); setBranch(newBranch);
    }
    const existingConv = convs.find(c => c.id === convId);
    save(existingConv?.title, nc, newHeadId, newBranch);
    setTurn("prompt");
  };

  // Determine button label
  const btnLabel = editId ? "Edit" : newFromRef ? "New" : mm ? "Merge" : turn === "prompt" ? "Prompt" : "Response";
  const placeholder = editId ? "Edit your question..." : newFromRef ? "Start new conversation..." : mm ? "Merge instruction..." : turn === "prompt" ? "Enter prompt..." : "Enter response...";

  /* RENDER */
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: t.bg, color: t.text }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: 180, display: "flex", flexDirection: "column", borderRight: "0.5px solid " + t.border, background: t.sidebar }}>
        <div style={{ padding: "8px 6px" }}><button onClick={newConv} style={{ width: "100%", padding: "6px", fontSize: 10, fontWeight: 500, borderRadius: 4, background: t.accent, color: t.accentText, border: "none", cursor: "pointer" }}>+ New</button></div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 4px 4px" }} onClick={() => setChatMenu(null)}>
          {convs.map(cv => (
            <div key={cv.id} className="chat-item" style={{ padding: "6px", marginBottom: 1, borderRadius: 4, cursor: "pointer", fontSize: 10, background: convId === cv.id ? t.hover : "transparent", border: convId === cv.id ? "0.5px solid " + t.border : "0.5px solid transparent", display: "flex", alignItems: "center", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.background = t.hover; e.currentTarget.querySelector(".dots")&& (e.currentTarget.querySelector(".dots").style.opacity = "1"); }}
              onMouseLeave={e => { if (convId !== cv.id) e.currentTarget.style.background = "transparent"; e.currentTarget.querySelector(".dots") && (e.currentTarget.querySelector(".dots").style.opacity = "0"); }}>
              <div onClick={() => { if (renamingId !== cv.id) load(cv); }} style={{ flex: 1, minWidth: 0 }}>
                {renamingId === cv.id ? (
                  <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { renameConv(cv.id, renameVal); setRenamingId(null); } if (e.key === "Escape") setRenamingId(null); }}
                    onBlur={() => { renameConv(cv.id, renameVal); setRenamingId(null); }}
                    onClick={e => e.stopPropagation()}
                    style={{ width: "100%", fontSize: 10, fontWeight: 500, padding: "1px 3px", border: "1px solid #378ADD", borderRadius: 3, outline: "none", boxSizing: "border-box", background: t.bg, color: t.text }} />
                ) : (
                  <>
                    <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: t.text }}>{cv.title || "Untitled"}{cv.parentRef ? " \u2197" : ""}</div>
                    <div style={{ fontSize: 8, color: t.textMuted }}>{bNames(cv.commits || []).length}b</div>
                  </>
                )}
              </div>
              {renamingId !== cv.id && <span className="dots" onClick={e => { e.stopPropagation(); setChatMenu(chatMenu?.id === cv.id ? null : { id: cv.id, x: e.clientX, y: e.clientY }); }}
                style={{ opacity: 0, fontSize: 11, color: t.textMuted, padding: "0 2px", cursor: "pointer", transition: "opacity 0.15s", flexShrink: 0 }}>{"\u00B7\u00B7\u00B7"}</span>}
            </div>
          ))}
        </div>

        {/* Chat context menu */}
        {chatMenu && (
          <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setChatMenu(null)}>
            <div style={{ position: "fixed", left: chatMenu.x, top: chatMenu.y, zIndex: 100, background: t.bg, border: "0.5px solid " + t.border, borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", padding: "4px 0", minWidth: 100 }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => { const cv = convs.find(c => c.id === chatMenu.id); setRenameVal(cv?.title || ""); setRenamingId(chatMenu.id); setChatMenu(null); }}
                style={{ display: "block", width: "100%", padding: "6px 14px", fontSize: 11, color: t.text, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.background = t.hoverSidebar} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                rename
              </button>
              <div style={{ height: 1, background: t.border, margin: "2px 0" }} />
              <button onClick={() => { del(chatMenu.id); setChatMenu(null); }}
                style={{ display: "block", width: "100%", padding: "6px 14px", fontSize: 11, color: "#c00", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fee"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                delete
              </button>
            </div>
          </div>
        )}

        {/* Bottom bar: dark mode toggle + GitHub */}
        <div style={{ borderTop: "0.5px solid " + t.border, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setDark(d => !d)} title={dark ? "Light mode" : "Dark mode"}
            style={{ background: "none", border: "none", cursor: "pointer", color: t.textSub, padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.textSub}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <a href="https://github.com/eldensari/openbranch-note" target="_blank" rel="noopener noreferrer" title="GitHub"
            style={{ color: t.textSub, display: "flex", alignItems: "center", padding: 4, borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = t.text} onMouseLeave={e => e.currentTarget.style.color = t.textSub}>
            <GitHubIcon />
          </a>
        </div>
      </div>

      {/* CENTER */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "7px 12px", borderBottom: "0.5px solid " + t.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.text, display: "flex", alignItems: "center", gap: 4 }}><img src={herbIcon} alt="" style={{ width: 16, height: 16 }} /> OpenBranch Note</span>
            {!timelineView && names.length > 0 && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: bCol(names, branch) + "18", color: bCol(names, branch), fontWeight: 500, fontFamily: "monospace" }}>{branch}</span>}
            {!timelineView && parentRef && <span onClick={goToParent} style={{ fontSize: 8, color: "#378ADD", cursor: "pointer" }}>{"\u2197"} from: {parentRef.convTitle?.slice(0, 20)}</span>}
          </div>
          {!timelineView && commits.length > 0 && <button onClick={() => setGraph(!graph)} style={{ fontSize: 9, padding: "4px 8px", borderRadius: 4, cursor: "pointer", background: graph ? t.accent : "transparent", color: graph ? t.accentText : t.textSub, border: graph ? "none" : "0.5px solid " + t.border }}>{graph ? "Hide graph" : "Graph"}</button>}
        </div>

        {/* Timeline view or normal chat */}
        {timelineView ? (
          <TimelineView date={timelineView.date} label={timelineView.label} convs={convs} onGoToConv={cv => { load(cv); setTimelineView(null); }} onBack={() => setTimelineView(null)} t={t} />
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {thread.length === 0 && !newFromRef && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", maxWidth: 520 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.5px", color: t.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><img src={herbIcon} alt="OpenBranch Note" style={{ width: 36, height: 36 }} /> OpenBranch Note</div>
                    <div style={{ fontSize: 13, color: t.textSub, marginBottom: 24 }}>Manual conversation logger with branching visualization.</div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>Type <code style={{ background: t.inlineCode, padding: "1px 4px", borderRadius: 3, fontSize: "0.9em" }}>/show today</code>, <code style={{ background: t.inlineCode, padding: "1px 4px", borderRadius: 3, fontSize: "0.9em" }}>/show yesterday</code>, or <code style={{ background: t.inlineCode, padding: "1px 4px", borderRadius: 3, fontSize: "0.9em" }}>/show MMDDYY</code> to review your timeline.</div>
                  </div>
                </div>
              )}
              {thread.map(cm => {
                const isMrg = (cm.mergeIds || []).length > 0;
                return (
                  <div key={cm.id} id={"cm-" + cm.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}
                    onMouseEnter={() => setHoveredCid(cm.id)} onMouseLeave={() => setHoveredCid(null)}>
                    <div style={{ alignSelf: "flex-end", maxWidth: "80%" }}>
                      <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", background: isMrg ? t.mergeBubble : t.userBubble, color: isMrg ? t.mergeText : t.userText, borderLeft: isMrg ? "3px solid #BA7517" : "none" }}>
                        {isMrg && <div style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, color: "#BA7517" }}>MERGE</div>}
                        {cm.prompt}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
                        <button onClick={() => startEdit(cm.id)} style={{ fontSize: 9, color: editId === cm.id ? t.userText : t.textMuted, background: "none", border: "none", cursor: "pointer", padding: "1px 4px" }}
                          onMouseEnter={e => e.currentTarget.style.color = t.userText} onMouseLeave={e => { if (editId !== cm.id) e.currentTarget.style.color = t.textMuted; }}>edit</button>
                      </div>
                    </div>
                    <div style={{ alignSelf: "flex-start", maxWidth: "80%", padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.7, background: t.aiBubble, color: t.aiText }}>
                      {cm.response ? renderMd(cm.response, t) : <span style={{ color: t.textMuted, fontStyle: "italic" }}>waiting for response...</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Mode indicators */}
            {editId && <div style={{ padding: "6px 12px", borderTop: "0.5px solid " + t.border, background: t.userBubble, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: t.userText, fontWeight: 500 }}>Editing — new branch</span>
              <button onClick={() => { setEditId(null); setInput(""); }} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: "transparent", border: "0.5px solid " + t.border, cursor: "pointer", color: t.textSub }}>Cancel</button>
            </div>}
            {newFromRef && <div style={{ padding: "6px 12px", borderTop: "0.5px solid " + t.border, background: "#f0f6ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#378ADD", fontWeight: 500 }}>New conversation from {newFromRef.promptSummary?.slice(0, 25)}..</span>
              <button onClick={() => { setNewFromRef(null); setInput(""); }} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: "transparent", border: "0.5px solid " + t.border, cursor: "pointer", color: t.textSub }}>Cancel</button>
            </div>}
            {mm && sel.length > 0 && <div style={{ padding: "6px 12px", borderTop: "0.5px solid " + t.border, background: t.mergeBubble, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: t.mergeText, fontWeight: 500 }}>Merging {sel.length} into {branch}</span>
              <button onClick={() => { setMm(false); setSel([]); }} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: "transparent", border: "0.5px solid " + t.border, cursor: "pointer", color: t.textSub }}>Cancel</button>
            </div>}

            {/* Turn indicator */}
            <div style={{ padding: "4px 12px", borderTop: "0.5px solid " + t.border, fontSize: 10, color: t.textMuted }}>
              {turn === "prompt" ? "\uD83D\uDCDD Prompt turn" : "\uD83D\uDCAC Response turn"}
            </div>

            {/* Input */}
            <div style={{ padding: "8px 12px", borderTop: "0.5px solid " + t.border, display: "flex", gap: 6, alignItems: "center" }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); mm && sel.length ? merge() : send(); } }}
                placeholder={placeholder}
                style={{ flex: 1, padding: "10px 12px", fontSize: 13, borderRadius: 8, border: editId ? "1.5px solid " + t.userText : newFromRef ? "1.5px solid #378ADD" : mm ? "1.5px solid #BA7517" : turn === "response" ? "1.5px solid #1D9E75" : "0.5px solid " + t.border, background: t.bg, color: t.text }} />
              <button onClick={() => mm && sel.length ? merge() : send()} disabled={!input.trim() || (mm && !sel.length)}
                style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500, borderRadius: 8, background: editId ? t.userText : newFromRef ? "#378ADD" : mm ? "#854F0B" : turn === "response" ? "#1D9E75" : t.accent, color: t.accentText, border: "none", cursor: "pointer", opacity: !input.trim() ? 0.4 : 1 }}>
                {btnLabel}
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Graph */}
      {!timelineView && graph && commits.length > 0 && (
        <div style={{ width: graphW, minWidth: 200, maxWidth: 600, display: "flex", flexDirection: "column", borderLeft: "0.5px solid " + t.border, background: t.graphBg, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 6, cursor: "col-resize", zIndex: 10 }}
            onMouseDown={e => {
              e.preventDefault(); dragging.current = true;
              const startX = e.clientX, startW = graphW;
              const onMove = ev => { if (dragging.current) setGraphW(Math.max(200, Math.min(600, startW - (ev.clientX - startX)))); };
              const onUp = () => { dragging.current = false; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
              document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);
            }} />
          <div style={{ padding: "7px 8px", borderBottom: "0.5px solid " + t.border, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: t.textSub }}>Graph</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: 8, color: t.textMuted, fontFamily: "monospace" }}>HEAD {headId?.slice(0, 7)}</span>
              {names.length > 1 && !mm && <button onClick={() => { setMm(true); setSel([]); }} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "#FAEEDA", color: "#854F0B", border: "0.5px solid #FAC775", cursor: "pointer" }}>Merge</button>}
              {mm && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: "#854F0B", color: "#fff" }}>Select commits</span>}
            </div>
          </div>
          <Graph commits={commits} headId={headId} activeBranch={branch} names={names} onCheckout={checkout} onEdit={startEdit} onNew={startNew} onDelete={deleteCommit} mergeMode={mm} selected={sel} onToggleSel={toggleSel} parentRef={parentRef} onGoToParent={goToParent} childRefs={childRefs} onGoToChild={goToChild} hoveredCid={hoveredCid} panelW={graphW} t={t} />
        </div>
      )}
    </div>
  );
}
