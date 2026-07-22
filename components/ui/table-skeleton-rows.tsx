import { DARK as M } from "@/lib/sk-theme-dark";

/** Deterministic per-cell width variation so rows don't look like identical, robotic bars. */
const WIDTHS = ["85%", "65%", "75%", "55%"];

export function TableSkeletonRows({ rows, columns }: { rows: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} style={{ borderBottom: r < rows - 1 ? `1px solid ${M.borderFaint}` : "none" }}>
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="px-5 py-4">
              <div
                className="h-4 animate-pulse rounded-md"
                style={{ background: M.surface, width: WIDTHS[(r + c) % WIDTHS.length] }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
