"use client";

import React, { useState, useEffect } from "react";
import {
  useActiveAccount,
  useSendTransaction,
  useWalletBalance,
} from "thirdweb/react";
import {
  getContract,
  prepareContractCall,
  readContract,
} from "thirdweb";
import {
  getOwnedNFTs,
  getNFT,
} from "thirdweb/extensions/erc721";
import { avalanche } from "thirdweb/chains";
import { client } from "@/app/client";
import { BRAP_TOKEN_ADDRESS } from "@/const/contracts";

const STAKING_PAIRS = [
  {
    label: "Queen Bee Nectar",
    collectionName: "Core Bumba Beez",
    collectionAddress:
      "0xA3DaEd128c483e38984f8374916A441a22CD8aDd",
    stakingAddress:
      "0xD86965fE1436B01dBD933cE433359D2255F2135D",
  },
  {
    label: "Degen Bee Nectar",
    collectionName: "Bad Azz Bumba Beez",
    collectionAddress:
      "0x0924319a7524cf023356Ace4D5018fADDE0c60C8", // <-- corrected
    stakingAddress:
      "0x6b391d65f21CA93A39E3B9715C55b320f580aD1a",
  },
  {
    label: "Beta Bee Nectar",
    collectionName: "Betaverse Bumba Beez",
    collectionAddress:
      "0x317F0FCB1d14C8aaA33F839B43B1aa92845a8145",
    stakingAddress:
      "0xB04fcfe7EB075BaC7040f1f647c12A55FA4FbB0f",
  },
];

function resolveImageUrl(url?: string) {
  if (!url) return "/placeholder.png";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
}

// Helper to format rewards as xx.xx
function formatTokenAmount(
  amount: string,
  decimals: number = 18,
) {
  if (!amount) return "0.00";
  const amt = BigInt(amount);
  const whole = amt / BigInt(10 ** decimals);
  const fraction = amt % BigInt(10 ** decimals);
  let fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .slice(0, 2);
  return `${whole.toString()}.${fractionStr}`;
}

