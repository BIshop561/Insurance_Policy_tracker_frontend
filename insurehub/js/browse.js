function applyFilters() {
  const q = (qs("#searchInput")?.value || "").toLowerCase().trim();
  const type = qs("#typeFilter")?.value || "all";
  const company = qs("#companyFilter")?.value || "all";
  const sort = qs("#sortFilter")?.value || "featured";

  let list = POLICIES.filter((p) => {
    const hay = `${p.name} ${p.company} ${p.type} ${p.summary}`.toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchType = type === "all" || p.type === type;
    const matchCo = company === "all" || p.company === company;
    return matchQ && matchType && matchCo;
  });

  if (sort === "premium-asc") list.sort((a, b) => a.premium - b.premium);
  if (sort === "premium-desc") list.sort((a, b) => b.premium - a.premium);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  const grid = qs("#policyGrid");
  const empty = qs("#emptyState");
  if (!grid) return;
  grid.innerHTML = list.map((p) => policyCardHTML(p)).join("");
  if (empty) empty.style.display = list.length ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
  const typeSel = qs("#typeFilter");
  const coSel = qs("#companyFilter");
  if (typeSel) {
    uniqueTypes().forEach((t) => {
      typeSel.insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`);
    });
  }
  if (coSel) {
    uniqueCompanies().forEach((c) => {
      coSel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`);
    });
  }
  ["searchInput", "typeFilter", "companyFilter", "sortFilter"].forEach((id) => {
    qs("#" + id)?.addEventListener("input", applyFilters);
    qs("#" + id)?.addEventListener("change", applyFilters);
  });
  applyFilters();
});
