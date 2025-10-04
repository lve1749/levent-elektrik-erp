export interface ChangelogCategory {
  type: 'fixes' | 'improvements' | 'features' | 'api' | 'breaking'
  title: string
  count: number
  items: string[]
  children?: ChangelogCategory[]
}

export interface ChangelogEntry {
  id: string
  version: string
  title: string
  description?: string
  date: string
  image?: string
  categories?: ChangelogCategory[]
}

export interface ChangelogIndex {
  versions: string[]
  latest: string
  lastUpdated: string
}