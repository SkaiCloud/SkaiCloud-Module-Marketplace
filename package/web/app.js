const categories = ["All", "Operations", "Automation", "Security", "Finance"];
const modules = [
  { name: "Network Operations", summary: "Circuit inventory, ISP coordination, site readiness, and field workflow control.", publisher: "SkaiCloud Network LLC", version: "1.4.0", category: "Operations", icon: "NO", accent: "#7c5cff", verified: true, status: "Enabled" },
  { name: "Workflow Automation", summary: "Build controlled triggers, approvals, notifications, and operational handoffs.", publisher: "SkaiCloud Network LLC", version: "1.1.2", category: "Automation", icon: "WA", accent: "#18b6a4", verified: true, status: "Available" },
  { name: "Security Center", summary: "Consolidated posture, access review, audit evidence, and policy monitoring.", publisher: "SkaiCloud Network LLC", version: "0.9.4", category: "Security", icon: "SC", accent: "#2f8cff", verified: true, status: "Review pending" },
  { name: "Billing Operations", summary: "Track recurring services, project charges, margins, and client billing readiness.", publisher: "SkaiCloud Network LLC", version: "1.0.0", category: "Finance", icon: "BO", accent: "#f0a43c", verified: true, status: "Available" },
  { name: "Field Dispatch", summary: "Coordinate surveys, technician assignments, site access, and completion evidence.", publisher: "SkaiCloud Labs", version: "0.8.1", category: "Operations", icon: "FD", accent: "#e4607c", verified: false, status: "Available" },
  { name: "Document Intake", summary: "Classify inbound documents and route structured records into review queues.", publisher: "SkaiCloud Labs", version: "0.6.3", category: "Automation", icon: "DI", accent: "#a66ee8", verified: false, status: "Available" },
];

let selectedCategory = "All";
const searchInput = document.querySelector("#search");
const categoryRoot = document.querySelector("#categories");
const catalogRoot = document.querySelector("#catalog");

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function visibleModules() {
  const query = searchInput.value.trim().toLowerCase();
  return modules.filter((module) => {
    const categoryMatch = selectedCategory === "All" || module.category === selectedCategory;
    const queryMatch = !query || [module.name, module.summary, module.publisher, module.category].some((value) => value.toLowerCase().includes(query));
    return categoryMatch && queryMatch;
  });
}

function renderCategories() {
  categoryRoot.innerHTML = categories.map((category) => `<button type="button" class="category${category === selectedCategory ? " active" : ""}" data-category="${category}" aria-pressed="${category === selectedCategory}">${category}</button>`).join("");
}

function renderCatalog() {
  const visible = visibleModules();
  document.querySelector("#catalog-title").textContent = selectedCategory === "All" ? "All modules" : selectedCategory;
  document.querySelector("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "module" : "modules"}`;
  catalogRoot.innerHTML = visible.length ? visible.map((module) => `
    <article class="card">
      <div class="card-top">
        <div class="icon" style="--accent:${escapeHtml(module.accent)}">${escapeHtml(module.icon)}</div>
        <span class="badge${module.status === "Enabled" ? " enabled" : ""}">${escapeHtml(module.status)}</span>
      </div>
      <h3>${escapeHtml(module.name)}</h3>
      <p class="description">${escapeHtml(module.summary)}</p>
      <div class="publisher">${module.verified ? '<span class="verified">✓</span>' : ""}${escapeHtml(module.publisher)}</div>
      <footer class="card-footer">
        <span class="version">v${escapeHtml(module.version)}</span>
        <button type="button" class="action">${module.status === "Enabled" ? "Manage" : module.status === "Review pending" ? "View review" : "Review package"}</button>
      </footer>
    </article>
  `).join("") : '<div class="empty">No modules match this search.</div>';
}

categoryRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderCategories();
  renderCatalog();
});
searchInput.addEventListener("input", renderCatalog);

document.querySelector("#available-count").textContent = modules.length;
document.querySelector("#enabled-count").textContent = modules.filter((module) => module.status === "Enabled").length;
document.querySelector("#review-count").textContent = modules.filter((module) => module.status === "Review pending").length;
renderCategories();
renderCatalog();
