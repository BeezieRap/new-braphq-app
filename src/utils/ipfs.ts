/**
 * Converts an IPFS URI (ipfs://...) to an HTTP gateway URL.
 * If the input is already an HTTP(S) URL, returns it unchanged.
 */
export function resolveIPFSUrl(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
}
