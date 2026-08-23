import rawArticles from "./knowledge.json";

export interface KnowledgeArticle {
  slug: string;
  filename: string;
  title: string;
  summary: string;
  content: string[];
}

const articles = rawArticles as KnowledgeArticle[];

export function getKnowledgeArticles(): KnowledgeArticle[] {
  return articles;
}

export function getKnowledgeArticleBySlug(slug: string): KnowledgeArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getKnowledgePdfUrl(article: KnowledgeArticle): string {
  return `/knowledge/${encodeURIComponent(article.filename)}`;
}
