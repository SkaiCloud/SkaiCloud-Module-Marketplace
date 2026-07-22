let modules = [];
let selectedCategory = "All";
let catalogLoaded = false;

const searchInput = document.querySelector("#search");
const categoryRoot = document.querySelector("#categories");
const catalogRoot = document.querySelector("#catalog");
const commandStatus = document.querySelector("#command-status");
const commandStatusLabel = document.querySelector("#command-status-label");
const commandStatusDetail = document.querySelector("#command-status-detail");
const runtimeChannel = "skaicloud-module-runtime-v1";
const accentColors = ["#26b5c7", "#2ea66f", "#dc8b2d", "#d05f75", "#4e87d8", "#8a6bd1"];
let commandRequestId = null;
let commandRequestTimeout = null;
let purchaseRequestId = null;

function cleanText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanList(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).slice(0, 50) : [];
}

function normalizeModule(value) {
  if (!value || typeof value !== "object") return null;
  const moduleKey = cleanText(value.moduleKey);
  const name = cleanText(value.name);
  if (!moduleKey || !name) return null;
  const pricing = value.pricing && typeof value.pricing === "object" ? value.pricing : {};
  const compatibility = value.compatibility && typeof value.compatibility === "object" ? value.compatibility : {};
  return {
    moduleKey,
    name,
    category: cleanText(value.category, "Other"),
    summary: cleanText(value.summary, "No summary provided."),
    description: cleanText(value.description),
    publisher: cleanText(value.publisher, "Unknown publisher"),
    publisherVerified: value.publisherVerified === true,
    latestVersion: cleanText(value.latestVersion, "0.0.0"),
    status: value.status === "published" ? "published" : "review",
    releaseChannel: cleanText(value.releaseChannel, "stable"),
    pricing: {
      model: cleanText(pricing.model, "free"),
      priceCents: Number.isInteger(pricing.priceCents) ? Math.max(0, pricing.priceCents) : null,
      currency: cleanText(pricing.currency, "USD"),
    },
    compatibility: {
      minimumBuild: Number.isInteger(compatibility.minimumBuild) ? compatibility.minimumBuild : 1,
      moduleApiVersion: Number.isInteger(compatibility.moduleApiVersion) ? compatibility.moduleApiVersion : 1,
    },
    requiredModules: cleanList(value.requiredModules),
    features: cleanList(value.features),
    entitled: value.entitled === true,
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function accentFor(moduleKey) {
  const total = Array.from(moduleKey).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return accentColors[total % accentColors.length];
}

function categories() {
  return ["All", ...Array.from(new Set(modules.map((module) => module.category))).sort((left, right) => left.localeCompare(right))];
}

function visibleModules() {
  const query = searchInput.value.trim().toLowerCase();
  return modules.filter((module) => {
    const categoryMatch = selectedCategory === "All" || module.category === selectedCategory;
    const queryMatch = !query || [module.name, module.summary, module.publisher, module.category, ...module.features].some((value) => value.toLowerCase().includes(query));
    return categoryMatch && queryMatch;
  });
}

function formatPricing(module) {
  if (module.pricing.model === "free") return "Free";
  if (module.pricing.model === "included") return "Included";
  if (module.pricing.priceCents === null) return module.pricing.model === "one_time" ? "One-time" : "Subscription";
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: module.pricing.currency }).format(module.pricing.priceCents / 100);
  return module.pricing.model === "one_time" ? `${amount} one-time` : `${amount} subscription`;
}

function renderCategories() {
  const values = categories();
  if (!values.includes(selectedCategory)) selectedCategory = "All";
  categoryRoot.innerHTML = values.map((category) => `<button type="button" class="category${category === selectedCategory ? " active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${category === selectedCategory}">${escapeHtml(category)}</button>`).join("");
}

function detailMarkup(module) {
  const features = module.features.length
    ? `<ul>${module.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>`
    : "<p>No feature list has been supplied yet.</p>";
  const dependencies = module.requiredModules.length ? module.requiredModules.join(", ") : "None";
  const purchasable = module.status === "published" && module.pricing.model === "one_time" && Number.isInteger(module.pricing.priceCents) && module.pricing.priceCents > 0;
  const purchaseAction = module.entitled
    ? '<span class="owned" aria-label="Module owned">Owned</span>'
    : purchasable
      ? `<button type="button" class="purchase" data-purchase="${escapeHtml(module.moduleKey)}">Buy once — ${escapeHtml(new Intl.NumberFormat("en-US", { style: "currency", currency: module.pricing.currency }).format(module.pricing.priceCents / 100))}</button>`
      : "";
  return `<div class="details" data-details="${escapeHtml(module.moduleKey)}" hidden>
    <h4>Module details</h4>
    ${features}
    <dl>
      <div><dt>Pricing</dt><dd>${escapeHtml(formatPricing(module))}</dd></div>
      <div><dt>Channel</dt><dd>${escapeHtml(module.releaseChannel)}</dd></div>
      <div><dt>Minimum build</dt><dd>${module.compatibility.minimumBuild}</dd></div>
      <div><dt>Module API</dt><dd>v${module.compatibility.moduleApiVersion}</dd></div>
      <div><dt>Dependencies</dt><dd>${escapeHtml(dependencies)}</dd></div>
    </dl>
    ${purchaseAction}
  </div>`;
}

function renderSummary() {
  document.querySelector("#available-count").textContent = modules.length;
  document.querySelector("#verified-count").textContent = modules.filter((module) => module.publisherVerified).length;
  document.querySelector("#review-count").textContent = modules.filter((module) => module.status === "review").length;
}

