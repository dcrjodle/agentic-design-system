import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import SearchBar from "../components/SearchBar";
import ComponentCard from "../components/ComponentCard";

export default function Components() {
  const [searchParams] = useSearchParams();
  const [components, setComponents] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const categoryFilter = searchParams.get("category") || "";

  useEffect(() => {
    api.getComponents(undefined, categoryFilter || undefined).then(setComponents);
  }, [categoryFilter]);

  const filtered = useMemo(() => {
    if (!query) return components;
    const q = query.toLowerCase();
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [components, query]);

  const categories = useMemo(
    () => [...new Set(components.map((c) => c.category))].sort(),
    [components]
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Components</h1>
        <p className="text-sm text-zinc-400 mt-1">{components.length} components in database</p>
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        {categories.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setQuery((q) => (q === cat ? "" : cat))
                }
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  query === cat
                    ? "border-violet-500 text-violet-300 bg-violet-500/10"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((c) => (
            <ComponentCard key={c.id} {...c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-500 text-sm">
          {components.length === 0 ? "No components yet." : "No matches found."}
        </div>
      )}
    </div>
  );
}
