export function formatTrend(percent) {
  return percent > 0 ? `↑ +${percent}%` : `↓ ${percent}%`;
}

export function formatDate(date) {
  const hours = Math.floor((Date.now() - new Date(date)) / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