function renderCatalog() {
  const visible = visibleModules();
  document.querySelector("#catalog-title").textContent = selectedCategory === "All" ? "All modules" : selectedCategory;
  document.querySelector("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "module" : "modules"}`;
  if (!catalogLoaded) {
    catalogRoot.innerHTML = '<div class="empty">Loading the Command catalog...</div>';
    return;
  }
  catalogRoot.innerHTML = visible.length ? visible.map((module) => {
    const statusLabel = module.status === "published" ? "Published" : "In review";
    return `<article class="card">
      <div class="card-top">
        <div class="icon" style="--accent:${accentFor(module.moduleKey)}">${escapeHtml(initials(module.name))}</div>
        <span class="badge ${module.status}">${statusLabel}</span>
      </div>
      <h3>${escapeHtml(module.name)}</h3>
      <p class="description">${escapeHtml(module.summary)}</p>
      <div class="publisher">${module.publisherVerified ? '<span class="verified" aria-label="Verified publisher">&#10003;</span>' : ""}${escapeHtml(module.publisher)}</div>
      ${detailMarkup(module)}
      <footer class="card-footer">
        <span class="version">v${escapeHtml(module.latestVersion)}</span>
        <button type="button" class="action" data-details-toggle="${escapeHtml(module.moduleKey)}" aria-expanded="false">View details</button>
      </footer>
    </article>`;
  }).join("") : '<div class="empty">No Command catalog modules match this view.</div>';
}

function renderAll() {
  renderCategories();
  renderSummary();
  renderCatalog();
}

categoryRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  renderCategories();
  renderCatalog();
});

catalogRoot.addEventListener("click", (event) => {
  const purchaseButton = event.target.closest("[data-purchase]");
  if (purchaseButton) {
    if (purchaseRequestId) return;
    const moduleKey = purchaseButton.dataset.purchase;
    purchaseRequestId = `command-purchase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    purchaseButton.disabled = true;
    purchaseButton.textContent = "Opening secure checkout...";
    document.querySelector("#purchase-status").textContent = "Connecting to SkaiCloud Command...";
    window.parent.postMessage({
      channel: runtimeChannel,
      requestId: purchaseRequestId,
      operation: "host.command.purchase",
      targetModuleKey: moduleKey,
    }, "*");
    return;
  }
  const button = event.target.closest("[data-details-toggle]");
  if (!button) return;
  const moduleKey = button.dataset.detailsToggle;
  const details = catalogRoot.querySelector(`[data-details="${CSS.escape(moduleKey)}"]`);
  if (!details) return;
  const expanded = details.hidden;
  details.hidden = !expanded;
  button.setAttribute("aria-expanded", String(expanded));
  button.textContent = expanded ? "Hide details" : "View details";
});

searchInput.addEventListener("input", renderCatalog);

function setCommandStatus(state, label, detail) {
  commandStatus.className = `connection ${state}`;
  commandStatusLabel.textContent = label;
  commandStatusDetail.textContent = detail;
}

function requestCommandCatalog() {
  if (commandRequestTimeout) window.clearTimeout(commandRequestTimeout);
  commandRequestId = `command-catalog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  setCommandStatus("checking", "Checking Command", "Loading reviewed catalog entries");
  window.parent.postMessage({
    channel: runtimeChannel,
    requestId: commandRequestId,
    operation: "host.command.catalog",
  }, "*");
  commandRequestTimeout = window.setTimeout(() => {
    commandRequestId = null;
    catalogLoaded = true;
    modules = [];
    setCommandStatus("failed", "Command unavailable", "Click to retry");
    renderAll();
  }, 10000);
}

window.addEventListener("message", (event) => {
  const message = event.data;
  if (event.source !== window.parent || !message || message.channel !== runtimeChannel) return;
  if (message.type === "ready") {
    requestCommandCatalog();
    return;
  }
  if (purchaseRequestId && message.requestId === purchaseRequestId) {
    purchaseRequestId = null;
    if (!message.ok) {
      document.querySelector("#purchase-status").textContent = cleanText(message.error, "Unable to start module purchase.");
      renderCatalog();
      return;
    }
    const purchasedKey = cleanText(message.result?.moduleKey);
    modules = modules.map((module) => module.moduleKey === purchasedKey ? { ...module, entitled: true } : module);
    document.querySelector("#purchase-status").textContent = "This installation already owns the module.";
    renderCatalog();
    return;
  }
  if (!commandRequestId || message.requestId !== commandRequestId) return;
  window.clearTimeout(commandRequestTimeout);
  commandRequestTimeout = null;
  commandRequestId = null;
  catalogLoaded = true;
  const result = message.result;
  if (!message.ok || !result || result.connected !== true) {
    modules = [];
    const detail = result?.status === "unconfigured" ? "Connection is not configured" : "Click to retry";
    setCommandStatus("failed", "Command unavailable", detail);
    renderAll();
    return;
  }
  modules = Array.isArray(result.modules) ? result.modules.map(normalizeModule).filter(Boolean) : [];
  const timing = Number.isInteger(result.responseMs) ? ` | ${result.responseMs} ms` : "";
  setCommandStatus("connected", "Command connected", `${modules.length} catalog ${modules.length === 1 ? "module" : "modules"}${timing}`);
  renderAll();
});

commandStatus.addEventListener("click", requestCommandCatalog);
renderAll();
