import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Search, ArrowLeft, Trash2, ExternalLink, Code2, BookOpen, Layout, Braces, Puzzle, Atom, Boxes, Box, Pencil, Save, X, Eye } from "lucide-react";
import Sandbox from "@/components/Sandbox";
import CodeBlock from "@/components/CodeBlock";

type DesignComponent = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  code: string;
  usage: string | null;
  layout: string | null;
  tokens: string | null;
  props: string | null;
  figma_url: string | null;
  storybook_url: string | null;
};

const tierConfig = {
  atom: { label: "Atoms", icon: Atom, description: "Basic building blocks" },
  molecule: { label: "Molecules", icon: Puzzle, description: "Composed from atoms" },
  organism: { label: "Organisms", icon: Boxes, description: "Complex UI sections" },
} as const;

type Tier = keyof typeof tierConfig;

function categorizeTier(category: string): Tier {
  const c = category.toLowerCase();
  if (["organism", "organisms", "section", "sections", "page", "pages", "template", "templates"].some(k => c.includes(k))) return "organism";
  if (["molecule", "molecules", "composite", "composites", "group", "groups"].some(k => c.includes(k))) return "molecule";
  return "atom";
}

function extractSubComponents(code: string, allComponents: DesignComponent[]): DesignComponent[] {
  const tags = new Set(Array.from(code.matchAll(/<([A-Z][A-Za-z0-9]+)/g), m => m[1]));
  return allComponents.filter(c => tags.has(c.name));
}

