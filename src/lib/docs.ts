import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';

const contentDir = path.join(process.cwd(), 'src/content/git');

export type DocMeta = {
  slug: string;
  title: string;
  description?: string;
  category: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  order?: number;
};

export type Doc = {
  meta: DocMeta;
  content: string;
};

export function getDocBySlug(slugPath: string[]): Doc | null {
  try {
    const realSlug = slugPath.join('/');
    const fullPath = path.join(contentDir, `${realSlug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      meta: {
        slug: realSlug,
        title: data.title || realSlug,
        description: data.description || '',
        category: data.category || 'Uncategorized',
        difficulty: data.difficulty,
        tags: data.tags || [],
        order: data.order || 999,
      },
      content,
    };
  } catch (error) {
    console.error("Error reading doc:", error);
    return null;
  }
}

export function getAllDocs(): Doc[] {
  const docs: Doc[] = [];

  function traverse(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        traverse(fullPath);
      } else if (fullPath.endsWith('.mdx')) {
        const relativePath = path.relative(contentDir, fullPath);
        const slug = relativePath.replace(/\.mdx$/, '').replace(/\\/g, '/');
        const doc = getDocBySlug(slug.split('/'));
        if (doc) docs.push(doc);
      }
    }
  }
  
  traverse(contentDir);
  return docs;
}

export function getSidebarNav() {
  const docs = getAllDocs();
  
  // Group by category
  const categories: Record<string, DocMeta[]> = {};
  
  for (const doc of docs) {
    const cat = doc.meta.category;
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(doc.meta);
  }
  
  // Sort items within categories
  for (const cat in categories) {
    categories[cat].sort((a, b) => {
      if (a.order !== b.order) return (a.order || 999) - (b.order || 999);
      return a.title.localeCompare(b.title);
    });
  }

  // Pre-defined category order
  const categoryOrder = [
    'Introduction',
    'Getting Started',
    'Workflows',
    'Basic Commands',
    'Repository',
    'Files',
    'Commit',
    'Remote',
    'Branch',
    'Merge',
    'Rebase',
    'History',
    'Tags',
    'Stash',
    'Undo Changes',
    'Cherry Pick',
    'Worktrees',
    'Submodules',
    'Git Ignore',
    'Git Config',
    'SSH',
    'Hooks',
    'GitHub',
    'GitLab',
    'GitHub CLI',
    'GitLab CLI',
    'Best Practices',
    'Troubleshooting',
    'Cheat Sheet'
  ];

  // Return categories sorted by predefined order
  const sortedCategories = Object.keys(categories).sort((a, b) => {
    let indexA = categoryOrder.indexOf(a);
    let indexB = categoryOrder.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    if (indexA !== indexB) return indexA - indexB;
    return a.localeCompare(b);
  });

  return sortedCategories.map(cat => ({
    title: cat,
    items: categories[cat]
  }));
}

export function getHeadings(content: string) {
  const slugger = new GithubSlugger();
  const headingLines = content.split('\n').filter(line => line.match(/^#{2,3}\s/));
  
  return headingLines.map(line => {
    const text = line.replace(/^#{2,3}\s/, '');
    const level = line.startsWith('###') ? 3 : 2;
    const id = slugger.slug(text);
    return { id, text, level };
  });
}
