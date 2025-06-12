"use client";
import React, { useEffect, useState } from "react";
import { getContract } from "thirdweb";
import { getNFT } from "thirdweb/extensions/erc721";
import { avalanche } from "thirdweb/chains";
import { client } from "@/app/client";
import { MediaRenderer } from "thirdweb/react";
import Skeleton from "@/components/Skeleton";
import { useRouter } from "next/navigation";

type Props = {
  assetContractAddress: string;
  tokenId: bigint;
  listingType: string;
  listing: any;
  overrideOnclickBehavior?: (nft: any) => void;
};

export default function NFTCard({
  assetContractAddress,
  tokenId,
  listingType,
  listing,
  overrideOnclickBehavior,
}: Props) {
  const router = useRouter();
  const [nft, setNFT] = useState<any>(null);

  useEffect(() => {
    getNFT({
      contract: getContract({
        client,
        chain: avalanche,
        address: assetContractAddress,
      }),
      tokenId,
      includeOwner: true,
    }).then(setNFT);
  }, [assetContractAddress, tokenId]);

  if (!nft) {
    return <LoadingNFTComponent />;
  }

  return (
    <div
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col w-full h-[350px] bg-white/[.04] justify-stretch border overflow-hidden border-white/10 rounded-lg"
      onClick={
        overrideOnclickBehavior
          ? () => overrideOnclickBehavior(nft)
          : () =>
              router.push(
                `/token/${assetContractAddress}/${tokenId.toString()}`,
              )
      }
    >
      <div className="relative w-full h-64 bg-white/[.04] group overflow-visible">
        {nft.metadata.image && (
          <div className="transition-transform duration-300 group-hover:scale-125 hover:scale-125 w-full h-full">
            <MediaRenderer
              src={nft.metadata.image}
              client={client}
              className="object-cover object-center w-full h-full"
            />
          </div>
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
        {listingType === "direct-listing" &&
          listing?.currencyValuePerToken && (
            <div className="flex flex-col items-end justify-center">
              <p className="max-w-full mb-1 overflow-hidden font-medium text-black whitespace-nowrap text-white/60">
                Price
              </p>
              <p className="max-w-full overflow-hidden text-black whitespace-nowrap">
                {listing.currencyValuePerToken.displayValue}
                {listing.currencyValuePerToken.symbol}
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
