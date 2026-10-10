import matter from "gray-matter";

const NO_DESCRIPTION = "No description available";

export function extractSkillDescription(content: string): string {
  let body = content;
  try {
    const parsed = matter(content);
    const description = parsed.data.description;
    if (typeof description === "string" && description.trim()) return description.trim();
    body = parsed.content;
  } catch {
    // Malformed frontmatter: fall through to the body scan over the raw content.
  }
  const firstLine = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && line !== "---");
  return firstLine ?? NO_DESCRIPTION;
}
