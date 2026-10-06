export type Project = {
  slug: string;
  title: string;
  description: string;
  category: string;
  stampColor: string;
  icon: "award" | "compass" | "star";
  patternKey: "dots" | "pinkGrid" | "ruled" | "grid16" | "grid20";
  edgeKey: "sawtooth" | "rough" | "zigzag" | "wavy" | "deep";
  media: { src?: string; alt: string; width: number; height: number; treatment: "spin" | "contain" | "overlap" | "svg" };
  tags: string[];
  url: string;
  cardHeight: number;
};

// {{TODO}} Replace `url` with each project's live link (currently points to your GitHub profile)
// and add real screenshots (media.src). Content is taken from the resume.
export const projects: Project[] = [
  {
    slug: "tutora",
    title: "TutorA",
    description:
      "Tutor discovery & booking platform on Next.js 16 with student, tutor and admin dashboards across 15+ routes. NextAuth + bcrypt + TOTP 2FA, 15+ Zod-validated API routes, Vitest and GitHub Actions CI.",
    category: "building now",
    stampColor: "#c084fc",
    icon: "award",
    patternKey: "dots",
    edgeKey: "sawtooth",
    media: { src: "/images/tutora.svg", alt: "Illustration of a chalkboard, video call tiles, a booking calendar and books", width: 240, height: 120, treatment: "contain" },
    tags: ["Nextjs", "TypeScript", "PostgreSQL", "NextAuth", "Node.js"],
    url: "https://www.tutora.it.com/",
    cardHeight: 520,
  },
  {
    slug: "spendsmart",
    title: "SpendSmart",
    description:
      "Personal finance app with 30+ API routes over a 7-model Postgres schema. JWT, Google OAuth and TOTP 2FA, presigned-URL receipts on AWS S3, automated recurring expenses, and Vitest CI as a merge gate.",
    category: "full-stack app",
    stampColor: "#ff85a2",
    icon: "award",
    patternKey: "pinkGrid",
    edgeKey: "rough",
    media: { src: "/images/spendsmart.svg", alt: "Illustration of a bar chart, receipt, recurring arrows, wallet and coins", width: 240, height: 120, treatment: "contain" },
    tags: ["Nextjs", "Prisma", "AWS S3", "JWT", "Google OAuth", "TypeScript"],
    url: "https://spend-smart-hazel.vercel.app/",
    cardHeight: 500,
  },
  {
    slug: "bigtree",
    title: "The Big Tree Cafe",
    description:
      "Website for an outdoor cafe on Golf Course Road, Gurgaon. Table reservations with seating choice (garden, private cabana, indoor), a menu with bestsellers, live-music event listings, a photo gallery and WhatsApp enquiries.",
    category: "client website",
    stampColor: "#4ade80",
    icon: "star",
    patternKey: "grid16",
    edgeKey: "zigzag",
    media: { src: "/images/bigtree.svg", alt: "Illustration of a big tree with fairy lights, a pink cabana and a candlelit table", width: 240, height: 120, treatment: "contain" },
    tags: ["Nextjs", "TypeScript", "Vercel"],
    url: "https://bigtree-three.vercel.app/",
    cardHeight: 500,
  },
  {
    slug: "lumadental",
    title: "Luma Dental",
    description:
      "Conversion-focused website for a modern dental clinic. A 3-step online booking flow (service, time, details), service and pricing sections, a whitening before/after slider, patient reviews, FAQs and an oral-health blog, with smooth scroll animations and a fully responsive layout.",
    category: "client website",
    stampColor: "#60a5fa",
    icon: "star",
    patternKey: "grid20",
    edgeKey: "wavy",
    media: { src: "/images/lumadental.svg", alt: "Illustration of a browser window with a tooth, sparkles and a booking calendar", width: 240, height: 120, treatment: "contain" },
    tags: ["Nextjs", "TypeScript", "Responsive", "Vercel"],
    url: "https://dental-clinic-five-neon.vercel.app/",
    cardHeight: 520,
  },
];
