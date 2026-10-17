import pc from "picocolors";
import { truncate } from "./text";

const fitColumnWidths = (naturalWidths: number[], availableWidth: number): number[] => {
  if (naturalWidths.reduce((sum, width) => sum + width, 0) <= availableWidth) {
    return [...naturalWidths];
  }

  let low = 1;
  let high = Math.max(...naturalWidths);
  while (low < high) {
    const candidate = Math.ceil((low + high) / 2);
    const width = naturalWidths.reduce((sum, value) => sum + Math.min(value, candidate), 0);
    if (width <= availableWidth) low = candidate;
    else high = candidate - 1;
  }

  const fittedWidths = naturalWidths.map((width) => Math.min(width, low));
  let remainingWidth = availableWidth - fittedWidths.reduce((sum, width) => sum + width, 0);
  for (let i = 0; i < fittedWidths.length && remainingWidth > 0; i += 1) {
    if (fittedWidths[i] < naturalWidths[i]) {
      fittedWidths[i] += 1;
      remainingWidth -= 1;
    }
  }

  return fittedWidths;
};

export const ui = {
  heading: (text: string) => console.log(pc.bold(text)),
  info: (text: string) => console.log(text),
  success: (text: string) => console.log(pc.green(text)),
  warn: (text: string) => console.warn(pc.yellow(text)),
  error: (text: string) => console.error(pc.red(text)),
  dim: (text: string) => pc.dim(text),
  bold: (text: string) => pc.bold(text),
  text: (text: string, { breakline = false }: { breakline?: boolean } = {}): void => {
    console.log(`${breakline ? "\n" : ""}${text}${breakline ? "\n" : ""}`);
  },
  table: (options: {
    headers: string[];
    rows: string[][];
    columnStyles?: Array<(text: string) => string>;
    indent?: string;
    maxWidth?: number;
  }): void => {
    const { headers, rows, columnStyles = [], indent = "  ", maxWidth } = options;

    const naturalColumnWidths = headers.map((header, i) => {
      const maxDataWidth = Math.max(...rows.map((row) => (row[i] || "").length));
      return Math.max(header.length, maxDataWidth);
    });
    const columnWidths =
      maxWidth === undefined
        ? naturalColumnWidths
        : fitColumnWidths(
            naturalColumnWidths,
            Math.max(naturalColumnWidths.length, maxWidth - indent.length - naturalColumnWidths.length * 2)
          );

    const headerRow = headers
      .map((header, i) => {
        const style = columnStyles[i] || pc.bold;
        return style(truncate(header, columnWidths[i], "…").padEnd(columnWidths[i] + 2));
      })
      .join("");
    console.log(pc.dim(indent) + headerRow);

    const totalWidth = columnWidths.reduce((sum, width) => sum + width + 2, 0);
    console.log(pc.dim(indent + "─".repeat(totalWidth)));

    rows.forEach((row) => {
      const formattedRow = row
        .map((cell, i) => {
          const style = columnStyles[i] || ((text: string) => text);
          return style(truncate(cell || "", columnWidths[i], "…").padEnd(columnWidths[i] + 2));
        })
        .join("");
      console.log(indent + formattedRow);
    });
  },
};

export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
