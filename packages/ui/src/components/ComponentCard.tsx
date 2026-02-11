import { Link } from "react-router-dom";
import { FileCode, Tag } from "lucide-react";

export default function ComponentCard({
  id,
  name,
  category,
  description,
}: {
  id: string;
  name: string;
  category: string;
  description: string | null;
}) {
  return (
    <Link
      to={`/components/${id}`}
      className="block p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <FileCode className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Tag className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-500">{category}</span>
          </div>
          {description && (
            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
