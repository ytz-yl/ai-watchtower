export interface Paper {
  id: string
  title: string
  titleCn: string
  authors: string[]
  abstract: string
  abstractCn: string
  category: string
  tags: string[]
  published: string
  url: string
  pdfUrl: string
}

export interface NewsItem {
  id: string
  title: string
  titleCn: string
  source: string
  sourceUrl: string
  publishedAt: string
  summary: string
  summaryCn: string
  tags: string[]
  featured?: boolean
}

export interface GlossaryItem {
  id: string
  term: string
  termCn: string
  definition: string
  definitionCn: string
  tags: string[]
  updated: string
}
