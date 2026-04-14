// pages/api/producthunt.js
// NovaHub — Product Hunt server proxy
// Uses a secure developer token from env vars and never exposes it to the browser.

const PRODUCT_HUNT_URL = "https://api.producthunt.com/v2/api/graphql";
const DEFAULT_LIMIT = 10;

const PRODUCT_HUNT_QUERY = `
  query GetTopPosts($first: Int!) {
    posts(order: VOTES, first: $first) {
      edges {
        node {
          id
          name
          tagline
          discussionUrl
          websiteUrl
          votesCount
          commentsCount
          thumbnail { url }
          makers { name }
          topics { name }
        }
      }
    }
  }
`;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const token = process.env.PRODUCTHUNT_DEVELOPER_TOKEN;
  if (!token) {
    return res
      .status(500)
      .json({
        success: false,
        error: "PRODUCTHUNT_DEVELOPER_TOKEN not configured",
      });
  }

  const limit = Math.min(
    Math.max(
      parseInt(req.query.limit || DEFAULT_LIMIT, 10) || DEFAULT_LIMIT,
      1,
    ),
    25,
  );

  try {
    const response = await fetch(PRODUCT_HUNT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: PRODUCT_HUNT_QUERY,
        variables: { first: limit },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Product Hunt API error: ${response.status} ${text}`);
    }

    const data = await response.json();
    if (data.errors?.length) {
      throw new Error(data.errors.map((e) => e.message).join(" | "));
    }

    const posts = (data.data?.posts?.edges || []).map((edge) => {
      const node = edge.node || {};
      return {
        id: node.id,
        name: node.name,
        tagline: node.tagline,
        url: node.discussionUrl || node.websiteUrl || null,
        votes: node.votesCount ?? 0,
        comments: node.commentsCount ?? 0,
        image: node.thumbnail?.url || null,
        makers: (node.makers || []).map((maker) => maker.name).filter(Boolean),
        topics: (node.topics || []).map((topic) => topic.name).filter(Boolean),
      };
    });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("[producthunt] error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Unexpected error" });
  }
}
