/**
 * Winning pattern engine: given grid dimensions and claimed indices, check if pattern is achieved.
 * Pattern slugs: row | column | diagonal | corners | x | full-house
 * Grid: row-major, index = row * cols + col (0-based).
 */
export function checkWinningPattern(
  rows: number,
  cols: number,
  claimedSet: Set<number>,
  patternSlug: string,
): boolean {
  const total = rows * cols;
  const slug = (patternSlug || '').toLowerCase().trim().replace(/\s+/g, '-');

  if (slug === 'full-house' || slug === 'fullhouse') {
    for (let i = 0; i < total; i++) if (!claimedSet.has(i)) return false;
    return true;
  }

  if (slug === 'row') {
    for (let r = 0; r < rows; r++) {
      let full = true;
      for (let c = 0; c < cols; c++) {
        if (!claimedSet.has(r * cols + c)) {
          full = false;
          break;
        }
      }
      if (full) return true;
    }
    return false;
  }

  if (slug === 'column') {
    for (let c = 0; c < cols; c++) {
      let full = true;
      for (let r = 0; r < rows; r++) {
        if (!claimedSet.has(r * cols + c)) {
          full = false;
          break;
        }
      }
      if (full) return true;
    }
    return false;
  }

  if (slug === 'diagonal') {
    const len = Math.min(rows, cols);
    let main = true,
      anti = true;
    for (let i = 0; i < len; i++) {
      if (!claimedSet.has(i * cols + i)) main = false;
      if (!claimedSet.has(i * cols + (cols - 1 - i))) anti = false;
    }
    return main || anti;
  }

  if (slug === 'corners') {
    const c0 = 0;
    const c1 = cols - 1;
    const r0 = 0;
    const r1 = rows - 1;
    return (
      claimedSet.has(r0 * cols + c0) &&
      claimedSet.has(r0 * cols + c1) &&
      claimedSet.has(r1 * cols + c0) &&
      claimedSet.has(r1 * cols + c1)
    );
  }

  if (slug === 'x') {
    const len = Math.min(rows, cols);
    for (let i = 0; i < len; i++) {
      if (!claimedSet.has(i * cols + i)) return false;
      if (!claimedSet.has(i * cols + (cols - 1 - i))) return false;
    }
    return true;
  }

  return false;
}
