export interface Component {
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
  preview_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComponentCreate {
  name: string;
  category?: string;
  description?: string;
  code: string;
  usage?: string;
  layout?: string;
  tokens?: string;
  props?: string;
  figma_url?: string;
  storybook_url?: string;
  preview_url?: string;
}

export interface ComponentUpdate extends Partial<ComponentCreate> {}

export interface ComponentSummary {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  components: ComponentSummary[];
}

export interface Stats {
  total: number;
  categories: { category: string; count: number }[];
  recent: ComponentSummary[];
}
