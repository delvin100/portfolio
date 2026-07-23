import { notFound } from "next/navigation";
import { getDocBySlug, getHeadings } from "@/lib/docs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CodeBlock } from "@/components/docs/code-block";
import { GitGraphVisualizer } from "@/components/docs/git-graph-visualizer";
import { TableOfContents } from "@/components/docs/table-of-contents";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

type DocPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export async function generateMetadata({ params }: DocPageProps) {
  const resolvedParams = await params;
  const doc = getDocBySlug(resolvedParams.slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.meta.title} - Git Learning Hub`,
    description: doc.meta.description,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  const doc = getDocBySlug(resolvedParams.slug);
  
  if (!doc) {
    notFound();
  }

  const headings = getHeadings(doc.content);

  const prettyCodeOptions = {
    theme: "github-dark", // You can customize the theme
    keepBackground: false,
  };

  const mdxComponents = {
    h1: (props: any) => <h1 className="text-4xl font-bold mt-8 mb-6 text-emerald-600 dark:text-emerald-400 tracking-tight" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-semibold mt-10 mb-4 text-emerald-600 dark:text-emerald-400" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-semibold mt-8 mb-4 text-emerald-600 dark:text-emerald-400" {...props} />,
    p: (props: any) => <p className="leading-relaxed text-foreground/90 mb-6 text-[17px]" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-8 mb-6 space-y-2 text-foreground/90 text-[17px] marker:text-muted-foreground" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-8 mb-6 space-y-2 text-foreground/90 text-[17px] marker:text-muted-foreground" {...props} />,
    li: (props: any) => <li className="pl-2" {...props} />,
    a: (props: any) => <a className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium underline-offset-4" {...props} />,
    strong: (props: any) => <strong className="font-semibold text-foreground" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6" {...props} />,
    hr: (props: any) => <hr className="my-8 border-border" {...props} />,
    code: (props: any) => <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm" {...props} />,
    pre: CodeBlock,
    GitGraphVisualizer,
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-10">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {doc.meta.category}
            </span>
            {doc.meta.difficulty && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                  {doc.meta.difficulty}
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-2">
            {doc.meta.title}
          </h1>
          {doc.meta.description && (
            <p className="text-lg text-muted-foreground">
              {doc.meta.description}
            </p>
          )}
        </div>

        <div className="max-w-none">
          <MDXRemote 
            source={doc.content} 
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypePrettyCode, prettyCodeOptions],
                ],
              },
            }}
          />
        </div>
      </div>

      {/* Right Sidebar - Table of Contents */}
      <div className="lg:w-64 shrink-0">
        <div className="sticky top-20 text-sm">
          <TableOfContents headings={headings} />
        </div>
      </div>
    </div>
  );
}
