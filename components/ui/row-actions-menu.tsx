"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface RowActionsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  menuStyle?: React.CSSProperties;
}

/**
 * Kebab-menu trigger + dropdown, portaled to document.body and positioned
 * with fixed coordinates so it's never clipped by a scrollable/rounded-corner
 * ancestor (e.g. a table's `overflow-x-auto` wrapper) — no matter which row it's on.
 *
 * Flips to open upward instead of downward when there isn't enough viewport
 * space below the trigger, so it never overlaps the row/content beneath it.
 */
export function RowActionsMenu({ open, onOpenChange, trigger, children, menuStyle }: RowActionsMenuProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<{ top: number; bottom: number; right: number } | null>(null);
  const [placement, setPlacement] = useState<"below" | "above">("below");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const r = anchorRef.current?.getBoundingClientRect();
      if (!r) return;
      setAnchorRect({ top: r.top, bottom: r.bottom, right: r.right });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  /** Measure the rendered menu and flip above the trigger if it wouldn't fit below — runs before paint so there's no visible jump. */
  useLayoutEffect(() => {
    if (!open || !anchorRect || !menuRef.current) return;
    const menuHeight = menuRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    setPlacement(spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow ? "above" : "below");
  }, [open, anchorRect, children]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      if (anchorRef.current?.contains(e.target as Node)) return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  return (
    <div ref={anchorRef} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      {trigger}
      {mounted && createPortal(
        <AnimatePresence>
          {open && anchorRect && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: placement === "below" ? -6 : 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === "below" ? -4 : 4, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="fixed z-[200] min-w-[170px] rounded-lg p-1.5"
              style={{
                right: window.innerWidth - anchorRect.right,
                ...(placement === "below"
                  ? { top: anchorRect.bottom + 6 }
                  : { bottom: window.innerHeight - anchorRect.top + 6 }),
                ...menuStyle,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
