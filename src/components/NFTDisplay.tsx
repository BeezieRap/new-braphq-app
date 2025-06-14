import React, { useEffect, useState } from "react";
import { resolveIPFSUrl } from "../utils/ipfs";

const nftLinks = [
  {
    name: "Core bumba beez",
    uri: "ipfs://QmVEJNhDSZE1jkgC9bDGYoQWU5Thefj8YBbRyvhmkCs8/0",
  },
  {
    name: "bad azz bumba beez",
    uri: "ipfs://QmZ6e2dt51RvH9G5gMUSunZPRGqMRo9TLuyibEW7ckKJhj/0",
  },
  {
    name: "betaverse bumba beez",
    uri: "ipfs://QmcjUA6xA5rLjiEeBmZE3XhaDopXojaXw3YNJ9R97G1o15/0",
  },
];

type NFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
};

export default function NFTDisplay() {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchNFTs() {
      const results = await Promise.all(
        nftLinks.map(async (nft) => {
          const url = resolveIPFSUrl(nft.uri);
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            // Ensure all fields have fallback values
            return {
              name: data.name || nft.name || "Unknown NFT",
              description:
                data.description ||
                "No description available.",
              image: data.image
                ? resolveIPFSUrl(data.image)
                : "/placeholder.png",
            };
          } catch (e) {
            return {
              name: nft.name,
              description: "Failed to load metadata.",
              image: "/placeholder.png",
            };
          }
        }),
      );
      if (!cancelled) setNfts(results);
    }
    fetchNFTs();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1>Bumba Beez NFTs</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        {nfts.map((nft, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              width: 250,
            }}
          >
            <img
              src={nft.image || "/placeholder.png"}
              alt={nft.name || "NFT"}
              style={{ width: "100%", height: "auto" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/placeholder.png";
              }}
            />
            <h2>{nft.name || "Unknown NFT"}</h2>
            <p>
              {nft.description ||
                "No description available."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
