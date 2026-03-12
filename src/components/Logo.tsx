export function Logo({ isDark, size = 34 }: { isDark?: boolean; size?: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: size,
        padding: "0 12px",
        borderRadius: 8,
        background: isDark
          ? "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(34,211,238,0.1) 100%)"
          : "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(34,211,238,0.05) 100%)",
        border: `1.5px solid ${isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)"}`,
        boxShadow: isDark
          ? "0 0 12px rgba(99,102,241,0.2), inset 0 0 8px rgba(34,211,238,0.1)"
          : "0 0 8px rgba(99,102,241,0.1)",
        userSelect: "none",
        WebkitUserSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glitch Shine Effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "50%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          transform: "skewX(-20deg)",
          animation: "shimmerWave 4s infinite",
        }}
      />
      
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Inter', monospace",
          fontWeight: 900,
          fontSize: size * 0.55,
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 30%, #22d3ee 60%, #6366f1 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "titleShimmer 4s linear infinite",
          filter: isDark ? "drop-shadow(0 2px 4px rgba(34,211,238,0.3))" : "none",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        Glitch<span style={{ color: isDark ? "#fff" : "#1e293b", WebkitTextFillColor: "initial" }}>Craft</span>
      </span>
      
      {/* Inline styles for the shine keyframes if not present */}
      <style>{`
        @keyframes shimmerWave {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
}

export function BigLogo({ size = 100, isDark = true }: { size?: number, isDark?: boolean }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", marginBottom: size * 0.18 }}>
      {/* Ripple ring */}
      <div style={{
        position: "absolute", inset: -size * 0.12,
        borderRadius: size * 0.36,
        border: "1.5px solid rgba(99,102,241,0.28)",
        animation: "statRipple 2.8s ease-out infinite",
        pointerEvents: "none",
      }} />
      
      {/* Pure CSS Logo Block */}
      <div
        style={{
          width: size, height: size,
          borderRadius: size * 0.26,
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: [
            "0 14px 48px rgba(99,102,241,0.65)",
            "0 0 0 1.5px rgba(99,102,241,0.4)",
            "inset 0 2px 4px rgba(255,255,255,0.15)",
          ].join(", "),
          animation: "logoGlow 3.2s ease-in-out infinite",
          userSelect: "none",
          WebkitUserSelect: "none",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating grid lines for 'craft' feel */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundSize: "20px 20px",
          backgroundImage: isDark
            ? "linear-gradient(to right, rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.1) 1px, transparent 1px)"
            : "linear-gradient(to right, rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.05) 1px, transparent 1px)",
          pointerEvents: "none",
        }} />
        
        {/* Neon text 'GC' */}
        <span style={{
          fontFamily: "'JetBrains Mono', 'Inter', monospace",
          fontWeight: 900,
          fontSize: size * 0.45,
          letterSpacing: "-2px",
          background: "linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 10px rgba(34,211,238,0.5))",
          position: "relative",
          zIndex: 1,
        }}>
          G<span style={{ color: isDark ? "#fff" : "#0f172a", WebkitTextFillColor: "initial", filter: "none" }}>C</span>
        </span>
      </div>
    </div>
  );
}
