function daysUntilNextMonthly(dateStr) {
  const source = new Date(dateStr);
  if (Number.isNaN(source.getTime())) return null;
  const day = source.getDate();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let next = new Date(now.getFullYear(), now.getMonth(), day);
  next.setHours(0, 0, 0, 0);
  if (next.getDate() !== day) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  if (next < now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, day);
    if (next.getDate() !== day) {
      next = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    }
  }
  return {
    days: Math.round((next - now) / 86400000),
    next,
  };
}

function renewalOwnerKey() {
  const user = currentUser();
  return user ? user.email : "guest";
}

function saveRenewal(entry) {
  const all = read(RENEWALS_KEY, {});
  const key = renewalOwnerKey();
  all[key] = all[key] || [];
  all[key].unshift(entry);
  write(RENEWALS_KEY, all);
}

function deleteRenewal(id) {
  const all = read(RENEWALS_KEY, {});
  const key = renewalOwnerKey();
  all[key] = (all[key] || []).filter((r) => String(r.createdAt) !== String(id));
  write(RENEWALS_KEY, all);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = qs("#renewalForm");
  if (!form) return;

  const params = new URLSearchParams(location.search);
  if (params.get("name")) qs("#policyName").value = params.get("name");
  if (params.get("type")) qs("#policyType").value = params.get("type");
  mountCalendar(qs("#renewalCalendar"), qs("#renewalDate"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = qs("#policyName").value.trim();
    const type = qs("#policyType").value.trim();
    const number = qs("#policyNumber").value.trim();
    const date = qs("#renewalDate").value;
    const result = daysUntilNextMonthly(date);
    const box = qs("#daysResult");
    const note = qs("#renewalNote");

    if (!name || !type || !number || !result) {
      note.className = "notice err show";
      note.textContent = "Please fill every field with a valid monthly renewal date.";
      box.classList.remove("show");
      return;
    }

    const nextLabel = result.next.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    saveRenewal({
      name,
      type,
      number,
      date,
      days: result.days,
      nextLabel,
      createdAt: Date.now(),
    });

    note.className = "notice ok show";
    note.textContent = "Renewal reminder saved. You can also view it from your profile after sign in.";
    box.className = "days-card show";
    box.innerHTML = `
      <p class="meta">${name} · ${type} · ${number}</p>
      <p><strong>${result.days}</strong> day${result.days === 1 ? "" : "s"} remaining</p>
      <p>Next monthly renewal: ${nextLabel}</p>
    `;
  });
});
