import { useState } from "react";
import { Figma, BookOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

export default function Import() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import</h1>
        <p className="text-sm text-zinc-400 mt-1">Import components from external sources</p>
      </div>
      <FigmaImport />
      <StorybookImport />
    </div>
  );
}

function FigmaImport() {
  const [fileKey, setFileKey] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const data = await api.importFigma(fileKey, token);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setResult((err as Error).message);
      setStatus("error");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Figma className="w-5 h-5 text-violet-400" />
        <h2 className="font-medium">Figma</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="File key (from Figma URL)"
          value={fileKey}
          onChange={(e) => setFileKey(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          required
        />
        <input
          type="password"
          placeholder="Personal access token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
          Import from Figma
        </button>
      </form>
      <StatusMessage status={status} result={result} />
    </div>
  );
}

function StorybookImport() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const data = await api.importStorybook(url);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setResult((err as Error).message);
      setStatus("error");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-violet-400" />
        <h2 className="font-medium">Storybook</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="url"
          placeholder="Storybook URL (e.g. http://localhost:6006)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
          Import from Storybook
        </button>
      </form>
      <StatusMessage status={status} result={result} />
    </div>
  );
}

function StatusMessage({ status, result }: { status: string; result: any }) {
  if (status === "success" && result) {
    return (
      <div className="mt-4 flex items-start gap-2 text-sm text-emerald-400">
        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Imported {result.imported} components ({result.skipped} skipped)</span>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mt-4 flex items-start gap-2 text-sm text-red-400">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{String(result)}</span>
      </div>
    );
  }
  return null;
}
