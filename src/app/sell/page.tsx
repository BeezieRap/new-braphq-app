"use client";

import React, { useState, useEffect } from "react";
import {
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { createListing } from "thirdweb/extensions/marketplace";
import { avalanche } from "thirdweb/chains";
import { client } from "@/app/client";
import {
  NFT_COLLECTIONS,
  MARKETPLACE_ADDRESS,
  BRAP_TOKEN_ADDRESS,
} from "@/const/contracts";
import Image from "next/image";

// Helper to resolve IPFS images
function resolveImageUrl(url?: string) {
  if (!url) return "/placeholder.png";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
}

// Dexscreener hook for BRAPTKN/AVAX price
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

// Subcomponent for each collection
function CollectionNFTs({
  contractAddress,
  account,
  prices,
  setPrices,
  listingStatus,
  setListingStatus,
}: {
  contractAddress: string;
  account: { address: string } | null;
  prices: { [key: string]: string };
  setPrices: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  listingStatus: { [key: string]: string };
  setListingStatus: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
}) {
  // All hooks are at the top level
  const contract = getContract({
    client,
    chain: avalanche,
    address: contractAddress,
  });

  const { data: nfts } = useReadContract(getOwnedNFTs, {
    contract,
    owner: account?.address || "",
  });

  // Handle price input change
  function handlePriceChange(
    tokenId: string,
    value: string,
  ) {
    setPrices((prev) => ({ ...prev, [tokenId]: value }));
  }

  // Handle sell/listing
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
      // Create a direct listing
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

  if (!nfts || nfts.length === 0) return null;

  return (
    <>
      {nfts.map((nft: any) => (
        <div
          key={`${contractAddress}-${nft.id.toString()}`}
          className="border rounded-lg p-4 bg-white shadow"
        >
          <Image
            src={resolveImageUrl(nft.metadata?.image)}
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
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Price in BRAP"
            className="mt-4 w-full p-2 border rounded text-black"
            value={prices[nft.id.toString()] || ""}
            onChange={(e) =>
              handlePriceChange(
                nft.id.toString(),
                e.target.value,
              )
            }
          />
          <button
            className="mt-4 w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 transition"
            onClick={() =>
              handleSell({ ...nft, contractAddress })
            }
            disabled={
              listingStatus[nft.id.toString()] === "listing"
            }
          >
            {listingStatus[nft.id.toString()] === "listing"
              ? "Listing..."
              : listingStatus[nft.id.toString()] ===
                  "success"
                ? "Listed!"
                : "Sell"}
          </button>
        </div>
      ))}
    </>
  );
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {account ? (
          NFT_COLLECTIONS.map((address: string) => (
            <CollectionNFTs
              key={address}
              contractAddress={address}
              account={account}
              prices={prices}
              setPrices={setPrices}
              listingStatus={listingStatus}
              setListingStatus={setListingStatus}
            />
          ))
        ) : (
          <div className="text-black col-span-3">
            Connect your wallet to see your NFTs.
          </div>
        )}
      </div>
    </main>
  );
}
