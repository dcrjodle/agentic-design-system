import { useState } from "react";
import { Figma, BookOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Import() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import</h1>
        <p className="text-sm text-muted-foreground mt-1">Import components from external sources</p>
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Figma className="size-5 text-primary" />
          <CardTitle>Figma</CardTitle>
        </div>
        <CardDescription>Import components from a Figma file</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="File key (from Figma URL)" value={fileKey} onChange={(e) => setFileKey(e.target.value)} required />
          <Input type="password" placeholder="Personal access token" value={token} onChange={(e) => setToken(e.target.value)} required />
          <Button type="submit" disabled={status === "loading"} size="sm">
            {status === "loading" && <Loader2 className="size-4 animate-spin" />}
            Import from Figma
          </Button>
        </form>
        <StatusMessage status={status} result={result} />
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <CardTitle>Storybook</CardTitle>
        </div>
        <CardDescription>Import components from a Storybook instance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input type="url" placeholder="Storybook URL (e.g. http://localhost:6006)" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <Button type="submit" disabled={status === "loading"} size="sm">
            {status === "loading" && <Loader2 className="size-4 animate-spin" />}
            Import from Storybook
          </Button>
        </form>
        <StatusMessage status={status} result={result} />
      </CardContent>
    </Card>
  );
}

function StatusMessage({ status, result }: { status: string; result: any }) {
  if (status === "success" && result) {
    return (
      <div className="mt-4 flex items-center gap-2">
        <CheckCircle className="size-4 text-emerald-500" />
        <span className="text-sm text-emerald-500">
          Imported {result.imported} components
        </span>
        <Badge variant="secondary" className="text-xs">{result.skipped} skipped</Badge>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mt-4 flex items-center gap-2">
        <AlertCircle className="size-4 text-destructive" />
        <span className="text-sm text-destructive">{String(result)}</span>
      </div>
    );
  }
  return null;
}
