import type { Metadata } from "next";
import { Inter, Geist, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import { LoadingScreen } from "@/components/loading-screen";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { ToastNotifier } from "@/components/admin/toast-notifier";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "Delvin Varghese | Full Stack Developer",
  description: "I design and build fast, modern, and engaging digital experiences with clean code and exceptional user interfaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("dark", "font-sans", geist.variable, caveat.variable)}>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingScreen />
          <div className="relative min-h-screen flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
            {/* Background Blob Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-blob mix-blend-screen" />
              <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-secondary/20 blur-[100px] animate-blob mix-blend-screen animation-delay-2000" />
              <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] animate-blob mix-blend-screen animation-delay-4000" />
            </div>
            
            <main className="flex-1">
              {children}
            </main>
            <ScrollToTop />
          </div>
          <Toaster 
            position="bottom-right" 
            theme="dark" 
            richColors 
            toastOptions={{
              style: { width: 'max-content' }
            }}
          />
          <Suspense fallback={null}>
            <ToastNotifier />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
