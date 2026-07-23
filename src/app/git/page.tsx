import Link from "next/link";
import { ArrowRight, BookOpen, Terminal, GitBranch, ShieldAlert } from "lucide-react";
import { FaGithub as GithubIcon } from "react-icons/fa6";
import { getSidebarNav } from "@/lib/docs";

export const metadata = {
  title: "Git Learning Hub",
  description: "A comprehensive guide to Git, GitHub, GitLab, and Version Control.",
};

export default function GitLandingPage() {
  const navItems = getSidebarNav();
  const getGroup = (title: string) => navItems.find((n) => n.title === title)?.items || [];

  const basics = getGroup("Basic Commands");
  const workflows = getGroup("Workflows");

  return (
    <div className="mx-auto max-w-[800px] w-full pt-8 px-4 md:px-0">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Git Learning Hub
        </h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to master Git, GitHub and version control best practices. From first commit to advanced workflows.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link href="/git/what-is-git" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Get Started
          </Link>
          <Link href="/git/cheat-sheet" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            Printable Cheat Sheet
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/git/what-is-git"
          className="group relative rounded-lg border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Getting Started</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Learn what Git is, why we use it, and how version control works.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Start Learning <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>

        <Link
          href="/git/workflow-first-repo"
          className="group relative rounded-lg border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Terminal className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Workflows</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Step-by-step guides for creating repos, collaborating, and solving common scenarios.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View Workflows <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
        
        <Link
          href="/git/git-branch"
          className="group relative rounded-lg border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <GitBranch className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Branches</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Learn how to safely branch your code, work in isolation, and merge features together.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Explore Branches <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
        
        <Link
          href="/git/git-restore"
          className="group relative rounded-lg border border-border bg-card p-6 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Undo Changes</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            How to safely undo mistakes, restore files, and revert bad commits.
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Undo Mistakes <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
      </div>

    </div>
  );
}
