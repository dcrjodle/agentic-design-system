import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, ExternalLink, Tag } from "lucide-react";
import { api } from "../lib/api";
import CodeBlock from "../components/CodeBlock";

const tabs = ["Code", "Usage", "Layout", "Tokens", "Props"] as const;

export default function ComponentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [component, setComponent] = useState<any>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Code");

  useEffect(() => {
    if (id) api.getComponent(id).then(setComponent);
  }, [id]);

  if (!component) return <div className="text-zinc-500 text-sm">Loading...</div>;

  const handleDelete = async () => {
    if (!confirm("Delete this component?")) return;
    await api.deleteComponent(component.id);
    navigate("/components");
  };

  const renderTab = () => {
    switch (tab) {
      case "Code":
        return <CodeBlock code={component.code} />;
      case "Usage":
        return <Prose text={component.usage} />;
      case "Layout":
        return <Prose text={component.layout} />;
      case "Tokens":
        return <JsonBlock json={component.tokens} />;
      case "Props":
        return <JsonBlock json={component.props} />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Link to="/components" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{component.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Tag className="w-3 h-3" /> {component.category}
            </span>
            {component.figma_url && (
              <a href={component.figma_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-violet-400 hover:underline">
                <ExternalLink className="w-3 h-3" /> Figma
              </a>
            )}
            {component.storybook_url && (
              <a href={component.storybook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-violet-400 hover:underline">
                <ExternalLink className="w-3 h-3" /> Storybook
              </a>
            )}
          </div>
          {component.description && (
            <p className="text-sm text-zinc-400 mt-3">{component.description}</p>
          )}
        </div>
        <button onClick={handleDelete} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              tab === t
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>{renderTab()}</div>
    </div>
  );
}

function Prose({ text }: { text: string | null }) {
  if (!text) return <p className="text-sm text-zinc-500 italic">No content yet.</p>;
  return <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-300">{text}</div>;
}

function JsonBlock({ json }: { json: string | null }) {
  if (!json) return <p className="text-sm text-zinc-500 italic">No data yet.</p>;
  try {
    const formatted = JSON.stringify(JSON.parse(json), null, 2);
    return <CodeBlock code={formatted} language="json" />;
  } catch {
    return <pre className="text-sm text-zinc-400 font-mono whitespace-pre-wrap">{json}</pre>;
  }
}
