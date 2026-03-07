'use client';

import { useState } from 'react';

const SOURCES = [
  { label: 'All',      query: 'all' },
  { label: 'Bounties', query: 'bounty' },
  { label: 'Grants',   query: 'grant' },
  { label: 'Contract', query: 'contract' },
  { label: 'Remote',   query: 'remote' },
  { label: 'Web3',     query: 'web3' },
];

const BOUNTY_SOURCES = [
  { name: 'Gitcoin Bounties',       url: 'https://gitcoin.co/explorer',                                                              desc: 'Ethereum-funded open source bounties. Get paid in crypto for shipping code.',               tags: ['ethereum', 'web3', 'open-source'], icon: '⟠' },
  { name: 'Immunefi',               url: 'https://immunefi.com/explore/',                                                            desc: 'Web3 bug bounty platform. Earn rewards for finding vulnerabilities in DeFi protocols.',    tags: ['security', 'defi', 'bug-bounty'],  icon: '🛡' },
  { name: 'Layer3',                 url: 'https://layer3.xyz/bounties',                                                              desc: 'Web3 quests and bounties. Contribute to protocols and earn on-chain.',                      tags: ['web3', 'quests', 'on-chain'],      icon: '◈' },
  { name: 'Dework',                 url: 'https://app.dework.xyz/bounties',                                                          desc: 'DAO bounties and Web3 gigs. Contribute to DAOs and get paid in tokens.',                   tags: ['dao', 'web3', 'remote'],           icon: '◎' },
  { name: 'Code4rena',              url: 'https://code4rena.com/contests',                                                           desc: 'Smart contract auditing competitions. Compete to find bugs and split rewards.',             tags: ['solidity', 'audit', 'security'],   icon: '⚔' },
  { name: 'Hats Finance',           url: 'https://app.hats.finance/bug-bounties',                                                    desc: 'Decentralized bug bounty protocol. Permissionless security contests on-chain.',             tags: ['security', 'defi', 'bug-bounty'], icon: '🎩' },
  { name: 'Superteam Earn',         url: 'https://earn.superteam.fun/',                                                              desc: 'Solana ecosystem bounties, grants and jobs. For builders and creatives.',                   tags: ['solana', 'web3', 'grants'],        icon: '◉' },
  { name: 'Octane',                 url: 'https://octane.sh/',                                                                       desc: 'Open source bounties backed by VC-funded startups. Earn for PRs.',                         tags: ['open-source', 'startups', 'crypto'], icon: '⚡' },
  { name: 'GitHub Issues (OSS)',    url: 'https://github.com/issues?q=is%3Aopen+label%3A%22good+first+issue%22+label%3A%22bounty%22', desc: 'Open source issues tagged with bounty rewards across GitHub.',                            tags: ['open-source', 'github', 'any-stack'], icon: '◻' },
  { name: 'Polygon Grants',         url: 'https://polygon.technology/grants',                                                        desc: 'Polygon ecosystem grants for builders. Apply for funding to ship on Polygon.',              tags: ['polygon', 'grants', 'web3'],       icon: '⬡' },
  { name: 'Optimism RetroPGF',      url: 'https://app.optimism.io/retropgf',                                                        desc: 'Retroactive public goods funding. Get rewarded for past contributions.',                    tags: ['optimism', 'grants', 'public-goods'], icon: '🔴' },
  { name: 'Base Ecosystem Fund',    url: 'https://paragraph.xyz/@grants.base.eth/calling-based-builders',                           desc: 'Base L2 builder grants. Backed by Coinbase, for teams building on Base.',                  tags: ['base', 'l2', 'grants'],            icon: '🔵' },
  { name: 'Solana Foundation Grants', url: 'https://solana.org/grants',                                                             desc: 'Grants for developers building on Solana. Open applications.',                             tags: ['solana', 'grants', 'web3'],        icon: '◑' },
  { name: 'ETH Global',             url: 'https://ethglobal.com/events',                                                            desc: 'Hackathons with prize pools. Build in 48hrs and win Ethereum.',                            tags: ['hackathon', 'ethereum', 'web3'],   icon: '◇' },
  { name: 'Bountycaster',           url: 'https://www.bountycaster.xyz/',                                                           desc: 'Farcaster-native bounties. Post and claim bounties on the decentralized social web.',       tags: ['farcaster', 'web3', 'social'],     icon: '🟣' },
];

const TYPE_FILTERS: Record<string, string[]> = {
  all:      BOUNTY_SOURCES.map(s => s.name),
  bounty:   ['Gitcoin Bounties', 'Octane', 'GitHub Issues (OSS)', 'Bountycaster', 'Layer3'],
  grant:    ['Polygon Grants', 'Optimism RetroPGF', 'Base Ecosystem Fund', 'Solana Foundation Grants', 'Superteam Earn'],
  contract: ['Dework', 'Superteam Earn', 'Layer3'],
  remote:   ['Gitcoin Bounties', 'Dework', 'GitHub Issues (OSS)', 'Superteam Earn', 'Octane', 'Bountycaster'],
  web3:     ['Gitcoin Bounties', 'Immunefi', 'Layer3', 'Dework', 'Code4rena', 'Hats Finance', 'Superteam Earn', 'ETH Global', 'Bountycaster'],
};

