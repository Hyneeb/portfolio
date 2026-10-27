export type StationType = "experience" | "project" | "education" | "about";
export type LineId = "systems" | "intelligence" | "product" | "journey";

export interface Station {
  id: string;
  name: string;
  shortName?: string;
  lineIds: LineId[];
  type: StationType;
  org?: string;
  role?: string;
  dates: string;
  oneLiner: string;
  bullets: string[];
  metrics?: { label: string; value: string }[];
  tech: string[];
  demoType?: "shell" | "painting" | "typing" | "paint" | "none";
  icon: string;
  x: number;
  y: number;
  isInterchange?: boolean;
}

export const LINES: Record<LineId, { name: string; color: string }> = {
  systems: { name: "Systems Line", color: "#E85D4A" },
  intelligence: { name: "Intelligence Line", color: "#F2B749" },
  product: { name: "Product Line", color: "#4A9EB8" },
  journey: { name: "Journey Loop", color: "#7FB069" },
};

// Coordinates in a 1200 x 700 SVG viewBox. Diagrammatic, not to scale.
export const STATIONS: Station[] = [
  {
    id: "uoft", name: "UofT Station", lineIds: ["systems", "journey"], type: "education",
    org: "University of Toronto", role: "HBSc, Computer Science Specialist", dates: "Sept 2023 – Present",
    oneLiner: "Where I learned how computers actually work. It is where I fell in love with systems.",
    bullets: [
      "Honours Bachelor of Science (HBSc), Computer Science Specialist, graduating April 2028.",
      "Relevant coursework: Operating Systems, Computer Networks, Algorithm Design & Analysis, Cybersecurity.",
    ],
    tech: ["Operating Systems", "Computer Networks", "Algorithm Design", "Cybersecurity"],
    icon: "grad", x: 120, y: 360, isInterchange: true,
  },
  {
    id: "typetyme", name: "TypeTyme", lineIds: ["intelligence"], type: "project",
    org: "Personal Project", role: "Typing game", dates: "2023",
    oneLiner: "A typing game where Gemini AI writes a fresh prompt every round, so it never gets boring.",
    bullets: [
      "Developed a web-based typing game using HTML, CSS, and Flask to create an interactive experience.",
      "Leveraged Google's Gemini AI to generate diverse prompts, enhancing the game-play experience, by ensuring the game remains fresh and exciting.",
      "Utilized SQL, and Python to increase user retention by 20% by adding new features to login and track scores.",
    ],
    metrics: [{ label: "User retention", value: "+20%" }],
    tech: ["Flask", "Gemini AI", "HTML/CSS", "SQL", "Python"],
    demoType: "typing", icon: "keyboard", x: 600, y: 120,
  },
  {
    id: "paintapp", name: "Java PaintApp", lineIds: ["intelligence"], type: "project",
    org: "Personal Project", role: "Drawing application", dates: "Dec 2024",
    oneLiner: "A drawing app with 10+ tools and a local AI that helps you sketch.",
    bullets: [
      "Developed a drawing application supporting 10+ tools, layering, undo/redo, and low-latency rendering.",
      "Integrated a locally hosted LLaMA model to automate sketch generation.",
    ],
    metrics: [{ label: "Drawing tools", value: "10+" }],
    tech: ["Java", "JavaFX", "Agile", "LLaMA (local)"],
    demoType: "paint", icon: "brush", x: 600, y: 230,
  },
  {
    id: "campusclaims", name: "CampusClaims", lineIds: ["product"], type: "project",
    org: "Personal Project", role: "Campus lost & found", dates: "May 2025",
    oneLiner: "Lost something on campus? 300+ students used this to get it back. It works 72% of the time.",
    bullets: [
      "Full-stack system: Built a campus lost & found platform adopted by 300+ students with a 72% recovery rate.",
      "Designed a matching and recommendation system surfacing relevant reports.",
      "Implemented secure real-time messaging using Supabase Realtime.",
    ],
    metrics: [
      { label: "Students", value: "300+" },
      { label: "Recovery rate", value: "72%" },
    ],
    tech: ["Next.js", "React", "Supabase", "PostgreSQL"],
    icon: "backpack", x: 220, y: 200,
  },
  {
    id: "unix-shell", name: "Custom Unix Shell", lineIds: ["systems"], type: "project",
    org: "Personal Project", role: "Unix-like shell", dates: "Dec 2025",
    oneLiner: "A Unix-like shell built from scratch in C, with job control, signals, and a chat room inside it.",
    bullets: [
      "Implemented a Unix-like shell from scratch with job control, background execution, signal handling, and process management.",
      "Added TCP-based multi-client chat commands with message routing and user IDs.",
    ],
    tech: ["C", "Unix", "Sockets"],
    demoType: "shell", icon: "terminal", x: 360, y: 360,
  },
  {
    id: "investi", name: "Investi", lineIds: ["product"], type: "experience",
    org: "Investi", role: "Full Stack Engineering Intern", dates: "Sept 2025 – Dec 2025",
    oneLiner: "A Flutter finance app that teaches. It is used by 500+ people.",
    bullets: [
      "Led end-to-end development of a Flutter financial education app used by 500+ active users, shipping core learning modules and onboarding flows.",
      "Optimized Firestore queries and offline caching, reducing module load times by 40%.",
      "Resolved UI performance bottlenecks via Dart DevTools, maintaining 60 FPS across low-end devices.",
    ],
    metrics: [
      { label: "Active users", value: "500+" },
      { label: "Load time", value: "-40%" },
      { label: "Frame rate", value: "60 FPS" },
    ],
    tech: ["Flutter", "Dart", "Firestore"],
    icon: "coin", x: 420, y: 275,
  },
  {
    id: "bellwoods", name: "Bellwoods Capital", lineIds: ["product"], type: "experience",
    org: "Bellwoods Capital", role: "Software Engineering Intern", dates: "Sept 2025 – Dec 2025",
    oneLiner: "A habit app with an AI coach, built to make workouts stick.",
    bullets: [
      "Designed a habit-formation system in React Native and Django, increasing workout consistency by 40%.",
      "Increased average session time by 25% by integrating an AI-powered virtual coach that delivers tailored exercise plans.",
      "Built a scalable moderation pipeline that cut admin review time by 50% while enabling 2× content throughput.",
    ],
    metrics: [
      { label: "Workout consistency", value: "+40%" },
      { label: "Session time", value: "+25%" },
      { label: "Admin review time", value: "-50%" },
    ],
    tech: ["React Native", "Django"],
    icon: "dumbbell", x: 800, y: 450,
  },
  {
    id: "live-ai", name: "Live AI", lineIds: ["intelligence"], type: "experience",
    org: "Live AI", role: "Software Engineering Intern", dates: "Jan 2026 – Apr 2026",
    oneLiner: "On-device voice AI that works offline. Fast, private, and light on battery.",
    bullets: [
      "Led the development of an on-device speech recognition SDK with voice activity detection and speaker identification, achieving 98% accuracy in voice detection and enabling robust offline speech processing for Live AI Android clients.",
      "Built an Android wake-word detection library, achieving sub-128ms prediction latency on flagship devices.",
      "Redesigned the audio processing pipeline for an on-device voice assistant, reducing battery usage by 25% and enabling near-zero CPU utilization in idle mode through optimized processing and wake-state management.",
    ],
    metrics: [
      { label: "Voice detection", value: "98%" },
      { label: "Wake-word latency", value: "<128ms" },
      { label: "Battery usage", value: "-25%" },
    ],
    tech: ["Kotlin", "Android"],
    icon: "mic", x: 600, y: 490,
  },
  {
    id: "sportsdeck", name: "SportsDeck", shortName: "SportsDeck", lineIds: ["product"], type: "project",
    org: "Personal Project", role: "Sports fan platform", dates: "Mar 2026",
    oneLiner: "Live scores, forums, and fast loads for football fans, even on free-tier limits.",
    bullets: [
      "Built a full-stack sports fan platform with real-time match data and forums, deployed on AWS via Docker.",
      "Implemented JWT auth with Google OAuth, role-based moderation, and AI sentiment analysis, reducing manual content review by 80%.",
      "Designed an API caching layer maintaining sub-second loads across 20+ endpoints within free-tier rate limits.",
    ],
    metrics: [
      { label: "Manual review", value: "-80%" },
      { label: "Loads", value: "Sub-second" },
      { label: "Endpoints", value: "20+" },
    ],
    tech: ["Next.js", "React", "Prisma", "PostgreSQL", "Docker", "AWS"],
    icon: "ball", x: 980, y: 540,
  },
  {
    id: "painting-classifier", name: "ML Painting Classifier", lineIds: ["intelligence"], type: "project",
    org: "Personal Project", role: "Machine learning", dates: "Apr 2026",
    oneLiner: "A model that learns what paintings you like. It gets it right 87.6% of the time.",
    bullets: [
      "Built a multiclass classifier predicting user painting preference, reaching 87.6% accuracy on held-out data.",
      "Engineered features from mixed survey inputs, combining text vectorization and categorical encoding to feed the model.",
      "Evaluated multiple modeling approaches and selected the best-performing one through iterative tuning.",
    ],
    metrics: [{ label: "Accuracy", value: "87.6%" }],
    tech: ["Python", "NumPy", "scikit-learn"],
    demoType: "painting", icon: "palette", x: 600, y: 610,
  },
  {
    id: "radar", name: "National Radar Program", lineIds: ["systems"], type: "experience",
    org: "Federal Government of Canada", role: "Software Engineering Intern", dates: "May 2026 – Present",
    oneLiner: "Internal tooling that keeps Canada's radar network healthy by catching issues before things break.",
    bullets: [
      "Designed and developed internal tooling to digitize maintenance tracking for Canada's radar network, implementing structured PostgreSQL-backed data storage and real-time audit trails, mitigating issues before outages occurred and reducing SEV1/SEV2 incidents by 45%.",
      "Built a service monitoring dashboard and AI remediation bots that auto-resolve common issues from runbooks, cutting on-call workload by 20%.",
    ],
    metrics: [
      { label: "SEV1/SEV2 incidents", value: "-45%" },
      { label: "On-call workload", value: "-20%" },
    ],
    tech: ["PostgreSQL", "Python"],
    icon: "radar", x: 860, y: 360,
  },
  {
    id: "muneeb-central", name: "Muneeb Central", lineIds: ["systems", "intelligence", "product"], type: "about",
    org: "Muneeb Hyder", role: "Software Engineering Intern", dates: "Open for Summer 2027",
    oneLiner: "Hi, I'm Muneeb. UofT CS '28, building systems, AI, and products people actually use.",
    bullets: [
      "University of Toronto, HBSc Computer Science Specialist, Sept 2023 – Present, graduating April 2028.",
      "I like the part where an idea becomes something shipped. A shell, a classifier, an app 300+ students actually use.",
      "Open for Summer 2027 internships, May–Aug 2027.",
    ],
    tech: ["Python", "C", "React", "TypeScript"],
    icon: "train", x: 600, y: 360, isInterchange: true,
  },
  {
    id: "hire-me", name: "Hire Me Terminus", shortName: "Hire Me", lineIds: ["journey"], type: "about",
    org: "Next stop: Summer 2027", role: "Software Engineering Intern", dates: "May–Aug 2027",
    oneLiner: "Next stop: your team, Summer 2027. I'm looking for a Software Engineering internship.",
    bullets: [
      "Email: muneeb.hyder@mail.utoronto.ca",
      "GitHub: github.com/hyneeb",
      "Phone: (647) 762-9037",
    ],
    tech: ["Available May–Aug 2027"],
    icon: "flag", x: 1080, y: 640,
  },
];

export const TOUR_ORDER = [
  "uoft", "typetyme", "paintapp", "campusclaims", "unix-shell", "muneeb-central", "investi",
  "bellwoods", "live-ai", "sportsdeck", "painting-classifier", "radar", "hire-me",
];

export const SKILLS = {
  languages: ["Python", "C", "C++", "Java", "Kotlin", "TypeScript", "SQL", "Bash", "Dart"],
  technologies: ["React", "Next.js", "Flask", "PostgreSQL", "Prisma", "Flutter", "Docker"],
  infrastructure: ["Linux", "Git", "CI/CD", "AWS", "Networking", "Distributed Systems"],
  alsoInProjects: [
    { name: "JavaFX", note: "PaintApp" },
    { name: "Supabase", note: "CampusClaims" },
    { name: "JWT / Google OAuth", note: "SportsDeck" },
    { name: "Gemini AI", note: "TypeTyme" },
    { name: "LLaMA (local)", note: "PaintApp" },
  ],
};