export default function Dashboard() {
  const [components, setComponents] = useState<DesignComponent[]>([]);
  const [selected, setSelected] = useState<DesignComponent | null>(null);
  const [tab, setTab] = useState<Tier>("atom");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.getComponents().then(setComponents);
  }, []);

  const grouped = useMemo(() => {
    const g: Record<Tier, DesignComponent[]> = { atom: [], molecule: [], organism: [] };
    for (const c of components) g[categorizeTier(c.category)].push(c);
    return g;
  }, [components]);

  const filtered = useMemo(() => {
    const list = grouped[tab];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  }, [grouped, tab, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this component?")) return;
    await api.deleteComponent(id);
    setComponents(prev => prev.filter(c => c.id !== id));
    setSelected(null);
  };

  if (selected) {
    return (
      <DetailView
        component={selected}
        allComponents={components}
        onBack={() => setSelected(null)}
        onDelete={handleDelete}
        onSelect={setSelected}
        onUpdate={(updated) => {
          setComponents(prev => prev.map(c => c.id === updated.id ? updated : c));
          setSelected(updated);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Design System</h1>
          <p className="text-sm text-muted-foreground mt-1">{components.length} components in database</p>
        </div>
        <Tabs value={tab} onValueChange={(v) => { setTab(v as Tier); setQuery(""); }}>
          <div className="flex items-center gap-4">
            <TabsList>
              {(Object.keys(tierConfig) as Tier[]).map((t) => {
                const { label, icon: Icon } = tierConfig[t];
                return (
                  <TabsTrigger key={t} value={t} className="gap-1.5">
                    <Icon className="size-3.5" />
                    {label}
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{grouped[t].length}</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${tierConfig[tab].label.toLowerCase()}...`}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          {(Object.keys(tierConfig) as Tier[]).map((t) => (
            <TabsContent key={t} value={t} className="mt-4">
              <TierView tier={t} components={tab === t ? filtered : grouped[t]} onSelect={setSelected} allComponents={components} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function TierView({ tier, components, onSelect, allComponents }: { tier: Tier; components: DesignComponent[]; onSelect: (c: DesignComponent) => void; allComponents: DesignComponent[] }) {
  const { description } = tierConfig[tier];

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Box className="size-10 mb-3 opacity-40" />
        <p className="text-sm">No {tierConfig[tier].label.toLowerCase()} found</p>
        <p className="text-xs mt-1 opacity-60">{description}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="pr-4 space-y-6">
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {components.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:border-primary/30 transition-colors group overflow-hidden"
              onClick={() => onSelect(c)}
            >
              <div className="h-36 border-b flex items-center justify-center pointer-events-none bg-muted/10">
                <Sandbox code={c.code} name={c.name} allComponents={allComponents} />
              </div>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{c.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                </div>
                {c.description && <CardDescription className="text-xs line-clamp-2">{c.description}</CardDescription>}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

const detailTabs = ["Preview", "Code", "Usage", "Props"] as const;
type DetailTab = (typeof detailTabs)[number];

function DetailView({
  component,
  allComponents,
  onBack,
  onDelete,
  onSelect,
  onUpdate,
}: {
  component: DesignComponent;
  allComponents: DesignComponent[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onSelect: (c: DesignComponent) => void;
  onUpdate: (c: DesignComponent) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("Preview");
  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState(component.code);
  const [saving, setSaving] = useState(false);

  const subComponents = useMemo(
    () => extractSubComponents(component.code, allComponents.filter(c => c.id !== component.id)),
    [component, allComponents]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateComponent(component.id, { code: editCode });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-lg font-semibold">{component.name}</h1>
          <Badge variant="outline" className="text-xs">{component.category}</Badge>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {component.figma_url && (
              <Button variant="outline" size="xs" asChild>
                <a href={component.figma_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3" /> Figma
                </a>
              </Button>
            )}
            {component.storybook_url && (
              <Button variant="outline" size="xs" asChild>
                <a href={component.storybook_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3" /> Storybook
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(component.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {component.description && <p className="text-sm text-muted-foreground">{component.description}</p>}

        {subComponents.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Sub-components:</span>
            {subComponents.map((sub) => {
              const tier = categorizeTier(sub.category);
              const TierIcon = tierConfig[tier].icon;
              return (
                <Popover key={sub.id}>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                      <TierIcon className="size-3" />
                      {sub.name}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{sub.name}</span>
                      <Badge variant="outline" className="text-[10px]">{sub.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sub.usage || "No usage documented"}
                    </p>
                    <Button size="sm" className="w-full" onClick={() => onSelect(sub)}>
                      <Eye className="size-3.5" /> View Component
                    </Button>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as DetailTab)}>
          <TabsList variant="line">
            <TabsTrigger value="Preview"><Layout className="size-3.5" /> Preview</TabsTrigger>
            <TabsTrigger value="Code"><Code2 className="size-3.5" /> Code</TabsTrigger>
            <TabsTrigger value="Usage"><BookOpen className="size-3.5" /> Usage</TabsTrigger>
            <TabsTrigger value="Props"><Braces className="size-3.5" /> Props</TabsTrigger>
          </TabsList>

          <TabsContent value="Preview" className="mt-4">
            <div className="h-[calc(100vh-320px)] rounded-lg border border-dashed flex items-center justify-center bg-muted/10">
              <Sandbox code={component.code} name={component.name} allComponents={allComponents} />
            </div>
          </TabsContent>

          <TabsContent value="Code" className="mt-4">
            <div className="flex items-center justify-end gap-2 mb-2">
              {editing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditCode(component.code); }}>
                    <X className="size-3.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving || editCode === component.code}>
                    <Save className="size-3.5" /> {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => { setEditCode(component.code); setEditing(true); }}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
              )}
            </div>
            {editing ? (
              <textarea
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full h-[calc(100vh-400px)] rounded-lg border bg-zinc-950 p-4 text-sm font-mono text-zinc-100 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                spellCheck={false}
              />
            ) : (
              <CodeBlock code={component.code} />
            )}
          </TabsContent>

          <TabsContent value="Usage" className="mt-4">
            {component.usage ? (
              <Card>
                <CardContent>
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">{component.usage}</div>
                </CardContent>
              </Card>
            ) : (
              <EmptyTab label="No usage guidelines yet" />
            )}
          </TabsContent>

          <TabsContent value="Props" className="mt-4">
            {component.props ? (
              <CodeBlock code={formatJson(component.props)} language="json" />
            ) : (
              <EmptyTab label="No props defined yet" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground italic py-8 text-center">{label}</p>;
}

function formatJson(json: string): string {
  try { return JSON.stringify(JSON.parse(json), null, 2); } catch { return json; }
}
