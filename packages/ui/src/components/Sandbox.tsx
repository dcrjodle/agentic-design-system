import { useMemo } from "react";
import React from "react";
import { transform } from "sucrase";

type CompDef = { name: string; code: string };

function cleanCode(code: string) {
  return code
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+/g, "")
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");
}

function resolveAllDeps(code: string, allComponents: CompDef[]): CompDef[] {
  const resolved = new Map<string, CompDef>();
  const queue = [code];
  while (queue.length) {
    const src = cleanCode(queue.shift()!);
    for (const [, tag] of src.matchAll(/<([A-Z][A-Za-z0-9]+)/g)) {
      if (resolved.has(tag)) continue;
      const dep = allComponents.find(c => c.name === tag);
      if (dep) { resolved.set(tag, dep); queue.push(dep.code); }
    }
  }
  return Array.from(resolved.values());
}

function compileToElement(code: string, name: string, allComponents?: CompDef[]): React.ReactNode {
  try {
    const clean = cleanCode(code);
    const deps = allComponents ? resolveAllDeps(code, allComponents) : [];
    const depsCode = deps.map(d => cleanCode(d.code)).join("\n");

    const { code: compiled } = transform(depsCode + "\n" + clean, {
      transforms: ["jsx", "typescript"],
      jsxRuntime: "classic",
      production: true,
    });

    const entry =
      clean.match(/function\s+([A-Z]\w*)/)?.[1] ||
      clean.match(/const\s+([A-Z]\w*)\s*=/)?.[1];

    if (!entry) return null;

    const fn = new Function("React", `${compiled}\nreturn React.createElement(${entry}, { children: "${name}" });`);
    return fn(React);
  } catch (e) {
    return React.createElement("p", { style: { color: "#ef4444", fontSize: 12 } }, String(e));
  }
}

export default function Sandbox({ code, name = "Example", className, allComponents }: { code: string; name?: string; className?: string; allComponents?: CompDef[] }) {
  const element = useMemo(() => code ? compileToElement(code, name, allComponents) : null, [code, name, allComponents]);

  if (!code) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground text-sm ${className ?? ""}`}>
        No code to render
      </div>
    );
  }

  return <div className={className}>{element}</div>;
}
