import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { KeyBindings } from "../hooks/useTetris";

interface Props {
  onClose:  () => void;
  isDark:   boolean;
  bindings: KeyBindings;
}

type Section = "about" | "howto" | "controls" | "scoring" | "tips";

const SECTIONS: { id: Section; icon: string; label: string; color: string }[] = [
  { id: "about",    icon: "🎮", label: "About",         color: "#6366f1" },
  { id: "howto",    icon: "📋", label: "How to Play",   color: "#22d3ee" },
  { id: "controls", icon: "⌨️",  label: "Controls",      color: "#4ade80" },
  { id: "scoring",  icon: "🏆", label: "Scoring",       color: "#f59e0b" },
  { id: "tips",     icon: "💡", label: "Tips & Tricks", color: "#a855f7" },
];

function formatKey(k: string): string {
  if (k === " ")          return "Space";
  if (k === "ArrowLeft")  return "← Left";
  if (k === "ArrowRight") return "→ Right";
  if (k === "ArrowDown")  return "↓ Down";
  if (k === "ArrowUp")    return "↑ Up";
  if (k === "Escape")     return "Esc";
  return k.length === 1 ? k.toUpperCase() : k;
}

function lightenHex(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r,g,b].map(v => clamp(v + (255 - v) * amount).toString(16).padStart(2,"0")).join("")}`;
}

function ManualGuideInner({ onClose, isDark, bindings }: Props) {
  const [active, setActive] = useState<Section>("about");

  /* ── Responsive breakpoints ── */
  const [vw, setVw] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = vw < 600;      // phone – full-width, tab bar
  const isTablet = vw < 900;      // tablet – narrower sidebar


  /* ── Theme tokens ── */
  const bg         = isDark ? "rgba(6,11,22,0.99)"  : "rgba(252,254,255,0.99)";
  const panel      = isDark ? "rgba(5,9,18,0.99)"   : "rgba(244,248,255,0.99)";
  const border     = isDark ? "#192d4a" : "#dde8f5";
  const text       = isDark ? "#eef2ff" : "#0f172a";
  const sub        = isDark ? "#5e7898" : "#5a7090";
  const card       = isDark ? "rgba(8,15,28,0.99)"  : "rgba(248,252,255,0.99)";
  const cardBorder = isDark ? "#192d4a" : "#d4e4f5";
  const accent     = "#6366f1";
  const accent2    = "#22d3ee";

  const activeSection = SECTIONS.find(s => s.id === active)!;

  /* ── Micro-components ── */
  const Divider = () => (
    <div style={{
      height: 1, margin: "22px 0",
      background: `linear-gradient(90deg, transparent, ${border}cc, transparent)`,
    }} />
  );

  const Tag = ({ children, color = accent }: { children: React.ReactNode; color?: string }) => (
    <span style={{
      display: "inline-block",
      background: `${color}18`, color,
      border: `1px solid ${color}40`,
      borderRadius: 22, padding: "3px 13px",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
      transition: "all 0.18s",
    }}>{children}</span>
  );

  const KB = ({ value }: { value: string }) => (
    <span style={{
      display: "inline-block",
      background: isDark ? "rgba(14,26,46,0.98)" : "#e2ecf8",
      border: `1.5px solid ${border}`,
      borderRadius: 9, padding: "3px 14px",
      fontSize: 12, fontWeight: 700, color: text,
      fontFamily: "'JetBrains Mono', monospace",
      boxShadow: isDark
        ? "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -2px 0 rgba(0,0,0,0.3)"
        : "0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 0 rgba(0,0,0,0.06)",
      minWidth: 46, textAlign: "center" as const,
    }}>{value}</span>
  );

  const SectionTitle = ({ icon, title, subtitle, color = accent }: {
    icon: string; title: string; subtitle?: string; color?: string;
  }) => (
    <div style={{ marginBottom: 26, animation: "slideDown 0.3s ease-out both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: `linear-gradient(135deg, ${color}28, ${color}12)`,
          border: `1.5px solid ${color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, flexShrink: 0,
          boxShadow: `0 6px 22px ${color}24`,
        }}>{icon}</div>
        <div>
          <div style={{
            fontSize: 23, fontWeight: 900, letterSpacing: "-0.8px",
            background: `linear-gradient(135deg, ${color}, ${lightenHex(color, 0.25)})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 12.5, color: sub, marginTop: 3,
              fontWeight: 500, letterSpacing: "0.01em" }}>{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );

  const InfoCard = ({ children, color }: { children: React.ReactNode; color?: string }) => (
    <div style={{
      background: card,
      border: `1px solid ${color ? color + "28" : cardBorder}`,
      borderLeft: `4px solid ${color ?? accent}`,
      borderRadius: 13, padding: "15px 17px", marginBottom: 11, color: text,
      boxShadow: isDark
        ? "0 3px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.02)"
        : "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${color ?? accent}06 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );

  const StepRow = ({ step, children }: { step: number; children: React.ReactNode }) => (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
      <div style={{
        flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
        background: `linear-gradient(135deg, ${accent}, ${accent2})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 900, color: "#fff",
        boxShadow: `0 4px 16px rgba(99,102,241,0.42)`,
      }}>{step}</div>
      <div style={{ fontSize: 13.5, color: text, lineHeight: 1.75, paddingTop: 5 }}>{children}</div>
    </div>
  );

  const ControlRow = ({ action, primary, secondary, description }: {
    action: string; primary: string; secondary?: string; description: string;
  }) => (
    <div className="control-row" style={{
      display: "flex", alignItems: "center", gap: 13, padding: "12px 15px",
      background: card, border: `1.5px solid ${cardBorder}`,
      borderRadius: 13, marginBottom: 8,
      boxShadow: isDark ? "0 2px 6px rgba(0,0,0,0.18)" : "0 1px 5px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, transparent 50%)",
        pointerEvents: "none", opacity: 0, transition: "opacity 0.2s",
      }} />
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: text }}>{action}</div>
        <div style={{ fontSize: 11.5, color: sub, marginTop: 2.5, fontWeight: 500,
          lineHeight: 1.5 }}>{description}</div>
      </div>
      <div style={{ display: "flex", gap: 7, alignItems: "center",
        flexShrink: 0, position: "relative" }}>
        <KB value={formatKey(primary)} />
        {secondary && (
          <>
            <span style={{ color: sub, fontSize: 9.5, fontWeight: 700 }}>or</span>
            <KB value={formatKey(secondary)} />
          </>
        )}
      </div>
    </div>
  );

  const ScoreRow = ({ lines, label, pts, color = accent }: {
    lines: string; label: string; pts: string; color?: string;
  }) => (
    <div className="score-row" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 15px", background: card,
      border: `1.5px solid ${cardBorder}`, borderRadius: 13, marginBottom: 8,
      boxShadow: isDark ? "0 2px 6px rgba(0,0,0,0.18)" : "0 1px 5px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: color, borderRadius: "4px 0 0 4px",
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginLeft: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${color}28, ${color}12)`,
          border: `1.5px solid ${color}38`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, color,
          boxShadow: `0 3px 10px ${color}22`,
        }}>{lines}</div>
        <div style={{ fontSize: 13.5, color: text, fontWeight: 600 }}>{label}</div>
      </div>
      <Tag color={color}>{pts}</Tag>
    </div>
  );

  const TipCard = ({ icon, title, body }: { icon: string; title: string; body: string }) => (
    <div className="tip-card" style={{
      background: card, border: `1.5px solid ${cardBorder}`,
      borderRadius: 15, padding: "15px 17px", marginBottom: 10,
      display: "flex", gap: 14,
      boxShadow: isDark ? "0 3px 12px rgba(0,0,0,0.22)" : "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
        background: isDark ? "rgba(14,26,46,0.95)" : "#e8eef8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, border: `1.5px solid ${border}`,
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 6px rgba(0,0,0,0.07)",
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: sub, lineHeight: 1.75, fontWeight: 500 }}>{body}</div>
      </div>
    </div>
  );

  const SLabel = ({ label, color }: { label: string; color?: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13, paddingLeft: 1 }}>
      {color && <div style={{ width: 3.5, height: 14, borderRadius: 3,
        background: `linear-gradient(to bottom, ${color}, ${lightenHex(color, 0.2)})`,
        flexShrink: 0, boxShadow: `0 0 6px ${color}55` }} />}
      <div style={{ fontSize: 10, color: sub, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
    </div>
  );

  /* ── Section content ── */
  const renderContent = () => {
    switch (active) {

      case "about": return (
        <div style={{ animation: "slideInRight 0.25s ease-out both" }}>
          <SectionTitle icon="🎮" title="About Tetris"
            subtitle="The world's most iconic puzzle game, reimagined" color="#6366f1" />

          <InfoCard color={accent}>
            <div style={{ fontSize: 13.5, lineHeight: 1.85, color: text }}>
              <strong>Tetris</strong> was invented by Soviet engineer{" "}
              <span style={{ color: accent, fontWeight: 700 }}>Alexey Pajitnov</span> in{" "}
              <span style={{ color: accent2, fontWeight: 700 }}>1984</span> and became one of
              the best-selling games of all time with over{" "}
              <span style={{ color: accent, fontWeight: 700 }}>500 million</span> copies sold.
              This version is a beautifully crafted minimalist reimagining — with glass morphism UI,
              smooth haptics, touch controls, hold system, combos, and rich animations.
              Polished to Play Store standard.
            </div>
          </InfoCard>

          <Divider />
          <SLabel label="The 7 Tetrominoes" color={accent} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9, marginBottom: 20 }}>
            {[
              { name: "I-Piece", color: "#22d3ee", desc: "Straight line — clear 4 rows (Tetris)!", icon: "━" },
              { name: "O-Piece", color: "#facc15", desc: "Square — stable & predictable",          icon: "■" },
              { name: "T-Piece", color: "#a855f7", desc: "T-shape — the most versatile of all",   icon: "┬" },
              { name: "S-Piece", color: "#4ade80", desc: "S-shape — tricky but powerful",          icon: "S" },
              { name: "Z-Piece", color: "#f87171", desc: "Z-shape — mirror of S-piece",            icon: "Z" },
              { name: "J-Piece", color: "#60a5fa", desc: "J-shape — great for left-side fills",    icon: "J" },
              { name: "L-Piece", color: "#fb923c", desc: "L-shape — great for right-side fills",   icon: "L" },
            ].map(({ name, color, desc, icon }) => (
              <div key={name} className="tetromino-card" style={{
                background: card,
                border: `1.5px solid ${color}40`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 12, padding: "11px 14px",
                boxShadow: isDark
                  ? `0 3px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.02)`
                  : `0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)`,
                display: "flex", gap: 10, alignItems: "center",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${color}20`, border: `1.5px solid ${color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 900, color, fontFamily: "monospace",
                }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color }}>{name}</div>
                  <div style={{ fontSize: 11, color: sub, marginTop: 3,
                    fontWeight: 500, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Divider />
          <SLabel label="Features in This Version" color={accent2} />
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" as const, lineHeight: 2 }}>
            {[
              { label: "Ghost Piece",       color: accent2   },
              { label: "Hold Piece",        color: "#a855f7" },
              { label: "Combo System",      color: "#f87171" },
              { label: "Best Score",        color: "#f59e0b" },
              { label: "7-Bag Randomiser",  color: "#4ade80" },
              { label: "Custom Controls",   color: accent    },
              { label: "Dark/Light Theme",  color: "#fb923c" },
              { label: "Hard Drop Bonus",   color: "#facc15" },
              { label: "Level Progression", color: "#60a5fa" },
              { label: "Haptic Feedback",   color: "#f87171" },
              { label: "Touch Controls",    color: "#4ade80" },
              { label: "Tablet Support",    color: "#c084fc" },
              { label: "Smooth Animations", color: "#818cf8" },
              { label: "Glass UI",          color: accent2   },
            ].map(({ label, color }) => <Tag key={label} color={color}>{label}</Tag>)}
          </div>
        </div>
      );

      case "howto": return (
        <div style={{ animation: "slideInRight 0.25s ease-out both" }}>
          <SectionTitle icon="📋" title="How to Play"
            subtitle="Master the fundamentals in under 2 minutes" color="#22d3ee" />

          <SLabel label="Step-by-Step Guide" color="#22d3ee" />
          <StepRow step={1}>Press <strong style={{color:accent}}>▶ Start Game</strong> to begin. A fresh board loads with 7-bag randomised pieces.</StepRow>
          <StepRow step={2}>Tetrominoes fall from the <strong style={{color:accent}}>top</strong>. Move and rotate them before they settle on the stack.</StepRow>
          <StepRow step={3}>Fill a <strong style={{color:accent}}>complete horizontal row</strong> with no gaps — it clears and you score points.</StepRow>
          <StepRow step={4}>Clear <strong style={{color:accent}}>4 rows simultaneously</strong> for a <Tag color="#facc15">TETRIS</Tag> — the king of scoring moves!</StepRow>
          <StepRow step={5}>Every <strong style={{color:accent}}>10 lines cleared</strong> advances you a level — pieces fall faster but earn more points.</StepRow>
          <StepRow step={6}>When pieces <strong style={{color:"#f87171"}}>stack above the board</strong> the game ends. Keep the playfield flat and breathe!</StepRow>

          <Divider />
          <SLabel label="Key Mechanics" color={accent2} />

          {[
            { icon:"👻", title:"Ghost Piece",      color:accent2,   desc:"The translucent outline shows exactly where your piece will land. At high speeds, this is your most valuable tool." },
            { icon:"📦", title:"Hold Piece",       color:"#a855f7", desc:"Press C (default, rebindable) to store the current piece. Swap it back any time — once per piece placement." },
            { icon:"💫", title:"Hard Drop",        color:"#facc15", desc:"Space bar instantly locks the piece to ghost position. Earns +2 pts per cell dropped. Essential at high speed." },
            { icon:"🔥", title:"Combo Multiplier", color:"#f87171", desc:"Consecutive line clears build a streak. Each extra clear in the streak adds (streak−1) × 50 × level bonus points." },
            { icon:"🔄", title:"Wall Kicks",       color:"#4ade80", desc:"Rotating near walls auto-adjusts the piece position. Unlocks placement options that look visually blocked." },
            { icon:"📱", title:"Touch Gestures",   color:"#60a5fa", desc:"Tap = rotate, double-tap = hard drop, swipe left/right = move, swipe down = soft drop, long-press = hold." },
          ].map(({ icon, title, desc, color }) => (
            <InfoCard key={title} color={color}>
              <div style={{ display:"flex", gap:13 }}>
                <div style={{
                  width:38, height:38, borderRadius:10, flexShrink:0,
                  background:`${color}1c`, border:`1.5px solid ${color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:19,
                }}>{icon}</div>
                <div>
                  <div style={{fontSize:13.5,fontWeight:700,color,marginBottom:5}}>{title}</div>
                  <div style={{fontSize:13,color:sub,lineHeight:1.75,fontWeight:500}}>{desc}</div>
                </div>
              </div>
            </InfoCard>
          ))}
        </div>
      );

      case "controls": return (
        <div style={{ animation: "slideInRight 0.25s ease-out both" }}>
          <SectionTitle icon="⌨️" title="Controls"
            subtitle="Your live key bindings — fully rebindable" color="#4ade80" />

          <SLabel label="Movement & Actions" color="#4ade80" />
          <ControlRow action="Move Left"      primary={bindings.left}     secondary="A" description="Slide the piece one cell to the left" />
          <ControlRow action="Move Right"     primary={bindings.right}    secondary="D" description="Slide the piece one cell to the right" />
          <ControlRow action="Soft Drop"      primary={bindings.down}     secondary="S" description="Increase fall speed (no bonus points)" />
          <ControlRow action="Rotate"         primary={bindings.rotate}   secondary="W" description="Rotate 90° clockwise with wall-kick assist" />
          <ControlRow action="Hard Drop"      primary={bindings.hardDrop}               description="Instantly drop to ghost (+2 pts per cell)" />
          <ControlRow action="Hold Piece"     primary={bindings.hold}                   description="Store current piece; swap back with held" />
          <ControlRow action="Pause / Resume" primary={bindings.pause}                  description="Freeze game at any time; press again to continue" />

          <Divider />
          <InfoCard color={accent2}>
            <div style={{ display:"flex", gap:12 }}>
              <span style={{fontSize:22}}>💡</span>
              <div>
                <div style={{fontSize:13.5,fontWeight:700,color:accent2,marginBottom:5}}>Fully Rebindable</div>
                <div style={{fontSize:13,color:sub,lineHeight:1.75,fontWeight:500}}>
                  Every key can be remapped to anything you prefer. Click{" "}
                  <strong style={{color:text}}>⌨ Keys</strong> in the side panel,
                  then click a key badge and press your desired key. Bindings update live — even mid-game!
                </div>
              </div>
            </div>
          </InfoCard>

          <Divider />
          <SLabel label="Touch Gestures (Mobile & Tablet)" color="#60a5fa" />

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:4 }}>
            {[
              { icon:"👆", gesture:"Single Tap",    action:"Rotate",     color:"#a855f7" },
              { icon:"✌️", gesture:"Double Tap",    action:"Hard Drop",  color:"#f87171" },
              { icon:"👈", gesture:"Swipe Left",    action:"Move Left",  color:"#22d3ee" },
              { icon:"👉", gesture:"Swipe Right",   action:"Move Right", color:"#22d3ee" },
              { icon:"👇", gesture:"Swipe Down",    action:"Soft Drop",  color:"#fb923c" },
              { icon:"☝️", gesture:"Swipe Up",      action:"Rotate",     color:"#a855f7" },
              { icon:"✊", gesture:"Long Press",    action:"Hold Piece", color:"#4ade80" },
              { icon:"⚡", gesture:"Fast Swipe↓",  action:"Hard Drop",  color:"#facc15" },
            ].map(({ icon, gesture, action, color }) => (
              <div key={gesture} className="gesture-card" style={{
                background:card, border:`1.5px solid ${cardBorder}`,
                borderRadius:12, padding:"11px 13px",
                display:"flex", gap:11, alignItems:"center",
              }}>
                <div style={{
                  width:38, height:38, borderRadius:11, flexShrink:0,
                  background:`${color}18`, border:`1.5px solid ${color}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:19,
                }}>{icon}</div>
                <div>
                  <div style={{fontSize:12.5,fontWeight:700,color:text}}>{gesture}</div>
                  <div style={{fontSize:11.5,color,marginTop:2,fontWeight:700}}>{action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      case "scoring": return (
        <div style={{ animation: "slideInRight 0.25s ease-out both" }}>
          <SectionTitle icon="🏆" title="Scoring System"
            subtitle="Maximise your score with smart strategy" color="#f59e0b" />

          <SLabel label="Lines Cleared" color="#f59e0b" />
          <ScoreRow lines="1" label="Single — One row cleared"    pts="100 × Level" color="#4ade80" />
          <ScoreRow lines="2" label="Double — Two rows at once"   pts="300 × Level" color="#22d3ee" />
          <ScoreRow lines="3" label="Triple — Three rows at once" pts="500 × Level" color="#a855f7" />
          <ScoreRow lines="4" label="TETRIS — Four rows at once!" pts="800 × Level" color="#f59e0b" />

          <Divider />
          <SLabel label="Bonus Points" color="#facc15" />

          <InfoCard color="#facc15">
            <div style={{fontSize:13.5,fontWeight:800,color:"#facc15",marginBottom:7}}>⚡ Hard Drop Bonus</div>
            <div style={{fontSize:13,color:sub,lineHeight:1.75,fontWeight:500}}>
              Each cell a piece travels during a hard drop earns <strong style={{color:text}}>+2 points</strong>.
              Dropping from the very top (20 cells) earns <strong style={{color:text}}>+40 bonus</strong> per piece.
              Hard drop every confident placement!
            </div>
          </InfoCard>

          <InfoCard color={accent}>
            <div style={{fontSize:13.5,fontWeight:800,color:accent,marginBottom:7}}>📈 Level Multiplier</div>
            <div style={{fontSize:13,color:sub,lineHeight:1.75,fontWeight:500}}>
              All line-clear scores multiply by your current level. A Tetris at level 8 earns{" "}
              <strong style={{color:text}}>800 × 8 = 6,400 points</strong>. Push higher for exponential rewards!
            </div>
          </InfoCard>

          <InfoCard color="#f87171">
            <div style={{fontSize:13.5,fontWeight:800,color:"#f87171",marginBottom:7}}>🔥 Combo Bonus</div>
            <div style={{fontSize:13,color:sub,lineHeight:1.75,fontWeight:500}}>
              Consecutive line clears build a combo streak. Formula:{" "}
              <strong style={{color:text}}>(streak − 1) × 50 × level</strong> added on top of normal score.
              Resets if you place without clearing any row.
            </div>
          </InfoCard>

          <Divider />
          <SLabel label="Speed by Level" color="#a855f7" />

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
            {[
              { range:"1–2",  ms:"800ms", label:"Beginner", color:"#4ade80"  },
              { range:"3–4",  ms:"640ms", label:"Easy",     color:"#a3e635"  },
              { range:"5–6",  ms:"480ms", label:"Medium",   color:"#facc15"  },
              { range:"7–8",  ms:"320ms", label:"Hard",     color:"#fb923c"  },
              { range:"9–10", ms:"180ms", label:"Expert",   color:"#f87171"  },
              { range:"10+",  ms:"100ms", label:"Master",   color:"#a855f7"  },
            ].map(({ range, ms, label, color }) => (
              <div key={range} className="speed-card" style={{
                background:card,
                border:`1.5px solid ${color}35`,
                borderTop:`3.5px solid ${color}`,
                borderRadius:13, padding:"13px 12px",
                boxShadow: isDark
                  ? `0 3px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.02)`
                  : `0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at 50% 0%, ${color}12 0%, transparent 65%)`,
                  pointerEvents: "none",
                }} />
                <div style={{fontSize:8.5,color:sub,fontWeight:800,
                  textTransform:"uppercase",letterSpacing:"0.09em",position:"relative"}}>{label}</div>
                <div style={{fontSize:22,fontWeight:900,color,marginTop:4,
                  textShadow:`0 0 18px ${color}55`,position:"relative"}}>{range}</div>
                <div style={{fontSize:11,color:sub,marginTop:3,fontWeight:700,
                  fontFamily:"'JetBrains Mono',monospace",position:"relative"}}>{ms}/step</div>
              </div>
            ))}
          </div>
        </div>
      );

      case "tips": return (
        <div style={{ animation: "slideInRight 0.25s ease-out both" }}>
          <SectionTitle icon="💡" title="Tips & Tricks"
            subtitle="Play smarter, not just faster" color="#a855f7" />

          <TipCard icon="🏗️" title="Keep the Board Flat"
            body="Always aim for a level, even surface. Tall uneven stacks limit your options and lead to game over quickly. Fill holes before they accumulate — a buried gap costs multiple pieces to repair." />
          <TipCard icon="👁️" title="Plan Two Steps Ahead"
            body="Use both the Next Piece preview and the ghost piece to plan simultaneously. Elite players think 2–3 moves ahead — even at maximum speed. The ghost makes this natural." />
          <TipCard icon="👻" title="Trust the Ghost Piece"
            body="At high speeds there's no time to guess where a piece lands. Let the ghost guide every placement — it's always perfectly accurate. Stop second-guessing and just follow the ghost." />
          <TipCard icon="🎯" title="The Tetris Column Strategy"
            body="Reserve one column (usually far right) and save I-pieces for 4-row Tetrises. At high levels this earns far more than clearing singles. But don't wait too long — a partial board is risky." />
          <TipCard icon="⚡" title="Hard Drop Everything"
            body="Instead of gravity-waiting, hard drop every piece you're confident about. It earns +2 pts per cell dropped, prevents accidental mis-placements, and locks in your rhythm at high speed." />
          <TipCard icon="📦" title="Hold is a Strategic Card"
            body="Use Hold proactively, not reactively. Store I-pieces for Tetris opportunities. Hold awkward S/Z pieces when they don't fit your current setup. Don't use it as a panic button." />
          <TipCard icon="🔥" title="Chase Combo Streaks"
            body="Set up your board so every single placement clears at least one row. A 10× combo at level 5 adds 2,250 bonus points — more than several Tetrises combined. Combos win matches." />
          <TipCard icon="🔄" title="Exploit Wall Kicks"
            body="Don't assume a piece can't rotate near a wall. The wall-kick system auto-adjusts and often finds valid spots that look blocked. Try rotating in tight spaces — it works more often than not." />
          <TipCard icon="🧘" title="Pause Strategically"
            body="There's zero shame in pausing mid-game. If the board is getting critical and you need a moment to plan, hit Pause. A 5-second strategic pause saves far more games than panic-placing." />
          <TipCard icon="📚" title="Learn Piece Pairings"
            body="S+Z, J+L, and T-pieces are natural row-completion partners. Recognising which 2-piece combos complete a row cleanly means you react faster and waste fewer pieces over a full game." />
        </div>
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        background: isMobile ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.86)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: isMobile ? "0" : "14px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: isMobile ? "100vw" : `min(940px, 97vw)`,
        height: isMobile ? "92svh" : `min(740px, 95vh)`,
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: isMobile ? "22px 22px 0 0" : 26,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: [
          "0 52px 120px rgba(0,0,0,0.82)",
          "0 0 0 1px rgba(255,255,255,0.04)",
          "0 0 80px rgba(99,102,241,0.08)",
        ].join(", "),
        animation: isMobile
          ? "slideUp 0.35s cubic-bezier(0.34,1.08,0.64,1) both"
          : "modalOpen 0.35s cubic-bezier(0.34,1.08,0.64,1) both",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "13px 16px" : "18px 28px",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.07)"}`,
          background: panel, flexShrink: 0,
          boxShadow: isDark
            ? "0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.15)"
            : "0 1px 0 rgba(0,0,0,0.06)",
        }}>
          {/* Mobile: drag handle */}
          {isMobile && (
            <div style={{
              position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
              width: 36, height: 4, borderRadius: 4,
              background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 11 : 15 }}>
            <div style={{
              width: isMobile ? 38 : 50,
              height: isMobile ? 38 : 50,
              borderRadius: isMobile ? 11 : 15,
              background: "linear-gradient(135deg, #5a5fcf 0%, #6366f1 45%, #818cf8 70%, #22d3ee 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isMobile ? 18 : 24, flexShrink: 0,
              boxShadow: "0 8px 28px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.22)",
              animation: "logoGlow 3s ease-in-out infinite",
            }}>📖</div>
            <div>
              <div style={{
                fontSize: isMobile ? 16 : 21, fontWeight: 900, letterSpacing: "-0.6px",
                background: "linear-gradient(135deg, #6366f1 0%, #818cf8 45%, #22d3ee 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "titleShimmer 4s linear infinite",
              }}>Player's Manual</div>
              {!isMobile && (
                <div style={{ fontSize: 12.5, color: sub, marginTop: 3, fontWeight: 500 }}>
                  Complete guide to mastering GlitchCraft
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="close-btn"
            style={{
              background: isDark ? "rgba(12,22,40,0.92)" : "#eaeff8",
              border: `1.5px solid ${border}`,
              borderRadius: 12,
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
              color: sub, fontSize: isMobile ? 14 : 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, cursor: "pointer",
              boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >✕</button>
        </div>

        {/* ── BODY ── */}
        {isMobile ? (
          /* ══ MOBILE: vertical column — tab bar + scrollable content ══ */
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

            {/* Horizontal scrollable tab bar */}
            <div style={{
              display: "flex", gap: 5,
              padding: "10px 12px",
              overflowX: "auto", flexShrink: 0,
              background: panel,
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
              scrollbarWidth: "none",
            }}>
              {SECTIONS.map(({ id, icon, label, color }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "8px 13px", flexShrink: 0,
                      background: isActive ? `${color}22` : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: `1.5px solid ${isActive ? color + "50" : border}`,
                      borderRadius: 22, cursor: "pointer",
                      color: isActive ? color : sub,
                      fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      boxShadow: isActive ? `0 3px 12px ${color}28` : "none",
                      touchAction: "manipulation",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable content */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "18px 16px 24px",
              background: bg,
            }}>
              {renderContent()}
            </div>

            {/* Bottom floating close pill */}
            <div style={{
              padding: "12px 16px",
              background: panel,
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
              flexShrink: 0,
            }}>
              <button
                onClick={onClose}
                style={{
                  width: "100%", padding: "13px",
                  background: `linear-gradient(135deg, ${activeSection.color} 0%, ${lightenHex(activeSection.color, 0.18)} 100%)`,
                  border: "none", borderRadius: 14,
                  color: "#fff", fontSize: 14.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  letterSpacing: "0.02em",
                  boxShadow: `0 6px 22px ${activeSection.color}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  touchAction: "manipulation",
                }}
              >✓&nbsp; Got It!</button>
            </div>
          </div>
        ) : (
          /* ══ TABLET / DESKTOP: sidebar + content ══ */
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

            {/* Sidebar */}
            <div style={{
              width: isTablet ? 170 : 210, flexShrink: 0,
              background: panel,
              borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.06)"}`,
              padding: isTablet ? "10px 7px" : "14px 10px",
              display: "flex", flexDirection: "column",
              gap: 3, overflowY: "auto",
            }}>
              {SECTIONS.map(({ id, icon, label, color }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className="guide-sidebar-item"
                    style={{
                      display: "flex", alignItems: "center", gap: isTablet ? 8 : 11,
                      padding: isTablet ? "9px 10px" : "11px 13px",
                      background: isActive ? `${color}1a` : "transparent",
                      border: `1.5px solid ${isActive ? color + "40" : "transparent"}`,
                      borderRadius: 13, cursor: "pointer",
                      textAlign: "left" as const,
                      color: isActive ? color : sub,
                      fontSize: isTablet ? 12.5 : 13.5,
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: "inherit", letterSpacing: "0.01em",
                      boxShadow: isActive ? `0 3px 14px ${color}1a` : "none",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
                        pointerEvents: "none",
                      }} />
                    )}
                    <div style={{
                      width: isTablet ? 30 : 36, height: isTablet ? 30 : 36,
                      borderRadius: 10, flexShrink: 0,
                      background: isActive ? `${color}22` : isDark ? "rgba(14,26,46,0.9)" : "#e8eef8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isTablet ? 14 : 17, transition: "all 0.18s",
                      border: `1.5px solid ${isActive ? color + "3c" : border}`,
                      boxShadow: isActive ? `0 0 14px ${color}22` : "none",
                      position: "relative",
                    }}>{icon}</div>
                    <span style={{ position: "relative" }}>{label}</span>
                    {isActive && (
                      <div style={{
                        marginLeft: "auto", width: 7, height: 7,
                        borderRadius: "50%", background: color, flexShrink: 0,
                        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}44`,
                        position: "relative",
                      }} />
                    )}
                  </button>
                );
              })}

              <div style={{ flex: 1, minHeight: 18 }} />

              {/* Got It! button */}
              <button
                onClick={onClose}
                className="modal-footer-btn"
                style={{
                  padding: isTablet ? "11px" : "12px",
                  background: `linear-gradient(135deg, ${activeSection.color} 0%, ${lightenHex(activeSection.color, 0.18)} 100%)`,
                  border: "none", borderRadius: 13,
                  color: "#fff", fontSize: isTablet ? 12.5 : 13.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  letterSpacing: "0.02em",
                  boxShadow: `0 6px 22px ${activeSection.color}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transition: "background 0.3s ease, box-shadow 0.3s ease",
                }}
              >✓&nbsp; Got It!</button>
            </div>

            {/* Scrollable content */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: isTablet ? "20px 22px" : "28px 32px",
              background: bg,
            }}>
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ManualGuide: React.FC<Props> = props =>
  ReactDOM.createPortal(<ManualGuideInner {...props} />, document.body);
