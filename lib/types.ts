export interface Domain {
  id: string
  name: string
  description: string | null
  created_at: string
  parent_id?: string | null
  // nested children (UI helper)
  sub_categories?: Domain[]
}

export interface ReferenceLink {
  id?: string
  url: string
  title: string
}

export interface Template {
  id: string
  name: string
  content: string
  domain_id: string
  created_by: string
  created_at: string
  updated_at: string
  reference_links?: ReferenceLink[] | null
  is_favorite?: boolean
  domain?: Domain
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string | null; // Null for top-level, UUID for sub-categories
  created_at: string;
  created_by: string;
  // This helper helps the UI render nested items
  sub_categories?: Category[]; 
}

export interface TemplateWithDomain extends Template {
  domain: Domain
}
