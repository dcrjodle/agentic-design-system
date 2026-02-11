import { randomUUID } from "crypto";

interface StorybookIndex {
  v: number;
  entries: Record<string, StorybookEntry>;
}

interface StorybookEntry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
  importPath?: string;
  tags?: string[];
}

export async function importFromStorybook(storybookUrl: string) {
  const base = storybookUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/index.json`).catch(() =>
    fetch(`${base}/stories.json`)
  );

  if (!res.ok) {
    throw new Error(`Storybook API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as StorybookIndex;
  const entries = Object.values(data.entries || {});
  const componentMap = new Map<string, StorybookEntry>();

  for (const entry of entries) {
    if (entry.type === "story" && !componentMap.has(entry.title)) {
      componentMap.set(entry.title, entry);
    }
  }

  return Array.from(componentMap.values()).map((entry) => {
    const parts = entry.title.split("/");
    const name = parts[parts.length - 1];
    const category = parts.length > 1 ? parts[0] : "general";

    return {
      id: randomUUID(),
      name,
      category,
      description: `Imported from Storybook: ${entry.title}`,
      code: `// Storybook component: ${entry.title}\n// Import path: ${entry.importPath || "unknown"}\n// TODO: Add component code`,
      storybook_url: `${base}/?path=/story/${entry.id}`,
    };
  });
}
