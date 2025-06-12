"use client";
import React, { useEffect, useState } from "react";
import { getContract } from "thirdweb";
import { NFT_COLLECTION } from "@/const/contracts";
import { getNFT } from "thirdweb/extensions/erc721";
import { MediaRenderer } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { avalanche } from "thirdweb/chains";
import { client } from "@/app/client";
import Skeleton from "@/components/Skeleton";

type Props = {
  tokenId: bigint;
  nft?: any; // Use the correct NFT type if you have it from v5 typings
  listingType?: "direct-listing" | "english-auction";
  listing?: any;
  overrideOnclickBehavior?: (nft: any) => void;
};

export default function NFTCard({
  tokenId,
  nft: initialNFT,
  listingType,
  listing,
  overrideOnclickBehavior,
}: Props) {
  const router = useRouter();
  const [nft, setNFT] = useState(initialNFT);

  useEffect(() => {
    if (!nft || nft.id !== tokenId) {
      getNFT({
        contract: getContract({
          client,
          chain: avalanche,
          address: NFT_COLLECTION,
        }),
        tokenId,
        includeOwner: true,
      }).then(setNFT);
    }
  }, [tokenId, nft]);

  if (!nft) {
    return <LoadingNFTComponent />;
  }

  // Price display logic for direct listing or auction
  let priceDisplay = null;
  if (
    listingType === "direct-listing" &&
    listing?.currencyValuePerToken
  ) {
    priceDisplay = (
      <>
        {listing.currencyValuePerToken.displayValue}
        {listing.currencyValuePerToken.tokenAddress ===
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          ? "AVAX"
          : listing.currencyValuePerToken.symbol}
      </>
    );
  } else if (
    listingType === "english-auction" &&
    listing?.minimumBidCurrencyValue
  ) {
    priceDisplay = (
      <>
        {listing.minimumBidCurrencyValue.displayValue}
        {listing.minimumBidCurrencyValue.tokenAddress ===
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          ? "AVAX"
          : listing.minimumBidCurrencyValue.symbol}
      </>
    );
  }

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full h-[350px] bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={
        overrideOnclickBehavior
          ? () => overrideOnclickBehavior(nft)
          : () =>
              router.push(
                `/token/${NFT_COLLECTION}/${tokenId.toString()}`,
              )
      }
    >
      <div className="relative w-full h-64 bg-white/[.04]">
        {nft.metadata.image && (
          <MediaRenderer
            src={nft.metadata.image}
            client={client}
            className="object-cover object-center"
          />
        )}
      </div>
      <div className="flex items-center justify-between flex-1 w-full px-3">
        <div className="flex flex-col justify-center py-3">
          <p className="max-w-full overflow-hidden text-lg text-black whitespace-nowrap">
            {nft.metadata.name}
          </p>
          <p className="text-sm font-semibold text-black">
            #{nft.id.toString()}
          </p>
        </div>
        {priceDisplay && (
          <div className="flex flex-col items-end justify-center">
            <p className="max-w-full mb-1 overflow-hidden font-medium text-black whitespace-nowrap text-white/60">
              Price
            </p>
            <p className="max-w-full overflow-hidden text-black whitespace-nowrap">
              {priceDisplay}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingNFTComponent() {
  return (
    <div className="w-full h-[350px] rounded-lg">
      <Skeleton width="100%" height="100%" />
    </div>
  );
}