export default function JobsPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  const activeFilter = TYPE_FILTERS[SOURCES[activeCategory].query];
  const filtered = BOUNTY_SOURCES.filter(s => activeFilter.includes(s.name));

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .jobs-page { min-height: 100vh; padding: 72px 24px 140px; max-width: 900px; margin: 0 auto; }
        .jobs-header { margin-bottom: 40px; }
        .jobs-eyebrow { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.5em; color: #333; text-transform: uppercase; margin-bottom: 12px; }
        .jobs-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 7vw, 80px); line-height: 0.9; color: #fff; margin-bottom: 8px; }
        .jobs-title em { color: #e8ff47; font-style: normal; }
        .jobs-subtitle { font-size: 13px; color: #333; font-weight: 300; line-height: 1.7; max-width: 480px; margin-bottom: 28px; }
        .category-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .category-pill { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; border: 1px solid #1a1a1a; color: #444; cursor: pointer; transition: all 0.2s; background: transparent; }
        .category-pill:hover { color: #888; border-color: #333; }
        .category-pill.active { background: #e8ff47; color: #080808; border-color: #e8ff47; }
        .sources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-top: 32px; }
        .source-card { background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; transition: border-color 0.2s, transform 0.15s; }
        .source-card:hover { border-color: #2a2a2a; transform: translateY(-2px); }
        .source-header { display: flex; align-items: center; gap: 12px; }
        .source-icon { width: 36px; height: 36px; border-radius: 8px; background: #111; border: 1px solid #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .source-name { font-size: 13px; font-weight: 500; color: #fff; line-height: 1.3; }
        .source-desc { font-size: 12px; color: #444; line-height: 1.6; font-weight: 300; flex: 1; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: auto; }
        .source-tag { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.1em; color: #333; background: #111; border: 1px solid #1a1a1a; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
        .source-arrow { font-family: 'DM Mono', monospace; font-size: 9px; color: #2a2a2a; letter-spacing: 0.1em; margin-top: 4px; transition: color 0.2s; }
        .source-card:hover .source-arrow { color: #e8ff47; }
        .section-divider { margin: 48px 0 32px; display: flex; align-items: center; gap: 16px; }
        .section-divider-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.4em; color: #222; text-transform: uppercase; white-space: nowrap; }
        .section-divider-line { flex: 1; height: 1px; background: #111; }
        .ethos-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #111; border: 1px solid #111; border-radius: 12px; overflow: hidden; margin-bottom: 40px; }
        .ethos-item { background: #0a0a0a; padding: 20px; display: flex; flex-direction: column; gap: 6px; }
        .ethos-icon { font-size: 20px; margin-bottom: 4px; }
        .ethos-label { font-size: 12px; font-weight: 500; color: #fff; }
        .ethos-desc { font-size: 11px; color: #333; line-height: 1.6; font-weight: 300; }
        @media (max-width: 600px) { .jobs-page { padding: 64px 16px 140px; } .sources-grid { grid-template-columns: 1fr; } .ethos-strip { grid-template-columns: 1fr; } }
      `}</style>

      <div className="jobs-page">
        <div className="jobs-header">
          <p className="jobs-eyebrow">Open Source · Web3 · Remote</p>
          <h1 className="jobs-title">Bounties &<br /><em>Opportunities.</em></h1>
          <p className="jobs-subtitle">Ship code, find bugs, build protocols. Get paid in crypto. No resumes. No gatekeepers. Just work.</p>
          <div className="category-pills">
            {SOURCES.map((src, i) => (
              <button key={src.label} className={`category-pill${activeCategory === i ? ' active' : ''}`} onClick={() => setActiveCategory(i)}>{src.label}</button>
            ))}
          </div>
        </div>

        <div className="ethos-strip">
          <div className="ethos-item"><div className="ethos-icon">⛓</div><div className="ethos-label">On-chain payments</div><div className="ethos-desc">Get paid in ETH, USDC, SOL or protocol tokens — no wire transfers.</div></div>
          <div className="ethos-item"><div className="ethos-icon">🔓</div><div className="ethos-label">Permissionless</div><div className="ethos-desc">No recruiter. No middleman. Claim a bounty and ship.</div></div>
          <div className="ethos-item"><div className="ethos-icon">🌍</div><div className="ethos-label">Work anywhere</div><div className="ethos-desc">Remote-first by default. Build from wherever you're based.</div></div>
        </div>

        <div className="section-divider">
          <span className="section-divider-label">Platforms</span>
          <div className="section-divider-line" />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#222', letterSpacing: '0.2em' }}>{filtered.length} sources</span>
        </div>

        <div className="sources-grid">
          {filtered.map(source => (
            <a key={source.name} className="source-card" href={source.url} target="_blank" rel="noopener noreferrer">
              <div className="source-header">
                <div className="source-icon">{source.icon}</div>
                <span className="source-name">{source.name}</span>
              </div>
              <p className="source-desc">{source.desc}</p>
              <div className="source-tags">{source.tags.map(tag => <span key={tag} className="source-tag">{tag}</span>)}</div>
              <div className="source-arrow">Explore →</div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
