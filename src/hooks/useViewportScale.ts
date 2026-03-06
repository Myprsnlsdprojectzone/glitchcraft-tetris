import { useState, useEffect, useCallback } from "react";

export type LayoutMode = "desktop" | "tablet-landscape" | "tablet-portrait" | "mobile";

export interface ViewportInfo {
  scale:      number;
  isMobile:   boolean;
  isTablet:   boolean;
  isDesktop:  boolean;
  layoutMode: LayoutMode;
  vw:         number;
  vh:         number;
}

/**
 * Computes a CSS scale + layout mode so the game ALWAYS fits the viewport.
 *
 * Desktop  (≥1024px wide, non-touch OR large): board LEFT  + panel RIGHT
 * Tablet landscape (touch, landscape):          board LEFT  + panel RIGHT (larger cells)
 * Tablet portrait  (touch, portrait):           board TOP   + panel BOTTOM
 * Mobile  (<600px wide or small touch):         board TOP   + compact panel BOTTOM
 *
 * Production-grade: handles foldables, iPads, Android tablets, notched phones.
 */
export function useViewportScale(
  naturalW: number,
  naturalH: number,
  padding = 16,
): ViewportInfo {
  const compute = useCallback((): ViewportInfo => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Touch detection — covers iOS, Android, Windows Touch
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error legacy IE
      navigator.msMaxTouchPoints > 0;

    const isPortrait = vw <= vh;

    // ── Device classification ─────────────────────────────────────────────
    // Mobile: small width OR narrow portrait touch device
    const isMobile =
      vw < 600 ||
      (isPortrait && vw < 680 && isTouch);

    // Tablet: touch device, medium size, not mobile
    const isTablet =
      !isMobile &&
      isTouch &&
      vw < 1280 &&
      vh > 420;  // exclude very short landscape phones

    const isDesktop = !isMobile && !isTablet;

    // ── Layout mode ───────────────────────────────────────────────────────
    let layoutMode: LayoutMode;
    if      (isMobile)                  layoutMode = "mobile";
    else if (isTablet && isPortrait)    layoutMode = "tablet-portrait";
    else if (isTablet && !isPortrait)   layoutMode = "tablet-landscape";
    else                                layoutMode = "desktop";

    const availW = Math.max(1, vw - padding * 2);
    const availH = Math.max(1, vh - padding * 2);

    // ── Scale computation ─────────────────────────────────────────────────
    let scale: number;

    if (layoutMode === "mobile") {
      // Mobile uses dynamic cell sizes — scale not used for layout
      // but compute a sensible value anyway for reference
      scale = Math.min(availW / (naturalW * 0.65), availH / (naturalH + 200), 1.0);
    } else if (layoutMode === "tablet-portrait") {
      // Board on top, panel on bottom — fit to width
      const totalH = naturalH + 260;
      scale = Math.min(availW / naturalW, availH / totalH, 1.05);
    } else if (layoutMode === "tablet-landscape") {
      // Side-by-side — fit to available space
      scale = Math.min(availW / naturalW, availH / naturalH, 1.15);
    } else {
      // Desktop — can scale up slightly on large monitors
      scale = Math.min(availW / naturalW, availH / naturalH, 1.30);
    }

    return {
      scale:     Math.max(0.25, Math.min(scale, 1.35)),
      isMobile,
      isTablet,
      isDesktop,
      layoutMode,
      vw,
      vh,
    };
  }, [naturalW, naturalH, padding]);

  const [info, setInfo] = useState<ViewportInfo>(compute);

  useEffect(() => {
    const update = () => setInfo(compute());

    // Immediate
    update();

    // Standard resize + orientation
    window.addEventListener("resize",            update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });

    // visualViewport covers browser pinch-zoom AND Ctrl+/- zoom on all browsers
    const vvp = window.visualViewport;
    if (vvp) {
      vvp.addEventListener("resize", update);
      vvp.addEventListener("scroll", update);
    }

    // Debounced fallback — catches late Android keyboard dismissal reflows
    let debounceTimer: ReturnType<typeof setTimeout>;
    const debouncedUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(update, 120);
    };
    window.addEventListener("resize", debouncedUpdate, { passive: true });

    return () => {
      window.removeEventListener("resize",            update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize",            debouncedUpdate);
      if (vvp) {
        vvp.removeEventListener("resize", update);
        vvp.removeEventListener("scroll", update);
      }
      clearTimeout(debounceTimer);
    };
  }, [compute]);

  return info;
}