export default function StakePage() {
  const account = useActiveAccount();

  // Fetch BRAP token balance
  const { data: brapBalance } = useWalletBalance({
    address: account?.address,
    chain: avalanche,
    client,
    tokenAddress: BRAP_TOKEN_ADDRESS,
  });

  const [actionStatus, setActionStatus] = useState<{
    [key: string]: string;
  }>({});
  const { mutate: sendTx } = useSendTransaction();

  // State for each collection
  const [stakeInfos, setStakeInfos] = useState<any[]>([]);
  const [
    stakedNFTsByCollection,
    setStakedNFTsByCollection,
  ] = useState<any[][]>([]);
  const [
    unstakedNFTsByCollection,
    setUnstakedNFTsByCollection,
  ] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      if (!account) {
        setStakeInfos([]);
        setStakedNFTsByCollection([]);
        setUnstakedNFTsByCollection([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      const allStakeInfos: any[] = [];
      const allStakedNFTs: any[][] = [];
      const allUnstakedNFTs: any[][] = [];

      for (const pair of STAKING_PAIRS) {
        // Contracts
        const nftContract = getContract({
          client,
          chain: avalanche,
          address: pair.collectionAddress,
        });
        const stakingContract = getContract({
          client,
          chain: avalanche,
          address: pair.stakingAddress,
        });

        // 1. Unstaked NFTs (all owned by user)
        let ownedNFTs: any[] = [];
        try {
          ownedNFTs =
            (await getOwnedNFTs({
              contract: nftContract,
              owner: account.address,
            })) || [];
        } catch {
          ownedNFTs = [];
        }

        // 2. Staked NFTs (token IDs)
        let stakeInfo: any = {
          tokensStaked: [],
          rewards: "0",
        };
        try {
          const res = await readContract({
            contract: stakingContract,
            method:
              "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256 _rewards)",
            params: [account.address],
          });
          stakeInfo = {
            tokensStaked:
              res?.[0]?.map((id: any) => id.toString()) ||
              [],
            rewards: res?.[1] ? res[1].toString() : "0",
          };
        } catch {
          stakeInfo = { tokensStaked: [], rewards: "0" };
        }
        allStakeInfos.push(stakeInfo);

        // 3. Fetch staked NFT metadata
        let stakedNFTs: any[] = [];
        if (stakeInfo.tokensStaked.length > 0) {
          stakedNFTs = await Promise.all(
            stakeInfo.tokensStaked.map(
              async (tokenId: string) => {
                try {
                  const nft = await getNFT({
                    contract: nftContract,
                    tokenId: BigInt(tokenId),
                  });
                  return {
                    ...nft,
                    contractAddress: pair.collectionAddress,
                  };
                } catch {
                  return null;
                }
              },
            ),
          );
        }
        stakedNFTs = stakedNFTs.filter(Boolean);

        // 4. Filter out staked NFTs from ownedNFTs
        const stakedIds = new Set(stakeInfo.tokensStaked);
        const unstakedNFTs = ownedNFTs
          .filter(
            (nft: any) => !stakedIds.has(nft.id.toString()),
          )
          .map((nft: any) => ({
            ...nft,
            contractAddress: pair.collectionAddress,
          }));

        allUnstakedNFTs.push(unstakedNFTs);
        allStakedNFTs.push(stakedNFTs);
      }

      if (!cancelled) {
        setStakeInfos(allStakeInfos);
        setStakedNFTsByCollection(allStakedNFTs);
        setUnstakedNFTsByCollection(allUnstakedNFTs);
        setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [account?.address, actionStatus]);

  // Staking/unstaking functions using prepareContractCall
  const handleStake = async (
    stakingAddress: string,
    nft: any,
  ) => {
    if (!account)
      return alert("Connect your wallet first!");
    setActionStatus((prev) => ({
      ...prev,
      [`${stakingAddress}-${nft.id}`]: "staking",
    }));
    try {
      const stakingContract = getContract({
        client,
        chain: avalanche,
        address: stakingAddress,
      });
      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function stake(uint256[] _tokenIds)",
        params: [[nft.id]],
      });
      await sendTx(transaction);
      setActionStatus((prev) => ({
        ...prev,
        [`${stakingAddress}-${nft.id}`]: "staked",
      }));
      alert(
        "GO YOU! For staking your Bumba Beez BRAP 🐝💨",
      );
    } catch (err: any) {
      setActionStatus((prev) => ({
        ...prev,
        [`${stakingAddress}-${nft.id}`]: "error",
      }));
      alert("Failed to stake: " + (err?.message || err));
    }
  };

  const handleUnstake = async (
    stakingAddress: string,
    nft: any,
  ) => {
    if (!account)
      return alert("Connect your wallet first!");
    const confirmUnstake = window.confirm(
      "Unstaking means no more FREE $BRAP TOKENS, are you sure?",
    );
    if (!confirmUnstake) return;
    setActionStatus((prev) => ({
      ...prev,
      [`${stakingAddress}-${nft.id}`]: "unstaking",
    }));
    try {
      const stakingContract = getContract({
        client,
        chain: avalanche,
        address: stakingAddress,
      });
      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function withdraw(uint256[] _tokenIds)",
        params: [[nft.id]],
      });
      await sendTx(transaction);
      setActionStatus((prev) => ({
        ...prev,
        [`${stakingAddress}-${nft.id}`]: "unstaked",
      }));
      alert("NFT unstaked!");
    } catch (err: any) {
      setActionStatus((prev) => ({
        ...prev,
        [`${stakingAddress}-${nft.id}`]: "error",
      }));
      alert("Failed to unstake: " + (err?.message || err));
    }
  };

  const handleClaim = async (stakingAddress: string) => {
    if (!account)
      return alert("Connect your wallet first!");
    setActionStatus((prev) => ({
      ...prev,
      [`${stakingAddress}-claim`]: "claiming",
    }));
    try {
      const stakingContract = getContract({
        client,
        chain: avalanche,
        address: stakingAddress,
      });
      const transaction = prepareContractCall({
        contract: stakingContract,
        method: "function claimRewards()",
        params: [],
      });
      await sendTx(transaction);
      setActionStatus((prev) => ({
        ...prev,
        [`${stakingAddress}-claim`]: "claimed",
      }));
      alert("Rewards claimed!");
    } catch (err: any) {
      setActionStatus((prev) => ({
        ...prev,
        [`${stakingAddress}-claim`]: "error",
      }));
      alert(
        "Failed to claim rewards: " + (err?.message || err),
      );
    }
  };

  return (
    <main className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-black">
        Stake Your NFTs
      </h1>
      <div className="mb-4 text-black font-semibold">
        {brapBalance
          ? `Your BRAP Balance: ${brapBalance.displayValue} ${brapBalance.symbol}`
          : "Fetching BRAP balance..."}
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
          <div>Connect your wallet to stake your NFTs.</div>
        )}
      </div>
      {loading ? (
        <div className="text-black">
          Loading your NFTs...
        </div>
      ) : (
        STAKING_PAIRS.map((pair, idx) => {
          const stakeInfo = stakeInfos[idx] || {
            tokensStaked: [],
            rewards: "0",
          };
          const unstakedNFTs =
            unstakedNFTsByCollection[idx] || [];
          const stakedNFTs =
            stakedNFTsByCollection[idx] || [];

          // Always render the section if the user owns or has staked NFTs from this collection
          return (
            <div
              key={pair.stakingAddress}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-2 text-black">
                {pair.label}
              </h2>
              <div className="mb-1 text-black font-semibold">
                NFT Collection: {pair.collectionName}
              </div>
              <div className="mb-1 text-black font-semibold">
                NFT Contract: {pair.collectionAddress}
              </div>
              <div className="mb-1 text-black font-semibold">
                Staking Contract: {pair.stakingAddress}
              </div>
              <div className="mb-2 text-black font-semibold">
                Claimable Rewards:{" "}
                {stakeInfo?.rewards || "0"} BRAP
              </div>
              <button
                className="mb-6 w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 transition"
                onClick={() =>
                  handleClaim(pair.stakingAddress)
                }
                disabled={
                  actionStatus[
                    `${pair.stakingAddress}-claim`
                  ] === "claiming"
                }
              >
                {actionStatus[
                  `${pair.stakingAddress}-claim`
                ] === "claiming"
                  ? "Claiming..."
                  : `Claim ${formatTokenAmount(stakeInfo?.rewards || "0")} $BRAPTKNs`}
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Unstaked NFTs */}
                {unstakedNFTs.length === 0 &&
                  stakedNFTs.length === 0 && (
                    <div className="text-black col-span-3">
                      You don't own or have staked any NFTs
                      from this collection.
                    </div>
                  )}
                {unstakedNFTs.map((nft: any) => (
                  <div
                    key={`unstaked-${nft.contractAddress}-${nft.id.toString()}-${pair.stakingAddress}`}
                    className="border rounded-lg p-4 bg-white shadow border"
                  >
                    <img
                      src={resolveImageUrl(
                        nft.metadata?.image,
                      )}
                      alt={nft.metadata?.name || "NFT"}
                      className="w-full h-64 object-cover rounded"
                    />
                    <h2 className="text-xl font-bold mt-2 text-black">
                      {nft.metadata?.name || "Untitled NFT"}
                    </h2>
                    <p className="text-black">
                      {nft.metadata?.description || ""}
                    </p>
                    <div className="mt-2 text-black font-semibold">
                      <span className="inline-block px-2 py-1 bg-gray-200 rounded text-black font-bold">
                        Not Staked
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        className="w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 transition"
                        onClick={() =>
                          handleStake(
                            pair.stakingAddress,
                            nft,
                          )
                        }
                        disabled={
                          actionStatus[
                            `${pair.stakingAddress}-${nft.id}`
                          ] === "staking"
                        }
                      >
                        {actionStatus[
                          `${pair.stakingAddress}-${nft.id}`
                        ] === "staking"
                          ? "Staking..."
                          : "Stake Bumba Beez"}
                      </button>
                    </div>
                  </div>
                ))}
                {/* Staked NFTs */}
                {stakedNFTs.map((nft: any) => (
                  <div
                    key={`staked-${nft.contractAddress}-${nft.id.toString()}-${pair.stakingAddress}`}
                    className="border rounded-lg p-4 bg-white shadow border-4 border-yellow-400"
                  >
                    <img
                      src={resolveImageUrl(
                        nft.metadata?.image,
                      )}
                      alt={nft.metadata?.name || "NFT"}
                      className="w-full h-64 object-cover rounded"
                    />
                    <h2 className="text-xl font-bold mt-2 text-black">
                      {nft.metadata?.name || "Untitled NFT"}
                    </h2>
                    <p className="text-black">
                      {nft.metadata?.description || ""}
                    </p>
                    <div className="mt-2 text-black font-semibold">
                      <span className="inline-block px-2 py-1 bg-yellow-200 rounded text-black font-bold">
                        Staked
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        className="w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 transition"
                        onClick={() =>
                          handleUnstake(
                            pair.stakingAddress,
                            nft,
                          )
                        }
                        disabled={
                          actionStatus[
                            `${pair.stakingAddress}-${nft.id}`
                          ] === "unstaking"
                        }
                      >
                        {actionStatus[
                          `${pair.stakingAddress}-${nft.id}`
                        ] === "unstaking"
                          ? "Unstaking..."
                          : "Unstake Bumba Beez"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </main>
  );
}
