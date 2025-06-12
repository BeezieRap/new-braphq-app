// src/components/NFTGrid.tsx
import React from "react";
import NFTCard, { LoadingNFTComponent } from "./NFT";

type NFTDataItem = {
  tokenId: bigint;
  assetContractAddress: string;
  listingType?: string;
  listing?: any;
};

type Props = {
  nftData: NFTDataItem[];
  overrideOnclickBehavior?: (nft: any) => void;
  emptyText?: string;
};

export default function NFTGrid({
  nftData,
  overrideOnclickBehavior,
  emptyText = "No NFTs found for this collection.",
}: Props) {
  if (nftData.length > 0) {
    return (
      <div className="flex flex-wrap gap-6 justify-center">
        {nftData.map((nftObj) => (
          <NFTCard
            key={`${nftObj.assetContractAddress}-${nftObj.tokenId.toString()}`}
            assetContractAddress={
              nftObj.assetContractAddress
            }
            tokenId={nftObj.tokenId}
            listingType={
              nftObj.listingType ?? "direct-listing"
            }
            listing={nftObj.listing}
            overrideOnclickBehavior={
              overrideOnclickBehavior
            }
          />
        ))}
      </div>
    );
  }

  return <div>{emptyText}</div>;
}

export function NFTGridLoading() {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {[...Array(20)].map((_, index) => (
        <LoadingNFTComponent key={index} />
      ))}
    </div>
  );
}
