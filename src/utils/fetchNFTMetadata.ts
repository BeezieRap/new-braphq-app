import { resolveIPFSUrl } from "@/utils/ipfs";

/**
 * Fetches and parses NFT metadata from an IPFS URI or HTTP(S) URL.
 * @param uri The IPFS URI (e.g., ipfs://...) or HTTP(S) URL.
 * @returns The parsed metadata object.
 * @throws If the fetch fails or the response is not valid JSON.
 */
export async function fetchNFTMetadata(
  uri: string,
): Promise<any> {
  // Convert IPFS URI to HTTP gateway URL if needed
  const url = uri.startsWith("ipfs://")
    ? resolveIPFSUrl(uri)
    : uri;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch metadata from ${url}: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}
