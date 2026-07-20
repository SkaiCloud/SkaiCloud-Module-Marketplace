"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Category = "All" | "Operations" | "Automation" | "Security" | "Finance";

type MarketplaceModule = {
  key: string;
  name: string;
  summary: string;
  publisher: string;
  version: string;
  category: Exclude<Category, "All">;
  icon: string;
  accent: string;
  verified: boolean;
  featured?: boolean;
  status: "Available" | "Enabled" | "Review pending";
};

const categories: Category[] = ["All", "Operations", "Automation", "Security", "Finance"];

const modules: MarketplaceModule[] = [
  {
    key: "network_operations",
    name: "Network Operations",
    summary: "Circuit inventory, ISP coordination, site readiness, and field workflow control.",
    publisher: "SkaiCloud Network LLC",
    version: "1.4.0",
    category: "Operations",
    icon: "NO",
    accent: "#7c5cff",
    verified: true,
    featured: true,
    status: "Enabled",
  },
  {
    key: "workflow_automation",
    name: "Workflow Automation",
    summary: "Build controlled triggers, approvals, notifications, and operational handoffs.",
    publisher: "SkaiCloud Network LLC",
    version: "1.1.2",
    category: "Automation",
    icon: "WA",
    accent: "#18b6a4",
    verified: true,
    featured: true,
    status: "Available",
  },
  {
    key: "security_center",
    name: "Security Center",
    summary: "Consolidated posture, access review, audit evidence, and policy monitoring.",
    publisher: "SkaiCloud Network LLC",
    version: "0.9.4",
    category: "Security",
    icon: "SC",
    accent: "#2f8cff",
    verified: true,
    status: "Review pending",
  },
  {
    key: "billing_operations",
    name: "Billing Operations",
    summary: "Track recurring services, project charges, margins, and client billing readiness.",
    publisher: "SkaiCloud Network LLC",
    version: "1.0.0",
    category: "Finance",
    icon: "BO",
    accent: "#f0a43c",
    verified: true,
    status: "Available",
  },
  {
    key: "field_dispatch",
    name: "Field Dispatch",
    summary: "Coordinate surveys, technician assignments, site access, and completion evidence.",
    publisher: "SkaiCloud Labs",
    version: "0.8.1",
    category: "Operations",
    icon: "FD",
    accent: "#e4607c",
    verified: false,
    status: "Available",
  },
  {
    key: "document_intake",
    name: "Document Intake",
    summary: "Classify inbound documents and route structured records into review queues.",
    publisher: "SkaiCloud Labs",
    version: "0.6.3",
    category: "Automation",
    icon: "DI",
    accent: "#a66ee8",
    verified: false,
    status: "Available",
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.5 12.5 3 3 6-7" />
    </svg>
  );
}

