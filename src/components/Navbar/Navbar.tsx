"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";

export function Navbar() {
  return (
    <div className="fixed top-0 z-10 flex items-center justify-center w-full bg-gradient-to-b from-yellow-300 to-orange-400 text-black backdrop-blur-md">
      <nav className="flex items-center justify-between w-full px-8 py-5 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="mr-4">
            <Image
              src="/brap-hq-logo.png"
              width={48}
              height={48}
              alt="Home"
            />
          </Link>
          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/buy"
              className="transition-colors hover:text-white text-black"
            >
              Buy
            </Link>
            <Link
              href="/sell"
              className="transition-colors hover:text-white text-black"
            >
              Sell
            </Link>
            <Link
              href="/stake"
              className="transition-colors hover:text-white text-black"
            >
              Stake
            </Link>
            <Link
              href="/roadmap"
              className="transition-colors hover:text-white text-black"
            >
              Roadmap
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <ConnectButton client={client} theme="dark" />
        </div>
      </nav>
    </div>
  );
}
