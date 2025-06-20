"use client";

import React, { useCallback, useActionState, useState } from "react";
import {
  useReadContract,
  useActiveAccount,
} from "thirdweb/react";
import { getContract, sendTransaction } from "thirdweb";
import {
  getAllListings,
  buyFromListing,
} from "thirdweb/extensions/marketplace";
import { avalanche } from "thirdweb/chains";
import { client } from "@/app/client";
import { MARKETPLACE_ADDRESS } from "@/const/contracts";
import Image from "next/image";
import { resolveIPFSUrl } from "@/utils/ipfs";

export default function BuyPage() {
  const [pendingId, setPendingId] = useState<string | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(
    null,
  );

  const account = useActiveAccount();
  const marketplace = getContract({
    client,
    chain: avalanche,
    address: MARKETPLACE_ADDRESS,
  });

  const {
    data: listings,
    isLoading,
    error,
    refetch,
  } = useReadContract(getAllListings, {
    contract: marketplace,
  });

  const handleBuy = useCallback(
    async (listing: any) => {
      setErrorMsg(null);
      if (!account) {
        setErrorMsg("Please connect your wallet.");
        return;
      }
      setPendingId(listing.id);
      try {
        const transaction = buyFromListing({
          contract: marketplace,
          listingId: BigInt(listing.id),
          quantity: 1n,
          recipient: account.address,
        });
        await sendTransaction({ transaction, account });
        setErrorMsg(null);
        refetch();
      } catch (err: any) {
        setErrorMsg(
          err.message ||
            "Transaction failed. You may not have enough AVAX to complete this purchase.",
        );
      } finally {
        setPendingId(null);
      }
    },
    [account, marketplace, refetch],
  );

  if (isLoading)
    return <div className="text-black">Loading...</div>;
  if (error)
    return (
      <div className="text-black">
        Error loading NFTs: {error.message}
      </div>
    );

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">
        Buy Bumba Beez!
      </h1>
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {errorMsg}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {listings && listings.length > 0 ? (
          listings.map((listing: any) => {
            // Log the listing metadata for debugging
            console.log(
              "Listing metadata:",
              listing.asset?.metadata,
            );

            const metadata = listing.asset?.metadata || {};
            const name = metadata.name || "Untitled NFT";
            const description =
              metadata.description ||
              "No description available.";
            const image = metadata.image
              ? resolveIPFSUrl(metadata.image)
              : "/placeholder.png";

            const hasPrice =
              listing.currencyValuePerToken &&
              listing.currencyValuePerToken.displayValue &&
              listing.currencyValuePerToken.symbol;

            return (
              <div
                key={listing.id}
                className="border rounded-lg p-4 bg-white shadow"
              >
                <Image
                  src={image}
                  alt={name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder.png";
                  }}
                  unoptimized
                />
                <h2 className="text-xl font-bold mt-2 text-black">
                  {name}
                </h2>
                <p className="text-black">{description}</p>
                {hasPrice ? (
                  <button
                    className="mt-6 w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 transition"
                    onClick={() => handleBuy(listing)}
                    disabled={pendingId === listing.id}
                  >
                    {pendingId === listing.id ? (
                      "Processing..."
                    ) : (
                      <>
                        Buy for{" "}
                        {
                          listing.currencyValuePerToken
                            .displayValue
                        }{" "}
                        {
                          listing.currencyValuePerToken
                            .symbol
                        }
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-6 text-gray-500 font-semibold">
                    Not for sale
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-black">
            Oops all our Bumba Beez are sold out!
          </div>
        )}
      </div>
    </main>
  );
}
