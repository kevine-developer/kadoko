export const getIconName = (title: string): any => {
  const lower = title.toLowerCase();
  if (lower.includes("instagram")) return "logo-instagram";
  if (lower.includes("twitter") || lower.includes("x")) return "logo-twitter";
  if (lower.includes("tiktok")) return "logo-tiktok";
  if (lower.includes("facebook")) return "logo-facebook";
  if (lower.includes("linkedin")) return "logo-linkedin";
  if (lower.includes("youtube")) return "logo-youtube";
  return "link-outline";
};