document.addEventListener("DOMContentLoaded", () => {
  const user = currentUser();
  if (!user) {
    location.href = "signin.html";
    return;
  }

  const welcome = qs("#welcome");
  if (welcome) welcome.textContent = `${user.name} logged in successfully`;

  function showPanel(id) {
    qsa(".panel").forEach((p) => p.classList.remove("active"));
    qsa(".side-nav button").forEach((b) => b.classList.remove("active"));
    qs("#" + id).classList.add("active");
    qs(`[data-panel="${id}"]`).classList.add("active");
  }

  qsa(".side-nav button").forEach((btn) => {
    if (!btn.dataset.panel) return;
    btn.addEventListener("click", () => showPanel(btn.dataset.panel));
  });

  qs("#profileDetails").innerHTML = `
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
    <p><strong>Date of birth:</strong> ${user.dob}</p>
    <p><strong>PAN:</strong> ${user.pan}</p>
  `;

  const list = qs("#renewalPolicies");

  function renderRenewalPolicies() {
    const all = read(RENEWALS_KEY, {});
    const mine = all[user.email] || [];
    if (!mine.length) {
      list.innerHTML = "<p class='meta'>No renewal reminders yet. Add one from the Renewal Tracker.</p>";
      return;
    }
    list.innerHTML = mine
      .map((r) => {
        const fresh = daysUntilNextMonthly(r.date);
        return `<article class="renewal-item">
          <div>
            <h3>${r.name}</h3>
            <p class="meta">${r.type} · ${r.number}</p>
            <p class="meta">Next: ${fresh ? fresh.next.toLocaleDateString("en-IN") : r.nextLabel}</p>
          </div>
          <div class="renewal-actions">
            <strong>${fresh ? fresh.days : r.days}</strong>
            <span class="meta">days left</span>
            <button type="button" class="btn btn-danger btn-sm" data-delete-renewal="${r.createdAt}">Delete</button>
          </div>
        </article>`;
      })
      .join("");
  }

  renderRenewalPolicies();

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete-renewal]");
    if (!btn) return;
    deleteRenewal(btn.dataset.deleteRenewal);
    renderRenewalPolicies();
  });

  qs("#passwordForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const next = qs("#newPassword").value;
    const note = qs("#passNote");
    if (next.length < 6) {
      note.className = "notice err show";
      note.textContent = "Password must be at least 6 characters.";
      return;
    }
    const listUsers = users().map((u) =>
      u.email === user.email ? { ...u, password: next } : u
    );
    saveUsers(listUsers);
    note.className = "notice ok show";
    note.textContent = "Password changed successfully.";
    qs("#passwordForm").reset();
  });

  qs("#signOut").addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    location.href = "index.html";
  });
});
