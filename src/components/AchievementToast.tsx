/**
 * AchievementToast — slide-in badge notification stacked at bottom-right.
 *
 * Pure cosmetic overlay, rendered at App level.
 * Auto-dismisses each item after 3.5 s. Click to dismiss early.
 */

import { useEffect, useState } from "react";
import { AchievementState } from "../utils/achievements";
import { ThemeConfig } from "../utils/themes";

interface Props {
  toastQueue: AchievementState[];
  theme:      ThemeConfig;
  onDismiss:  (id: string) => void;
}

/* ── Single toast card with enter/exit transitions (no keyframes needed) ── */
const ToastItem = ({
  achievement, theme, onDismiss,
}: {
  achievement: AchievementState;
  theme:       ThemeConfig;
  onDismiss:   (id: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /* enter on next tick so the initial translate has a frame to paint */
    const enter = setTimeout(() => setVisible(true), 30);
    /* auto-dismiss */
    const exit  = setTimeout(() => onDismiss(achievement.id), 3500);
    return () => { clearTimeout(enter); clearTimeout(exit); };
  }, [achievement.id, onDismiss]);

  return (
    <div
      onClick={() => onDismiss(achievement.id)}
      style={{
        /* layout */
        display:     "flex",
        alignItems:  "center",
        gap:         10,
        padding:     "10px 14px",
        minWidth:    230,
        maxWidth:    300,
        cursor:      "pointer",
        /* look */
        background:   `${theme.card}ee`,
        border:       `1.5px solid ${theme.accent}55`,
        borderRadius: 14,
        backdropFilter: "blur(16px)",
        boxShadow: [
          `0 8px 32px rgba(0,0,0,0.44)`,
          `0 0 0 1px ${theme.accent}22`,
          `inset 0 1px 0 rgba(255,255,255,0.06)`,
        ].join(", "),
        /* animation */
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateX(0) scale(1)" : "translateX(72px) scale(0.92)",
        transition: "opacity 0.28s ease, transform 0.38s cubic-bezier(0.34,1.56,0.64,1)",
        userSelect: "none",
      }}
    >
      {/* emoji badge */}
      <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
        {achievement.emoji}
      </span>

      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: theme.accent, marginBottom: 2,
        }}>
          Achievement Unlocked!
        </div>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: theme.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {achievement.name}
        </div>
        <div style={{
          fontSize: 11, color: theme.sub, marginTop: 1,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {achievement.desc}
        </div>
      </div>

      {/* subtle close hint */}
      <div style={{
        fontSize: 10, color: theme.sub, opacity: 0.48,
        marginLeft: "auto", flexShrink: 0, paddingLeft: 4,
      }}>
        ✕
      </div>
    </div>
  );
};

export const AchievementToast: React.FC<Props> = ({
  toastQueue, theme, onDismiss,
}) => {
  if (toastQueue.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Achievement notifications"
      style={{
        position:       "fixed",
        bottom:         24,
        right:          24,
        zIndex:         10000,
        display:        "flex",
        flexDirection:  "column",
        gap:            10,
        pointerEvents:  "auto",
      }}
    >
      {toastQueue.map(ach => (
        <ToastItem
          key={ach.id}
          achievement={ach}
          theme={theme}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};
