import React from "react";

const roadmapData = [
  {
    phase: "Phase 1 — Core Foundation 🐝",
    description:
      "Build the essential infrastructure for the $BRAPTKN ecosystem, including deploying the $BRAPTKN token, launching initial NFT collections, deploying staking contracts, and setting up core supporting contracts.",
  },
  {
    phase: "Phase 2 — App & Metadata Setup 🛠️",
    description:
      "Develop the $BRAPTKN HQ dApp with NFT and token metadata integration, enabling seamless user interaction with all deployed contracts. Complete thorough testing of all key user workflows.",
  },
  {
    phase: "Phase 3 — Launch & Marketing 🚀",
    description:
      "Officially launch the $BRAPTKN HQ dApp and market the first NFT collection and $BRAPTKN token. Focus on community building and collect feedback to refine the platform.",
  },
  {
    phase: "Phase 4 — Music NFT Release 🎵",
    description:
      "Expand the ecosystem with the release of the $BRAPTKN Music NFBz audio NFT collection, integrating music NFTs into staking and reward programs, and attract new audiences through unique content.",
  },
  {
    phase: "Phase 5 — Community & Token Growth 💨",
    description:
      "Implement strategies to grow community engagement and strengthen $BRAPTKN token value. Add a dedicated ‘Buy $BRAPTKN Token’ page within the marketplace for seamless token acquisition. Support liquidity growth and cross-community partnerships.",
  },
  {
    phase: "Phase 6 — Badge System & Rewards 🏅",
    description:
      "Launch an exclusive badge system that rewards active community members with access to raffles, airdrops, gated content, and offline events. Fully integrate badges into the $BRAPTKN HQ dApp for intuitive management.",
  },
];

const Roadmap = () => {
  return (
    <div className="bg-white text-black w-full py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-center text-4xl font-bold text-orange-500 mb-10">
          BRAP Ecosystem Roadmap
        </h2>

        {roadmapData.map((item, index) => (
          <div
            key={index}
            className="mb-8 pl-4 border-l-4 border-orange-500"
          >
            <h3 className="text-xl font-semibold mb-2">{item.phase}</h3>
            <p className="text-base leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
