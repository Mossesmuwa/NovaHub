// packages/shared/lib/categoryRenderers.js
// Category-specific rendering for items on detail pages

export const categoryFeatures = {
  movies: {
    name: "Movies",
    fields: ["trailer_url", "runtime", "rating", "director", "release_year"],
    icon: "🎬",
    renderExtra: (item) => ({
      hasTrailer: !!item.trailer_url,
      duration: item.runtime || "N/A",
      director: item.director || "Unknown",
      year: item.release_year || new Date().getFullYear(),
    }),
  },
  games: {
    name: "Games",
    fields: ["developer", "platform", "release_date", "rating", "playtime"],
    icon: "🎮",
    renderExtra: (item) => ({
      dev: item.developer || "Indie",
      platforms: item.platform || "Multi-platform",
      date: item.release_date,
    }),
  },
  apps: {
    name: "Apps",
    fields: ["platform", "version", "downloads", "rating", "category"],
    icon: "📱",
    renderExtra: (item) => ({
      platforms: item.platform || ["iOS", "Android"],
      version: item.version || "Latest",
      downloads: item.downloads || "1M+",
    }),
  },
  articles: {
    name: "Articles",
    fields: ["source", "author", "reading_time", "excerpt", "date"],
    icon: "📰",
    renderExtra: (item) => ({
      source: item.source || "News",
      author: item.author || "Staff",
      readTime: item.reading_time || "5 min",
      isReadable: true,
    }),
  },
  books: {
    name: "Books",
    fields: ["author", "publisher", "isbn", "pages", "publication_date"],
    icon: "📚",
    renderExtra: (item) => ({
      author: item.author || "Unknown",
      publisher: item.publisher || "Self-published",
      pages: item.pages || "Unknown",
      year: item.publication_date?.split("-")[0],
    }),
  },
  courses: {
    name: "Courses",
    fields: ["instructor", "platform", "level", "duration", "certification"],
    icon: "🎓",
    renderExtra: (item) => ({
      instructor: item.instructor || "Expert",
      platform: item.platform || "Online",
      level: item.level || "Beginner",
      duration: item.duration || "Self-paced",
      hasCert: !!item.certification,
    }),
  },
  tools: {
    name: "Tools",
    fields: ["language", "github_url", "npm_package", "version", "license"],
    icon: "🔧",
    renderExtra: (item) => ({
      lang: item.language || "JavaScript",
      gitHub: !!item.github_url,
      npm: !!item.npm_package,
      version: item.version || "Latest",
    }),
  },
  music: {
    name: "Music",
    fields: ["artist", "album", "genre", "release_date", "duration"],
    icon: "🎵",
    renderExtra: (item) => ({
      artist: item.artist || "Unknown",
      album: item.album || "Single",
      genre: item.genre || "Pop",
      year: item.release_date?.split("-")[0],
    }),
  },
};

export const getCategoryInfo = (categoryId) => {
  return categoryFeatures[categoryId] || categoryFeatures.tools;
};

export const renderCategorySpecific = (item, category) => {
  const info = getCategoryInfo(category);
  return {
    ...info,
    ...info.renderExtra(item),
  };
};
