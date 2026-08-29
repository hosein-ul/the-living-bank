export interface ChapterGloss {
  label: string;
  gloss: string;
}

export interface ChapterData {
  id: string;
  numeral: string;
  title: string;
  eyebrow?: string;
  copy: string;
  takeaway: string;
}

export const CHAPTERS_CONTENT = {
  s0: {
    eyebrow: "AN INTERACTIVE EXPLANATION",
    title: "THE LIVING BANK",
    sub: "The Standard Reserve is a 4,000-line onchain central bank. You're about to run its economy for two hundred epochs — and understand every rule it lives by.",
    cta: "SCROLL TO ENTER THE ECONOMY ↓",
  },
  s1: {
    id: "chapter-1",
    numeral: "I",
    title: "ONE DOOR",
    copy: "This economy is an island. Money enters through one door and leaves through the same one. Everything you're about to see happens around that door.",
    takeaway: "One market. One signal. One authority.",
    glosses: [
      {
        label: "THE POOL",
        gloss: "The only market. ETH trades against $STANDARD here, and nothing else.",
      },
      {
        label: "THE CENTRAL BANK",
        gloss: "4,000 lines of immutable code. It sets the rate, routes the fees, defends the currency.",
      },
      {
        label: "$STANDARD",
        gloss: "The currency. Minted only at withdrawals. Burned constantly.",
      },
      {
        label: "CHARTERS",
        gloss: "Banking licenses. One thousand were free at genesis.",
      },
      {
        label: "BRANCHES",
        gloss: "Yield positions inside a charter. Up to ten each.",
      },
      {
        label: "THE VAULTS",
        gloss: "Where every fee lands. Savings in good times, weapons in bad.",
      },
    ],
  },
  s2: {
    id: "chapter-2",
    numeral: "II",
    title: "THE ONLY NUMBER",
    copy: "Drag the lever. Coins walking in are buys; coins walking out are sells. The bank reads only the difference — real capital in, minus real capital out. Not price. Not volume. Not sentiment.",
    takeaway: "The bank watches one number: net ETH flow.",
  },
  s3: {
    id: "chapter-3",
    numeral: "III",
    title: "THE CHARTER",
    deed: "CHARTER №0042",
    cta: "TAKE YOUR CHARTER — FREE",
    subcaption: "like the 1,000 Founding Charters at genesis",
    copy: "Take your charter. It's free — as the first thousand were. It is a soulbound deed: your right to run a bank, never tradeable at launch.",
    takeaway: "A charter is a banking license, not an asset.",
  },
  s4: {
    id: "chapter-4",
    numeral: "IV",
    title: "GROWTH BURNS",
    button: "BUY LICENSE → +1 BRANCH",
    subtext: "Yesterday's close sets today's open: the open is always 2× the last sale. Demand spikes double the open until price catches it.",
    copy: "Growing your bank means buying licenses — paid in $STANDARD, burned on receipt. Growth itself is the largest supply sink.",
    takeaway: "The most rational move in the game — growth — is also its biggest supply sink.",
  },
  s5: {
    id: "chapter-5",
    numeral: "V",
    title: "THE TEMPER",
    copy: "Push money in: the dial climbs in small, earned steps. Pull money out: it slams down in one. Rate cuts are instant. Raises must be earned, epoch after epoch.",
    takeaway: "The bank turns defensive instantly. Generosity has to be earned.",
  },
  s6: {
    id: "chapter-6",
    numeral: "VI",
    title: "WHERE FEES GO",
    copy: "Every trade pays the bank in ETH. Seventy percent routes to the active vault — gold in expansion, buyback-and-burn in contraction. Fifteen compounds into liquidity that can never be pulled. Fifteen runs the team.",
    takeaway: "Volatility itself becomes balance sheet — whichever way price moves.",
    captions: {
      buyback: "small steps only — never one blockable shot",
      pol: "can never be pulled",
    },
  },
  s7: {
    id: "chapter-7",
    numeral: "VII",
    title: "THE RUN, INVERTED",
    buttonRun: "BANK RUN",
    buttonWithdraw: "WITHDRAW ALL — pay the toll",
    buttonStay: "STAY — collect",
    copy: "Press it, and the lobby runs for the door. The toll climbs with the crowd — half of it burns, half lands in the mugs of everyone who stayed. You choose: run and pay, or stay and collect.",
    takeaway: "The impatient fund the patient.",
  },
  s8: {
    id: "chapter-8",
    numeral: "VIII",
    title: "GHOSTS",
    poster: "DORMANT 30 DAYS — BOUNTY 2%",
    button: "REPORT THE GHOST",
    copy: "A banker dark for thirty days siphons yield from the living. Report him and the bounty is yours. His charter burns; seventy percent of his balance is forfeit. Sleeping is never the cheap way out.",
    takeaway: "Ghosts don't dilute the living.",
  },
  s9: {
    id: "chapter-9",
    numeral: "IX",
    title: "THE LEDGER",
    labels: {
      circulating: "IN PEOPLE'S HANDS",
      burned: "BURNED FOREVER",
      hardCap: "HARD CAP 1,000,000,000 → NEVER RISES",
    },
    copy: "Everything you did, reduced to one line: what people hold, and what is gone forever.",
    takeaway: "Supply has one direction: down.",
  },
  s10: {
    id: "chapter-10",
    numeral: "X",
    title: "EPILOGUE",
    receiptTitle: "THE LIVING BANK — SESSION RECEIPT",
    button: "EXPORT SHARE CARD",
    sealText: "EXPERIENCED",
    copy: "You just ran a sovereign central bank — no board, no committee, no government. The real one is 4,000 lines of immutable code.",
    links: [
      { label: "THE STANDARD RESERVE ↗", url: "https://www.standardreserve.xyz" },
      { label: "WHITEPAPER ↗", url: "https://www.standardreserve.xyz/whitepaper/" },
      { label: "TWITTER ↗", url: "https://x.com/standard_rsv" },
    ],
    disclaimer: "A fan-made interactive explanation. Not affiliated. Nothing here is financial advice.",
  },
} as const;

export const RAIL_CHAPTERS = [
  { id: "cover", numeral: "0", label: "Cover" },
  { id: "chapter-1", numeral: "I", label: "One Door" },
  { id: "chapter-2", numeral: "II", label: "The Only Number" },
  { id: "chapter-3", numeral: "III", label: "The Charter" },
  { id: "chapter-4", numeral: "IV", label: "Growth Burns" },
  { id: "chapter-5", numeral: "V", label: "The Temper" },
  { id: "chapter-6", numeral: "VI", label: "Where Fees Go" },
  { id: "chapter-7", numeral: "VII", label: "The Run, Inverted" },
  { id: "chapter-8", numeral: "VIII", label: "Ghosts" },
  { id: "chapter-9", numeral: "IX", label: "The Ledger" },
  { id: "chapter-10", numeral: "X", label: "Epilogue" },
] as const;
