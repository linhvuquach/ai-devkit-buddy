import pc from "picocolors";

export const ui = {
  heading: (text: string) => console.log(pc.bold(text)),
  info: (text: string) => console.log(text),
  success: (text: string) => console.log(pc.green(text)),
  warn: (text: string) => console.warn(pc.yellow(text)),
  error: (text: string) => console.error(pc.red(text)),
  dim: (text: string) => pc.dim(text),
  bold: (text: string) => pc.bold(text),
};

export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
