import { getAllDocs } from "@/lib/docs";
import { PrintButton } from "@/components/docs/print-button";

export const metadata = {
  title: "Git Cheat Sheet - Printable",
  description: "A printable one-page Git cheat sheet.",
};

export default function CheatSheetPage() {
  const docs = getAllDocs();
  
  // Define categories we want on the cheat sheet
  const sections = [
    { title: "Create & Clone", categories: ["Getting Started", "Repository"] },
    { title: "Basic Snapshotting", categories: ["Basic Commands", "Commit"] },
    { title: "Branch & Merge", categories: ["Branch", "Merge", "Rebase"] },
    { title: "Share & Update", categories: ["Remote"] },
    { title: "Undo & Rewrite", categories: ["Undo Changes"] },
  ];

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex items-center justify-between mb-8 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Git Cheat Sheet</h1>
          <p className="text-muted-foreground mt-1 print:hidden">
            A quick reference guide. Press <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-xs border border-border">Ctrl+P</kbd> to print this page.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 print:columns-2 print:gap-4 space-y-6 print:space-y-4">
        {sections.map((section) => {
          // Find all docs in the specified categories
          const sectionDocs = docs.filter(doc => section.categories.includes(doc.meta.category));
          
          if (sectionDocs.length === 0) return null;

          return (
            <div key={section.title} className="break-inside-avoid border border-border rounded-lg overflow-hidden bg-card">
              <div className="bg-muted px-4 py-2 border-b border-border">
                <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider">{section.title}</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {sectionDocs.map(doc => (
                  <div key={doc.meta.slug}>
                    <div className="font-mono text-sm text-primary font-semibold mb-1">
                      {doc.meta.title}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {doc.meta.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
