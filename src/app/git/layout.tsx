import { getSidebarNav } from "@/lib/docs";
import { Sidebar } from "@/components/docs/sidebar";
import { Search } from "@/components/docs/search";
import Link from "next/link";
import { Menu } from "lucide-react";
import { FaGithub } from "react-icons/fa6";

export default function GitDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = getSidebarNav();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="print:hidden sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
          <div className="mr-4 hidden md:flex">
            <div className="mr-6 flex items-center space-x-2">
              <FaGithub className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Git Learning Hub
              </span>
            </div>
          </div>
          {/* Mobile menu could go here */}
          <div className="flex flex-1 items-center justify-between space-x-6 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Search />
            </div>
            <nav className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-blue-600 text-white hover:bg-blue-700 shadow-sm h-8 px-4"
              >
                Portfolio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container max-w-screen-2xl px-4 md:px-8 flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] print:block">
        {/* Left Sidebar */}
        <aside className="print:hidden fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <Sidebar navItems={navItems} />
        </aside>

        {/* Main Content Area */}
        <main className="relative py-6 lg:gap-10 lg:py-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
