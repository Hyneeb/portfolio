// Inline SVG icons only — no emoji anywhere on this site.
export function StationIcon({ kind, size = 22 }: { kind: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "#2B2118", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (kind) {
    case "grad": return (<svg {...common}><path d="M12 4 L22 9 L12 14 L2 9 Z" fill="#F2B749" /><path d="M7 11 v4 c0 1.5 10 1.5 10 0 v-4" /></svg>);
    case "keyboard": return (<svg {...common}><rect x="2" y="7" width="20" height="11" rx="2" fill="#fff" /><path d="M6 11h.5M10 11h.5M14 11h.5M18 11h.5M7 14.5h10" /></svg>);
    case "brush": return (<svg {...common}><path d="M18 3 L21 6 L9 18 L4 19 L5 14 Z" fill="#F28482" /></svg>);
    case "backpack": return (<svg {...common}><rect x="6" y="8" width="12" height="12" rx="3" fill="#BFE3A8" /><path d="M9 8 V6 a3 3 0 0 1 6 0 v2" /><path d="M6 13 h12" /></svg>);
    case "terminal": return (<svg {...common}><rect x="2" y="5" width="20" height="14" rx="2" fill="#2B2118" /><path d="M6 10 l3 2.5 L6 15 M12 15 h5" stroke="#FFE9B8" /></svg>);
    case "coin": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#F2B749" /><path d="M12 7 v10 M15 9.5 c0-1.5-6-1-6 .8 c0 2.5 6 1 6 3 c0 1.8-6 2-6 .5" /></svg>);
    case "dumbbell": return (<svg {...common}><path d="M7 8 v8 M17 8 v8 M7 12 h10" /><rect x="3" y="9" width="3" height="6" rx="1" fill="#E85D4A" /><rect x="18" y="9" width="3" height="6" rx="1" fill="#E85D4A" /></svg>);
    case "mic": return (<svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" fill="#A8D8EA" /><path d="M5 11 a7 7 0 0 0 14 0 M12 18 v3" /></svg>);
    case "ball": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#fff" /><path d="M12 8 l3 2 -1 3 h-4 l-1 -3 Z M12 8 V3 M15 10 l4 -1 M14 13 l3 4 M10 13 l-3 4 M9 10 L5 9" /></svg>);
    case "palette": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#FFF3D6" /><circle cx="9" cy="10" r="1.2" fill="#E85D4A" /><circle cx="14" cy="9" r="1.2" fill="#F2B749" /><circle cx="15" cy="14" r="1.2" fill="#4A9EB8" /></svg>);
    case "radar": return (<svg {...common}><circle cx="12" cy="12" r="9" fill="#EAF6FB" /><circle cx="12" cy="12" r="4" /><path d="M12 12 L19 5" /></svg>);
    case "train": return (<svg {...common}><rect x="5" y="3" width="14" height="13" rx="3" fill="#E85D4A" /><rect x="8" y="6" width="3" height="3" fill="#fff" /><rect x="13" y="6" width="3" height="3" fill="#fff" /><circle cx="9" cy="19" r="1.6" fill="#2B2118" /><circle cx="15" cy="19" r="1.6" fill="#2B2118" /></svg>);
    case "flag": return (<svg {...common}><path d="M6 21 V4" /><path d="M6 5 h11 l-3 4 3 4 H6" fill="#F28482" /></svg>);
    default: return (<svg {...common}><circle cx="12" cy="12" r="9" /></svg>);
  }
}
export function TrainIcon({ size = 28 }: { size?: number }) { return <StationIcon kind="train" size={size} />; }
