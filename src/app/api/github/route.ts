import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "Next.js-Portfolio",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`);
    }

    const data = await res.json();

    // Fetch recent commits (events)
    let recentCommits = 0;
    try {
      const eventsRes = await fetch(
        `https://api.github.com/users/${username}/events?per_page=100`,
        {
          headers: {
            "User-Agent": "Next.js-Portfolio",
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            }),
          },
          next: { revalidate: 300 },
        }
      );

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        recentCommits = eventsData.reduce((acc: number, event: any) => {
          if (new Date(event.created_at) >= thirtyDaysAgo) {
            return acc + 1;
          }
          return acc;
        }, 0);
      }
    } catch (e) {
      console.warn("Failed to fetch GitHub events", e);
    }

    return NextResponse.json({
      ...data,
      recent_commits: recentCommits,
    });
  } catch (error: any) {
    console.error("GitHub API Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
