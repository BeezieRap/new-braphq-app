// utils/ipfs.ts
export function resolveIPFSUrl(url?: string) {
  if (!url) return "/placeholder.png";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
}