export default function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const visibleModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return modules.filter((module) => {
      const matchesCategory = category === "All" || module.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [module.name, module.summary, module.publisher, module.category].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const enabledCount = modules.filter((module) => module.status === "Enabled").length;
  const pendingCount = modules.filter((module) => module.status === "Review pending").length;

  return (
    <main className="marketplace-shell">
      <style>{`
        .marketplace-shell {
          --bg: #090b10;
          --panel: #11141b;
          --panel-strong: #151923;
          --line: #252a36;
          --muted: #8b92a3;
          --text: #f6f7fb;
          --brand: #7c5cff;
          min-height: 100vh;
          padding: 42px clamp(24px, 5vw, 72px) 64px;
          color: var(--text);
          background:
            radial-gradient(circle at 70% -15%, rgba(124, 92, 255, .14), transparent 32%),
            var(--bg);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .marketplace-shell * { box-sizing: border-box; }
        .marketplace-header { display: flex; justify-content: space-between; gap: 24px; align-items: end; margin-bottom: 34px; }
        .marketplace-eyebrow { margin: 0 0 9px; color: #a999ff; font-size: 11px; font-weight: 750; letter-spacing: .15em; text-transform: uppercase; }
        .marketplace-title { margin: 0; font-size: clamp(30px, 4vw, 46px); line-height: 1; letter-spacing: -.045em; }
        .marketplace-subtitle { max-width: 600px; margin: 13px 0 0; color: var(--muted); line-height: 1.6; }
        .marketplace-summary { display: flex; align-items: center; gap: 20px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 12px; background: rgba(17, 20, 27, .72); }
        .marketplace-stat { min-width: 64px; }
        .marketplace-stat + .marketplace-stat { padding-left: 20px; border-left: 1px solid var(--line); }
        .marketplace-stat strong { display: block; font-size: 19px; }
        .marketplace-stat span { color: var(--muted); font-size: 11px; }
        .marketplace-controls { display: flex; gap: 12px; margin-bottom: 28px; }
        .marketplace-search { position: relative; flex: 1; }
        .marketplace-search svg { position: absolute; top: 50%; left: 16px; width: 18px; fill: none; stroke: #737b8d; stroke-width: 1.7; transform: translateY(-50%); }
        .marketplace-search input { width: 100%; height: 48px; padding: 0 18px 0 45px; border: 1px solid var(--line); border-radius: 12px; outline: none; color: var(--text); background: var(--panel); font: inherit; }
        .marketplace-search input:focus { border-color: #7058dc; box-shadow: 0 0 0 3px rgba(124, 92, 255, .12); }
        .marketplace-categories { display: flex; gap: 6px; padding: 5px; overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); }
        .marketplace-category { padding: 9px 13px; border: 0; border-radius: 8px; color: var(--muted); background: transparent; cursor: pointer; font: 650 12px inherit; white-space: nowrap; }
        .marketplace-category:hover { color: var(--text); }
        .marketplace-category.is-active { color: #fff; background: #26213e; box-shadow: inset 0 0 0 1px rgba(161, 142, 255, .2); }
        .marketplace-section-head { display: flex; align-items: center; justify-content: space-between; margin: 0 0 15px; }
        .marketplace-section-head h2 { margin: 0; font-size: 14px; letter-spacing: -.01em; }
        .marketplace-section-head span { color: var(--muted); font-size: 12px; }
        .marketplace-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .marketplace-card { min-height: 260px; padding: 20px; border: 1px solid var(--line); border-radius: 15px; background: linear-gradient(150deg, rgba(255, 255, 255, .025), transparent 40%), var(--panel); transition: border-color .18s, transform .18s, background .18s; }
        .marketplace-card:hover { border-color: #3a4050; background-color: var(--panel-strong); transform: translateY(-2px); }
        .marketplace-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .marketplace-icon { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid color-mix(in srgb, var(--accent), white 12%); border-radius: 11px; color: #fff; background: color-mix(in srgb, var(--accent), transparent 76%); font-size: 12px; font-weight: 800; letter-spacing: -.02em; }
        .marketplace-badge { padding: 5px 8px; border: 1px solid var(--line); border-radius: 20px; color: var(--muted); background: #0d1016; font-size: 10px; font-weight: 700; }
        .marketplace-badge.is-enabled { border-color: rgba(24, 182, 164, .3); color: #62d9ca; background: rgba(24, 182, 164, .08); }
        .marketplace-card h3 { margin: 18px 0 7px; font-size: 17px; letter-spacing: -.025em; }
        .marketplace-description { min-height: 60px; margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.55; }
        .marketplace-publisher { display: flex; align-items: center; gap: 6px; margin-top: 15px; color: #b8becc; font-size: 11px; }
        .marketplace-publisher svg { width: 15px; height: 15px; padding: 2px; border-radius: 50%; fill: none; stroke: #a999ff; stroke-width: 2.5; background: rgba(124, 92, 255, .14); }
        .marketplace-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
        .marketplace-version { color: #676f80; font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; }
        .marketplace-action { border: 0; padding: 8px 10px; border-radius: 8px; color: #ddd7ff; background: transparent; cursor: pointer; font: 700 11px inherit; }
        .marketplace-action:hover { background: rgba(124, 92, 255, .12); }
        .marketplace-empty { grid-column: 1 / -1; padding: 64px 24px; border: 1px dashed var(--line); border-radius: 15px; color: var(--muted); text-align: center; }
        .marketplace-note { display: flex; gap: 10px; align-items: center; margin-top: 22px; padding: 12px 14px; border: 1px solid #262c39; border-radius: 11px; color: #8d95a7; background: #0d1016; font-size: 11px; line-height: 1.5; }
        .marketplace-note::before { content: ""; width: 6px; height: 6px; flex: 0 0 auto; border-radius: 50%; background: #7c5cff; box-shadow: 0 0 0 4px rgba(124, 92, 255, .12); }
        @media (max-width: 980px) { .marketplace-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .marketplace-controls { flex-direction: column; } }
        @media (max-width: 640px) { .marketplace-shell { padding: 28px 18px 44px; } .marketplace-header { align-items: flex-start; flex-direction: column; } .marketplace-grid { grid-template-columns: 1fr; } .marketplace-summary { width: 100%; } }
      `}</style>

      <header className="marketplace-header">
        <div>
          <p className="marketplace-eyebrow">Module catalog</p>
          <h1 className="marketplace-title">Module Marketplace</h1>
          <p className="marketplace-subtitle">
            Extend your workspace with reviewed modules built for SkaiCloud operations.
          </p>
        </div>
        <div className="marketplace-summary" aria-label="Module summary">
          <div className="marketplace-stat"><strong>{modules.length}</strong><span>Available</span></div>
          <div className="marketplace-stat"><strong>{enabledCount}</strong><span>Enabled</span></div>
          <div className="marketplace-stat"><strong>{pendingCount}</strong><span>In review</span></div>
        </div>
      </header>

      <section className="marketplace-controls" aria-label="Catalog controls">
        <label className="marketplace-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search modules, publishers, or capabilities"
            aria-label="Search marketplace"
          />
        </label>
        <div className="marketplace-categories" aria-label="Module categories">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={`marketplace-category${category === item ? " is-active" : ""}`}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="catalog-title">
        <div className="marketplace-section-head">
          <h2 id="catalog-title">{category === "All" ? "All modules" : category}</h2>
          <span>{visibleModules.length} {visibleModules.length === 1 ? "module" : "modules"}</span>
        </div>

        <div className="marketplace-grid">
          {visibleModules.map((module) => (
            <article className="marketplace-card" key={module.key}>
              <div className="marketplace-card-top">
                <div className="marketplace-icon" style={{ "--accent": module.accent } as CSSProperties}>{module.icon}</div>
                <span className={`marketplace-badge${module.status === "Enabled" ? " is-enabled" : ""}`}>{module.status}</span>
              </div>
              <h3>{module.name}</h3>
              <p className="marketplace-description">{module.summary}</p>
              <div className="marketplace-publisher">
                {module.verified && <CheckIcon />}
                <span>{module.publisher}</span>
              </div>
              <footer className="marketplace-card-footer">
                <span className="marketplace-version">v{module.version}</span>
                <button type="button" className="marketplace-action">
                  {module.status === "Enabled" ? "Manage" : module.status === "Review pending" ? "View review" : "Review package"}
                </button>
              </footer>
            </article>
          ))}

          {visibleModules.length === 0 && (
            <div className="marketplace-empty">No modules match this search.</div>
          )}
        </div>
      </section>

      <aside className="marketplace-note">
        Packages are inspected, trust-checked, and dry-run validated before metadata registration. Uploaded code is never executed by this module.
      </aside>
    </main>
  );
}
