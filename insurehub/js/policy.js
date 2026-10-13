document.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  const p = getPolicyById(id);
  const mount = qs("#policyDetail");
  if (!p) {
    mount.innerHTML = `<div class="notice err show">Policy not found. <a href="browse.html">Back to browse</a></div>`;
    return;
  }

  const selected = getCompareIds().includes(p.id);
  mount.innerHTML = `
    <div class="policy-hero-img"><img src="${policyImage(p)}" alt="${p.type}" /></div>
    <span class="badge">${p.type}</span>
    <h1 style="margin:12px 0">${p.name}</h1>
    <p class="meta">${p.company} · Tenure ${p.tenure} · Rating ${p.rating}/5</p>
    <p class="price">₹${p.premium.toLocaleString("en-IN")} <small>/ month</small></p>
    <p class="lead" style="margin:16px 0;color:var(--muted)">${p.summary}</p>
    <ul class="meta" style="padding-left:18px;margin-bottom:18px">
      ${p.features.map((f) => `<li>${f}</li>`).join("")}
    </ul>
    <div class="grid" style="margin-bottom:20px">
      <div class="glass" style="padding:16px"><b>Cover</b><p>${p.cover}</p></div>
      <div class="glass" style="padding:16px"><b>Claim settlement</b><p>${p.claimSettlement}</p></div>
      <div class="glass" style="padding:16px"><b>Network</b><p>${p.networkHospitals}</p></div>
    </div>
    <p class="meta"><strong>Add-ons:</strong> ${p.addOns}</p>
    <p class="meta"><strong>Waiting period:</strong> ${p.waitingPeriod}</p>
    <p class="meta"><strong>Co-pay:</strong> ${p.copay}</p>
    <p class="meta"><strong>Exclusions:</strong> ${p.exclusions}</p>
    <div class="card-actions">
      ${compareButtonHTML(p.id, selected)}
      <a class="btn btn-primary" href="renewal.html?name=${encodeURIComponent(p.name)}&type=${encodeURIComponent(p.type)}">Set renewal reminder</a>
      <a class="btn btn-ghost" href="browse.html">More policies</a>
    </div>
  `;
});
