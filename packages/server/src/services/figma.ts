import { randomUUID } from "crypto";

interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  containing_frame?: { name: string };
  thumbnail_url?: string;
}

interface FigmaComponentsResponse {
  meta: { components: FigmaComponent[] };
}

export async function importFromFigma(fileKey: string, token: string) {
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/components`, {
    headers: { "X-Figma-Token": token },
  });

  if (!res.ok) {
    throw new Error(`Figma API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as FigmaComponentsResponse;
  const components = data.meta?.components || [];

  return components.map((c) => ({
    id: randomUUID(),
    name: c.name,
    category: c.containing_frame?.name || "general",
    description: c.description || null,
    code: `// Imported from Figma: ${c.name}\n// TODO: Add component code`,
    figma_url: `https://www.figma.com/file/${fileKey}?node-id=${c.key}`,
    preview_url: c.thumbnail_url || null,
  }));
}
