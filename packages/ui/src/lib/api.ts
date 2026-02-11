const BASE = "/api";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  getComponents: (q?: string, category?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    return request<any[]>(`/components${qs ? `?${qs}` : ""}`);
  },
  getComponent: (id: string) => request<any>(`/components/${id}`),
  createComponent: (data: any) =>
    request<any>("/components", { method: "POST", body: JSON.stringify(data) }),
  updateComponent: (id: string, data: any) =>
    request<any>(`/components/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteComponent: (id: string) =>
    request<any>(`/components/${id}`, { method: "DELETE" }),
  getStats: () => request<any>("/stats"),
  importFigma: (fileKey: string, token: string) =>
    request<any>("/import/figma", { method: "POST", body: JSON.stringify({ fileKey, token }) }),
  importStorybook: (storybookUrl: string) =>
    request<any>("/import/storybook", { method: "POST", body: JSON.stringify({ storybookUrl }) }),
};
