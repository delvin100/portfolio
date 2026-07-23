"use client";

import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function GitGraphVisualizer({ scenario = "basic" }: { scenario?: "basic" | "branching" | "merge" }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="my-6 h-64 w-full bg-muted/20 animate-pulse rounded-lg" />;

  const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");

  const customTemplate = templateExtend(TemplateName.Metro, {
    colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"], // blue, emerald, violet, amber, red
    commit: {
      message: {
        displayAuthor: false,
        displayHash: false,
        color: isDark ? "#e2e8f0" : "#1e293b",
        font: "normal 14pt sans-serif",
      },
      dot: {
        size: 10,
      }
    },
    branch: {
      lineWidth: 4,
      spacing: 40,
    }
  });

  return (
    <div className="my-6 p-6 rounded-lg border border-border bg-card overflow-x-auto glass-card">
      <Gitgraph options={{ template: customTemplate }}>
        {(gitgraph) => {
          const main = gitgraph.branch("main");
          main.commit("Initial commit");

          if (scenario === "basic") {
            main.commit("Update README");
            main.commit("Add config files");
          } 
          else if (scenario === "branching") {
            main.commit("Setup project");
            const feature = gitgraph.branch("feature-auth");
            feature.commit("Add login UI");
            main.commit("Hotfix typo in README");
            feature.commit("Integrate OAuth");
          }
          else if (scenario === "merge") {
            main.commit("Setup project");
            const feature = gitgraph.branch("feature-auth");
            main.commit("Update dependencies");
            feature.commit("Add login UI").commit("Integrate OAuth");
            main.merge(feature, "Merge pull request #1 from feature-auth");
            main.commit("Release v1.0.0");
          }
        }}
      </Gitgraph>
    </div>
  );
}
