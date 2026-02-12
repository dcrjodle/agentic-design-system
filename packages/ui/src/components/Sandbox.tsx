import { useMemo } from "react";
import React from "react";
import { transform } from "sucrase";

function compileToElement(code: string, name: string): React.ReactNode {
  try {
    const clean = code
      .replace(/export\s+default\s+/g, "")
      .replace(/export\s+/g, "")
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");

    const { code: compiled } = transform(clean, {
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

export default function Sandbox({ code, name = "Example", className }: { code: string; name?: string; className?: string }) {
  const element = useMemo(() => code ? compileToElement(code, name) : null, [code, name]);

  if (!code) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground text-sm ${className ?? ""}`}>
        No code to render
      </div>
    );
  }

  return <div className={className}>{element}</div>;
}
