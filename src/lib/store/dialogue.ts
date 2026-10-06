import { create } from "zustand";

export type DialogueLine = {
  text: string;
  name?: string;
  portrait?: string[];
  portraitSide?: "left" | "right";
  voice?: { type: OscillatorType; hz: number; ms: number; gain: number };
  textColor?: string;
  asteriskColor?: string;
};

interface DialogueState {
  dialogues: DialogueLine[];
  isOpen: boolean;
  show: (d: DialogueLine[]) => void;
  hide: () => void;
}

export const useDialogue = create<DialogueState>((set) => ({
  dialogues: [],
  isOpen: false,
  show: (dialogues) => set({ dialogues, isOpen: true }),
  hide: () => set({ isOpen: false }),
}));
