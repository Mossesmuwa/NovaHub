export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const found = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!found) return null;
  return decodeURIComponent(found.split("=")[1] || "");
}

export function hasCookie(name) {
  return Boolean(getCookie(name));
}

export function setCookie(name, value, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
