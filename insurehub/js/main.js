const COMPARE_KEY = "insurehub_compare";
const SESSION_KEY = "insurehub_session";
const USERS_KEY = "insurehub_users";
const RENEWALS_KEY = "insurehub_renewals";

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function currentUser() {
  return read(SESSION_KEY, null);
}

function getCompareIds() {
  return read(COMPARE_KEY, []);
}

function setCompareIds(ids) {
  write(COMPARE_KEY, ids);
  renderCompareTray();
}

function toggleCompare(id) {
  let ids = getCompareIds();
  if (ids.includes(id)) {
    ids = ids.filter((x) => x !== id);
  } else {
    if (ids.length >= 3) {
      alert("You can compare a maximum of 3 policies.");
      return false;
    }
    ids.push(id);
  }
  setCompareIds(ids);
  return ids.includes(id);
}

function renderNavAuth() {
  const slot = qs("[data-auth-slot]");
  if (!slot) return;
  const user = currentUser();
  if (user) {
    slot.innerHTML = `<a class="nav-cta" href="profile.html">${user.name.split(" ")[0]}</a>`;
  } else {
    slot.innerHTML = `<a class="nav-cta" href="signin.html">Sign in</a>`;
  }
}

function renderCompareTray() {
  const tray = qs("#compareTray");
  if (!tray) return;
  const ids = getCompareIds();
  const names = ids.map((id) => getPolicyById(id)?.name).filter(Boolean);
  tray.classList.toggle("show", ids.length > 0);
  qs("#compareTrayText", tray).textContent = ids.length
    ? `${ids.length} selected: ${names.join(", ")}`
    : "";
  qs("#goCompare", tray).disabled = ids.length < 2;
  syncCompareButtons();
}

function compareButtonHTML(id, selected) {
  return `<button type="button" class="btn-compare ${selected ? "is-on" : ""}" data-compare="${id}" aria-pressed="${selected}">
    <span class="compare-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M7 4v16M17 4v16M4 8h6M14 16h6M7 8l3 4-3 4M17 16l-3-4 3-4"/>
      </svg>
    </span>
    <span class="compare-label">${selected ? "Added" : "Compare"}</span>
  </button>`;
}

function syncCompareButtons() {
  const ids = getCompareIds();
  qsa("[data-compare]").forEach((btn) => {
    const on = ids.includes(btn.dataset.compare);
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on);
    const label = btn.querySelector(".compare-label");
    if (label) label.textContent = on ? "Added" : "Compare";
  });
}

function policyCardHTML(p, options = {}) {
  const selected = getCompareIds().includes(p.id);
  const compact = options.compact;
  const img = policyImage(p);
  return `
    <article class="policy-card glass-shine ${compact ? "mini-card" : ""}" data-id="${p.id}">
      <div class="policy-media"><img src="${img}" alt="${p.type}" /></div>
      <span class="badge">${p.type}</span>
      <h3>${p.name}</h3>
      <p class="meta">${p.company}</p>
      <p class="price">₹${p.premium.toLocaleString("en-IN")} <small>/ month</small></p>
      <p class="meta">Tenure: ${p.tenure} · Cover: ${p.cover}</p>
      ${compact ? "" : `<p class="meta">${p.summary}</p>`}
      <div class="card-actions">
        <a class="btn btn-primary btn-sm" href="policy.html?id=${p.id}">Browse policy</a>
        ${
          compact
            ? ""
            : `${compareButtonHTML(p.id, selected)}
               <a class="btn btn-ghost btn-sm" href="renewal.html?name=${encodeURIComponent(p.name)}&type=${encodeURIComponent(p.type)}">Set renewal reminder</a>`
        }
      </div>
    </article>
  `;
}

function renderMarquee() {
  const track = qs("#marqueeTrack");
  if (!track) return;
  const html = POLICIES.map((p) => policyCardHTML(p, { compact: true })).join("");
  track.innerHTML = html + html;
}

