import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, FolderOpen, Clock } from "lucide-react";
import { api } from "../lib/api";
import ComponentCard from "../components/ComponentCard";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="text-zinc-500 text-sm">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Design system component database overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" /> Total Components
          </div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <FolderOpen className="w-3.5 h-3.5" /> Categories
          </div>
          <div className="text-3xl font-bold">{stats.categories.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5" /> Recent
          </div>
          <div className="text-3xl font-bold">{stats.recent.length}</div>
        </div>
      </div>

      {stats.categories.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-300 mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((c: any) => (
              <Link
                key={c.category}
                to={`/components?category=${c.category}`}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs hover:border-violet-500/50 transition-colors"
              >
                {c.category} <span className="text-zinc-500 ml-1">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.recent.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-300 mb-3">Recent Components</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.recent.map((c: any) => (
              <ComponentCard key={c.id} {...c} />
            ))}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-sm">No components yet.</p>
          <Link to="/import" className="text-violet-400 text-sm hover:underline mt-1 inline-block">
            Import from Figma or Storybook
          </Link>
        </div>
      )}
    </div>
  );
}
