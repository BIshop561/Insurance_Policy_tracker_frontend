function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function mountCalendar(root, hiddenInput, options = {}) {
  if (!root || !hiddenInput) return;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let view = hiddenInput.value ? new Date(hiddenInput.value + "T00:00:00") : new Date();
  if (Number.isNaN(view.getTime())) view = new Date();
  let selected = hiddenInput.value || "";

  function render() {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = toISODate(new Date());

    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(`<span class="cal-empty"></span>`);
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const classes = ["cal-day"];
      if (iso === today) classes.push("is-today");
      if (iso === selected) classes.push("is-selected");
      cells.push(`<button type="button" class="${classes.join(" ")}" data-iso="${iso}">${day}</button>`);
    }

    root.innerHTML = `
      <div class="cal-head">
        <button type="button" class="cal-nav" data-shift="-1" aria-label="Previous month">‹</button>
        <strong>${monthNames[month]} ${year}</strong>
        <button type="button" class="cal-nav" data-shift="1" aria-label="Next month">›</button>
      </div>
      <div class="cal-week">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>
      <div class="cal-grid">${cells.join("")}</div>
    `;
  }

  root.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-shift]");
    if (nav) {
      view = new Date(view.getFullYear(), view.getMonth() + Number(nav.dataset.shift), 1);
      render();
      return;
    }
    const day = e.target.closest("[data-iso]");
    if (!day) return;
    selected = day.dataset.iso;
    hiddenInput.value = selected;
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    if (options.onSelect) options.onSelect(selected);
    render();
  });

  render();
}
