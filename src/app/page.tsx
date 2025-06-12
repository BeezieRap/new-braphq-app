"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen text-black">
      <div className="flex justify-center p-2">
        <Image
          src="/brap-hq-logo.png"
          width={860}
          height={540}
          alt="brap hq logo, NFT marketplace"
          quality={100}
          className="max-w-screen mb-2"
          priority
        />
      </div>

      <div className="px-8 mx-auto text-center">
        <h1 className="mb-4 font-bold text-6xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            MINT | STAKE | EARN 🐝💨
          </span>
          <br />
          Join the swarm!
        </h1>

        <p className="text-gray-800 text-lg max-w-2xl mx-auto mb-4">
          <strong>BRAP HQ</strong> — the official home of
          the swarm and the BRAP ecosystem. Built on
          Avalanche, this is where music, culture, and
          crypto collide. Discover our exclusive one-of-one{" "}
          <strong className="text-yellow-800">
            Bumba Beez
          </strong>{" "}
          NFT collections. Stake NFTs to earn monthly
          $BRAPTKN rewards through our unique nectar tiering
          system. From the bold{" "}
          <em className="text-orange-700">
            Bad Azz Bumba Beez
          </em>{" "}
          to the super fly{" "}
          <em className="text-orange-600">
            Betaverse Beez
          </em>
          , each collection earns a different amount of
          monthly $BRAPTKN to keep our community
          replenished. Dive into the marketplace to collect
          your Bumba Bee or a fire Track. Stake to grow your
          nectar. You can buy or swap BRAP on Trader Joe.
          Whether you are here to collect, earn, or vibe —
          BRAP HQ is your buzzing headquarters. 🐝💨
        </p>

        <div className="flex flex-wrap justify-center text-lg font-medium items-center mt-10 gap-4">
          <Link
            className="w-56 p-3 rounded-lg transition-all hover:shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black border border-yellow-500 text-center"
            href="https://x.com/BrumBeezieRap"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow BRAP on X
          </Link>
          <Link
            className="w-56 p-3 rounded-lg transition-all hover:shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black border border-yellow-500 text-center"
            href="https://arena.social/?ref=BrumBeezieRap"
            target="_blank"
            rel="noopener noreferrer"
          >
            Swarm on Arena
          </Link>
          <Link
            className="w-56 p-3 rounded-lg transition-all hover:shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black border border-yellow-500 text-center"
            href="https://thirdweb.com/avalanche/0x5b3Ff4d494E9Ee69eE0f52Ab9656cFfe99D4839E"
            target="_blank"
            rel="noopener noreferrer"
          >
            BUY $BRAPTKN
          </Link>
          <Link
            className="w-56 p-3 rounded-lg transition-all hover:shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black border border-yellow-500 text-center"
            href="https://discord.gg/TYbfbt2R"
            target="_blank"
            rel="noopener noreferrer"
          >
            Swarm Discord
          </Link>
        </div>
      </div>
    </div>
  );
}
