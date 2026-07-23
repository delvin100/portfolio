"use client";

import { GitCommit, GitBranch, GitMerge, Info, ArrowDown } from "lucide-react";

type Commit = {
  id: string;
  type: "commit" | "branch" | "merge";
  branch: "main" | "feature-auth";
  message: string;
  hash?: string;
  description?: string;
};

const scenarios: Record<string, Commit[]> = {
  basic: [
    { id: "1", type: "commit", branch: "main", message: "Initial commit", hash: "a1b2c3d", description: "Created the repository and added initial files." },
    { id: "2", type: "commit", branch: "main", message: "Update README", hash: "f8e7d6c", description: "Added project documentation." },
    { id: "3", type: "commit", branch: "main", message: "Add config files", hash: "b5a4c3d", description: "Configured the development environment." },
  ],
  branching: [
    { id: "1", type: "commit", branch: "main", message: "Setup project structure", hash: "c9d8e7f", description: "Base project files added to main." },
    { id: "2", type: "branch", branch: "feature-auth", message: "Created new branch", description: "Branched off from main to work safely in isolation." },
    { id: "3", type: "commit", branch: "feature-auth", message: "Add login UI component", hash: "x1y2z3w", description: "Working on the new feature." },
    { id: "4", type: "commit", branch: "main", message: "Hotfix typo in README", hash: "h5j6k7l", description: "Meanwhile, a quick fix is made directly to main." },
    { id: "5", type: "commit", branch: "feature-auth", message: "Integrate OAuth provider", hash: "m9n8b7v", description: "Continuing work on the feature branch." },
  ],
  merge: [
    { id: "1", type: "commit", branch: "main", message: "Setup project structure", hash: "c9d8e7f", description: "Base project files added to main." },
    { id: "2", type: "branch", branch: "feature-auth", message: "Created new branch", description: "Branched off from main to work safely in isolation." },
    { id: "3", type: "commit", branch: "feature-auth", message: "Add login UI component", hash: "x1y2z3w", description: "Working on the new feature." },
    { id: "4", type: "commit", branch: "main", message: "Update dependencies", hash: "p2o3i4u", description: "Main branch continues to receive updates." },
    { id: "5", type: "commit", branch: "feature-auth", message: "Integrate OAuth provider", hash: "m9n8b7v", description: "Feature is now complete and ready." },
    { id: "6", type: "merge", branch: "main", message: "Merged feature into main", hash: "m1e2r3g", description: "All feature changes are successfully combined back into main." },
  ]
};

export function GitGraphVisualizer({ scenario = "basic" }: { scenario?: "basic" | "branching" | "merge" }) {
  const steps = scenarios[scenario] || scenarios.basic;

  const getScenarioDescription = () => {
    switch(scenario) {
      case "basic": return "A linear timeline showing commits made one after another on the main branch.";
      case "branching": return "Notice how work can happen on 'feature-auth' and 'main' at the same time without interfering with each other.";
      case "merge": return "Work is completed in isolation on a feature branch, and then permanently combined (merged) back into main.";
      default: return "";
    }
  };

  return (
    <div className="my-8 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="bg-muted/50 px-5 py-4 border-b border-border flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-base font-semibold text-foreground">Timeline View</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {getScenarioDescription()} <br/>
            Read this timeline from <strong>top to bottom</strong>, just like a normal story.
          </p>
        </div>
      </div>
      
      <div className="p-6 sm:p-8 bg-background/50 flex flex-col gap-2">
        {steps.map((step, index) => {
          const isMain = step.branch === "main";
          
          return (
            <div key={step.id} className="relative flex flex-col">
              {/* Event Card */}
              <div className={`relative z-10 flex flex-col sm:flex-row gap-4 p-4 rounded-xl border ${
                step.type === "branch" ? "bg-emerald-500/10 border-emerald-500/20" :
                step.type === "merge" ? "bg-purple-500/10 border-purple-500/20" :
                isMain ? "bg-blue-500/5 border-blue-500/20 ml-0 sm:mr-12" : "bg-emerald-500/5 border-emerald-500/20 ml-6 sm:ml-12"
              }`}>
                
                {/* Icon Badge */}
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.type === "branch" ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20" :
                  step.type === "merge" ? "bg-purple-500 text-white shadow-sm shadow-purple-500/20" :
                  isMain ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                }`}>
                  {step.type === "commit" && <GitCommit className="w-5 h-5" />}
                  {step.type === "branch" && <GitBranch className="w-5 h-5" />}
                  {step.type === "merge" && <GitMerge className="w-5 h-5" />}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${
                      isMain ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    }`}>
                      {step.branch}
                    </span>
                    {step.hash && (
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {step.hash}
                      </span>
                    )}
                  </div>
                  <h5 className="font-semibold text-foreground text-base">
                    {step.message}
                  </h5>
                  {step.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Connector Arrow */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-1.5">
                  <ArrowDown className="w-5 h-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
