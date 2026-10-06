import type { DialogueLine } from "../lib/store/dialogue";

// Original mascot: BIT, a tiny compile-time gremlin. Art is an ASCII map; palette below.
export const bitPortrait = [
  "..K......K..",
  "..KK....KK..",
  "..KYYYYYYK..",
  ".KYYYYYYYYK.",
  ".KYWWYYWWYK.",
  ".KYWKYYKWYK.",
  ".KYYYYYYYYK.",
  ".KYPYYYYPYK.",
  ".KYYKKKKYYK.",
  "..KYYYYYYK..",
  "...KKKKKK...",
  "............",
];
export const portraitPalette: Record<string, string> = { K: "#ffffff", Y: "#4ade80", W: "#ffffff", P: "#f472b6" };

const bit = {
  name: "BIT",
  portrait: bitPortrait,
  portraitSide: "left" as const,
  voice: { type: "square" as OscillatorType, hz: 330, ms: 50, gain: 0.04 },
  asteriskColor: "#4ade80",
};

// {{TODO}} Piyush: tweak the wording to sound like you.
export const bitLines: DialogueLine[] = [
  { ...bit, text: "Howdy! I'm BIT. I live in the terminal, mostly in the gaps between semicolons." },
  { ...bit, text: "Piyush built this whole place by hand. Yes, even the cats." },
  { ...bit, text: "Frontend, backend, and all the bits in between. Mostly the bits." },
  { ...bit, text: "If you like what you see... the contact page is just below. Say hello!" },
];
