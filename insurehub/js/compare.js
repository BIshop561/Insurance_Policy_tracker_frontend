document.addEventListener("DOMContentLoaded", () => {
  const ids = getCompareIds();
  const note = qs("#compareNote");
  const tableWrap = qs("#compareTableWrap");

  if (ids.length < 2 || ids.length > 3) {
    note.className = "notice err show";
    note.textContent =
      "Please select between 2 and 3 policies from Browse Policy, then return here.";
    tableWrap.innerHTML = "";
    return;
  }

  const policies = ids.map(getPolicyById).filter(Boolean);
  note.className = "notice ok show";
  note.textContent = `Comparing ${policies.length} policies side by side.`;

  const head = `<tr><th>Section</th>${policies
    .map((p) => `<th>${p.name}<br><small>${p.company}</small></th>`)
    .join("")}</tr>`;

  const rows = COMPARE_FIELDS.map((field) => {
    const cells = policies
      .map((p) => {
        const raw = p[field.key];
        const val = field.format ? field.format(raw) : raw;
        return `<td>${val}</td>`;
      })
      .join("");
    return `<tr><th>${field.label}</th>${cells}</tr>`;
  }).join("");

  tableWrap.innerHTML = `<table class="compare-table glass"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
});
