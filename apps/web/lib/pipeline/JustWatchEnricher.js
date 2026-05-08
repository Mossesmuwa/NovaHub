// lib/pipeline/JustWatchEnricher.js
// Adds streaming availability to existing movies.
// Uses JustWatch's public GraphQL API — no key needed.

import { supabaseAdmin } from "../supabaseAdmin.js";

const JW_API = "https://apis.justwatch.com/graphql";

const STREAMING_QUERY = `
query GetStreamingOffers($title: String!, $country: String!) {
  popularTitles(
    country: $country
    filters: { searchQuery: $title }
    first: 1
  ) {
    edges {
      node {
        ... on Movie {
          id
          content(country: $country, language: "en") {
            title
            posterUrl
          }
          offerCount(country: $country, platform: WEB)
          offers(country: $country, platform: WEB) {
            monetizationType
            retailPrice(language: "en")
            package {
              packageId
              clearName
              icon
            }
          }
        }
        ... on Show {
          id
          content(country: $country, language: "en") {
            title
          }
          offers(country: $country, platform: WEB) {
            monetizationType
            package {
              packageId
              clearName
            }
          }
        }
      }
    }
  }
}
`;

// Top streaming services to highlight
const PRIORITY_SERVICES = [
  "netflix",
  "disney",
  "hbo",
  "hulu",
  "amazon",
  "apple",
  "paramount",
  "peacock",
  "showtime",
  "mubi",
];

function rankOffers(offers = []) {
  return offers
    .filter((o) => o.package?.clearName)
    .sort((a, b) => {
      const aName = a.package.clearName.toLowerCase();
      const bName = b.package.clearName.toLowerCase();
      const aRank = PRIORITY_SERVICES.findIndex((s) => aName.includes(s));
      const bRank = PRIORITY_SERVICES.findIndex((s) => bName.includes(s));
      if (aRank === -1 && bRank === -1) return 0;
      if (aRank === -1) return 1;
      if (bRank === -1) return -1;
      return aRank - bRank;
    })
    .slice(0, 5)
    .map((o) => ({
      service: o.package.clearName,
      type: o.monetizationType, // FLATRATE, RENT, BUY, FREE
      price: o.retailPrice || null,
    }));
}

export async function enrichWithStreaming(country = "US") {
  const tag = "[JustWatchEnricher]";
  const stats = { enriched: 0, notFound: 0, errors: [] };

  // Get movies without streaming data
  // FIX: removed broken JSON filter (.is('metadata->streaming', null))
  const { data: movies, error } = await supabaseAdmin
    .from("items")
    .select("id, name, year, metadata")
    .eq("approved", true)
    .eq("category_id", "movies")
    .limit(100);

  if (error) {
    console.error(`${tag} Fetch error:`, error.message);
    return { enriched: 0, errors: [error.message] };
  }

  console.log(`${tag} Enriching ${movies.length} movies with streaming data`);

  for (const movie of movies) {
    try {
      // Skip if already has streaming data (safe JS check instead of broken SQL filter)
      if (movie.metadata?.streaming) {
        continue;
      }

      const res = await fetch(JW_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: STREAMING_QUERY,
          variables: { title: movie.name, country },
        }),
      });

      if (!res.ok) {
        stats.errors.push(`${movie.name}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const node = data?.data?.popularTitles?.edges?.[0]?.node;

      if (!node) {
        stats.notFound++;
        continue;
      }

      const offers = rankOffers(node.offers || []);
      const flatrate = offers
        .filter((o) => o.type === "FLATRATE")
        .map((o) => o.service);
      const rent = offers
        .filter((o) => o.type === "RENT")
        .map((o) => o.service);
      const free = offers
        .filter((o) => o.type === "FREE")
        .map((o) => o.service);

      // Get existing metadata first
      const { data: existing } = await supabaseAdmin
        .from("items")
        .select("metadata")
        .eq("id", movie.id)
        .single();

      const updatedMetadata = {
        ...(existing?.metadata || {}),
        streaming: {
          flatrate,
          rent,
          free,
          updated_at: new Date().toISOString(),
        },
      };

      const { error: updateErr } = await supabaseAdmin
        .from("items")
        .update({ metadata: updatedMetadata })
        .eq("id", movie.id);

      if (updateErr) {
        stats.errors.push(updateErr.message);
      } else {
        console.log(
          `${tag} ✓ ${movie.name} — streaming on: ${flatrate.join(", ") || "none"}`,
        );
        stats.enriched++;
      }

      // Be polite
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.warn(`${tag} ${movie.name}:`, err.message);
      stats.errors.push(`${movie.name}: ${err.message}`);
    }
  }

  console.log(
    `${tag} Done — enriched: ${stats.enriched}, not found: ${stats.notFound}`,
  );
  return stats;
}
