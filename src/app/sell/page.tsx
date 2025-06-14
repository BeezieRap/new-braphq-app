"use client";

import React, { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { getNFT } from "thirdweb/extensions/erc721";
import { createListing } from "thirdweb/extensions/marketplace";
import { avalanche } from "thirdweb/chains";
import { client } from "@/app/client";
import {
  MARKETPLACE_ADDRESS,
  BRAP_TOKEN_ADDRESS,
} from "@/const/contracts";
import Image from "next/image";
import { resolveIPFSUrl } from "@/utils/ipfs";

const COLLECTIONS = [
  {
    label: "Bad Azz Bumba Beez",
    address: "0x0924319a7524cf023356Ace4D5018fADDE0c60C8",
  },
  {
    label: "Betaverse Bumba Beez",
    address: "0x317F0FCB1d14C8aaA33F839B43B1aa92845a8145",
  },
  {
    label: "Core Bumba Beez",
    address: "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
  },
];

const TOKEN_IDS = [0, 1, 2, 3, 4];

async function fetchAllOwnedNFTs(
  accountAddress: string | undefined,
) {
  const allNFTs: any[] = [];
  if (!accountAddress) return allNFTs;
  for (const col of COLLECTIONS) {
    const contract = getContract({
      client,
      chain: avalanche,
      address: col.address,
    });
    for (const tokenId of TOKEN_IDS) {
      try {
        const nft = await getNFT({
          contract,
          tokenId: BigInt(tokenId),
        });
        if (
          nft.owner &&
          nft.owner.toLowerCase() ===
            accountAddress.toLowerCase()
        ) {
          allNFTs.push({
            ...nft,
            collectionLabel: col.label,
            contractAddress: col.address,
          });
        }
      } catch (e) {
        // NFT may not exist, skip
      }
    }
  }
  return allNFTs;
}

const DEXSCREENER_API =
  "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x5b3ff4d494e9ee69ee0f52ab9656cffe99d4839e";

function useBrapPrice() {
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(DEXSCREENER_API);
        const data = await res.json();
        setPrice(data.pair?.priceNative || null);
      } catch (err) {
        setPrice(null);
      }
    }
    fetchPrice();
  }, []);

  return price;
}

export default function SellPage() {
  const account = useActiveAccount();
  const brapPrice = useBrapPrice();
  const [prices, setPrices] = useState<{
    [key: string]: string;
  }>({});
  const [listingStatus, setListingStatus] = useState<{
    [key: string]: string;
  }>({});
  const [allNFTs, setAllNFTs] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(true);

  useEffect(() => {
    setLoadingNFTs(true);
    fetchAllOwnedNFTs(account?.address).then((nfts) => {
      setAllNFTs(nfts);
      setLoadingNFTs(false);
    });
  }, [account]);

  async function handleSell(nft: any) {
    if (!account)
      return alert("Connect your wallet first!");
    const price = prices[nft.id.toString()];
    if (
      !price ||
      isNaN(Number(price)) ||
      Number(price) <= 0
    ) {
      return alert("Enter a valid price.");
    }
    setListingStatus((prev) => ({
      ...prev,
      [nft.id.toString()]: "listing",
    }));

    try {
      const marketplace = getContract({
        client,
        chain: avalanche,
        address: MARKETPLACE_ADDRESS,
      });
      await createListing({
        contract: marketplace,
        assetContractAddress: nft.contractAddress,
        tokenId: nft.id,
        pricePerToken: price,
        currencyContractAddress: BRAP_TOKEN_ADDRESS,
        quantity: 1n,
        startTimestamp: new Date(),
        endTimestamp: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      });
      setListingStatus((prev) => ({
        ...prev,
        [nft.id.toString()]: "success",
      }));
      alert("NFT listed for sale!");
    } catch (err: any) {
      setListingStatus((prev) => ({
        ...prev,
        [nft.id.toString()]: "error",
      }));
      alert("Failed to list NFT: " + (err?.message || err));
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-2 text-black">
        Jeet Your Bumba Beez
      </h1>
      <div className="mb-4 text-black font-semibold">
        {brapPrice
          ? `Current Price: 1 BRAPTKN = ${brapPrice} AVAX`
          : "Fetching BRAPTKN price..."}
      </div>
      <div className="mb-6 text-black">
        {account ? (
          <div>
            <span className="font-semibold">
              Connected Wallet:
            </span>{" "}
            {account.address}
          </div>
        ) : (
          <div>Connect your wallet Jeeter!.</div>
        )}
      </div>
      {loadingNFTs ? (
        <div className="text-black">
          Loading your NFTs...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allNFTs.length === 0 ? (
            <div className="text-black col-span-3">
              You don't own any NFTs from these collections.
            </div>
          ) : (
            allNFTs.map((nft: any) => (
              <div
                key={`${nft.contractAddress}-${nft.id.toString()}`}
                className="border rounded-lg p-4 bg-white shadow"
              >
                <Image
                  src={resolveIPFSUrl(nft.metadata?.image)}
                  alt={nft.metadata?.name || "NFT"}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover rounded"
                />
                <h2 className="text-xl font-bold mt-2 text-black">
                  {nft.metadata?.name || "Untitled NFT"}
                </h2>
                <p className="text-black">
                  {nft.metadata?.description || ""}
                </p>
                <div className="text-sm text-gray-600 mt-2">
                  {nft.collectionLabel}
                </div>
                <div className="text-xs text-gray-400">
                  Token ID: {nft.id?.toString()}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Price in BRAP"
                  className="mt-4 w-full p-2 border rounded text-black"
                  value={prices[nft.id.toString()] || ""}
                  onChange={(e) =>
                    setPrices((prev) => ({
                      ...prev,
                      [nft.id.toString()]: e.target.value,
                    }))
                  }
                />
                <button
                  className="mt-4 w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 transition"
                  onClick={() => handleSell(nft)}
                  disabled={
                    listingStatus[nft.id.toString()] ===
                    "listing"
                  }
                >
                  {listingStatus[nft.id.toString()] ===
                  "listing"
                    ? "Listing..."
                    : listingStatus[nft.id.toString()] ===
                        "success"
                      ? "Listed!"
                      : "Sell"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