function initMenu() {
  const btn = qs("#menuBtn");
  const links = qs("#navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", () => links.classList.toggle("open"));
}

function initCompareDelegation() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-compare]");
    if (!btn) return;
    toggleCompare(btn.dataset.compare);
  });
}

function initPageBackgrounds() {
  const host = qs(".page-bg");
  if (!host) return;
  const images = typeof BG_IMAGES !== "undefined" ? BG_IMAGES : [];
  host.innerHTML = images
    .map(
      (src, i) =>
        `<span class="bg-layer" style="background-image:url('${src}');animation-delay:${i * 6}s"></span>`
    )
    .join("");
}

function initHeroSlideshow() {
  const media = qs(".hero-media");
  if (!media) return;
  const images = typeof BG_IMAGES !== "undefined" ? BG_IMAGES : [];
  media.innerHTML = images
    .map(
      (src, i) =>
        `<div class="hero-slide ${i === 0 ? "is-on" : ""}" style="background-image:linear-gradient(90deg, rgba(3,10,22,.9), rgba(4,12,24,.35)), url('${src}')"></div>`
    )
    .join("");
  let i = 0;
  setInterval(() => {
    const slides = qsa(".hero-slide", media);
    if (!slides.length) return;
    slides[i].classList.remove("is-on");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-on");
  }, 5500);
}

function initScrollDown() {
  const btn = qs(".scroll-down");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    const target = qs(btn.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function initReveal() {
  const nodes = qsa("section, .form-card, .support-card");
  nodes.forEach((el) => el.classList.add("reveal"));
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  nodes.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initPageBackgrounds();
  initHeroSlideshow();
  initScrollDown();
  renderNavAuth();
  renderMarquee();
  renderCompareTray();
  initMenu();
  initCompareDelegation();
  initReveal();

  const go = qs("#goCompare");
  if (go) {
    go.addEventListener("click", () => {
      const ids = getCompareIds();
      if (ids.length < 2) {
        alert("Select at least 2 policies to compare.");
        return;
      }
      if (ids.length > 3) {
        alert("Select at most 3 policies to compare.");
        return;
      }
      location.href = "compare.html";
    });
  }

  const clear = qs("#clearCompare");
  if (clear) {
    clear.addEventListener("click", () => setCompareIds([]));
  }

  qsa("[data-page]").forEach((a) => {
    const page = location.pathname.split("/").pop() || "index.html";
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  renderFooter();
});

function renderFooter() {
  const html = `
    <div class="footer-grid wrap">
      <div>
        <a class="logo" href="index.html"><span class="logo-mark">IH</span> InsureHub</a>
        <p class="meta" style="margin-top:14px;max-width:280px">Compare health, mediclaim, bike and travel plans. Track monthly renewals in one place.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <a href="index.html">Home</a>
        <a href="browse.html">Browse policy</a>
        <a href="compare.html">Compare</a>
        <a href="renewal.html">Renewal tracker</a>
      </div>
      <div>
        <h3>Account</h3>
        <a href="signin.html">Sign in</a>
        <a href="register.html">Register</a>
        <a href="profile.html">Profile</a>
        <a href="support.html">Support</a>
      </div>
      <div>
        <h3>Contact</h3>
        <a href="mailto:support@insurehub.example">support@insurehub.example</a>
        <a href="tel:+912240012345">+91 22 4001 2345</a>
        <p class="meta">Horizon Tower, BKC<br>Mumbai 400051</p>
      </div>
    </div>
    <div class="footer-bar wrap">
      <span>© 2026 InsureHub · Demo only</span>
      <a href="support.html">Need help?</a>
    </div>
  `;
  let footer = qs("footer.footer");
  if (!footer) {
    footer = document.createElement("footer");
    footer.className = "footer";
    const tray = qs("#compareTray");
    const firstScript = qs("script");
    if (tray) document.body.insertBefore(footer, tray);
    else if (firstScript) document.body.insertBefore(footer, firstScript);
    else document.body.appendChild(footer);
  }
  footer.innerHTML = html;
}
