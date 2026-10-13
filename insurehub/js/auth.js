function users() {
  return read(USERS_KEY, []);
}

function saveUsers(list) {
  write(USERS_KEY, list);
}

function validName(name) {
  const value = name.trim();
  return value.length >= 2 && value.length <= 60 && /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value);
}

function validPan(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan);
}

function validPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function markField(input, ok) {
  input.classList.toggle("is-invalid", !ok);
  const wrap = input.closest(".field");
  if (wrap) wrap.classList.toggle("has-error", !ok);
  return ok;
}

function validateIdentityFields() {
  const nameEl = qs("#name");
  const phoneEl = qs("#phone");
  const panEl = qs("#pan");
  const emailEl = qs("#email");

  if (panEl) panEl.value = panEl.value.trim().toUpperCase();

  const nameOk = nameEl ? validName(nameEl.value) : true;
  const phoneOk = phoneEl ? validPhone(phoneEl.value.trim()) : true;
  const panOk = panEl ? validPan(panEl.value.trim()) : true;
  const emailOk = emailEl ? validEmail(emailEl.value.trim()) : true;

  if (nameEl) markField(nameEl, nameOk);
  if (phoneEl) markField(phoneEl, phoneOk);
  if (panEl) markField(panEl, panOk);
  if (emailEl) markField(emailEl, emailOk);

  return {
    ok: nameOk && phoneOk && panOk && emailOk,
    name: nameEl ? nameEl.value.trim() : "",
    phone: phoneEl ? phoneEl.value.trim() : "",
    pan: panEl ? panEl.value.trim().toUpperCase() : "",
    email: emailEl ? emailEl.value.trim().toLowerCase() : "",
  };
}

function showInvalidNote(note) {
  note.className = "notice err show";
  note.textContent = "Invalid data";
}

function bindLiveValidation(form) {
  ["name", "phone", "pan", "email"].forEach((id) => {
    const el = qs("#" + id, form);
    if (!el) return;
    el.addEventListener("blur", () => validateIdentityFields());
    el.addEventListener("input", () => {
      if (el.classList.contains("is-invalid")) validateIdentityFields();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = qs("#registerForm");
  const signinForm = qs("#signinForm");

  if (registerForm) {
    if (typeof mountCalendar === "function") {
      mountCalendar(qs("#dobCalendar"), qs("#dob"));
    }
    bindLiveValidation(registerForm);
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = qs("#authNote");
      const identity = validateIdentityFields();
      const dob = qs("#dob").value;
      const password = qs("#password").value;
      const passOk = password.length >= 6;
      markField(qs("#password"), passOk);
      markField(qs("#dob"), Boolean(dob));

      if (!identity.ok || !dob || !passOk) {
        showInvalidNote(note);
        return;
      }

      const list = users();
      if (list.some((u) => u.email === identity.email)) {
        note.className = "notice err show";
        note.textContent = "This email is already registered. Please sign in.";
        return;
      }

      list.push({
        name: identity.name,
        phone: identity.phone,
        dob,
        pan: identity.pan,
        email: identity.email,
        password,
      });
      saveUsers(list);
      write(SESSION_KEY, {
        name: identity.name,
        phone: identity.phone,
        dob,
        pan: identity.pan,
        email: identity.email,
      });
      note.className = "notice ok show";
      note.textContent = `${identity.name} registered successfully. Redirecting to your profile…`;
      setTimeout(() => (location.href = "profile.html"), 900);
    });
  }

  if (signinForm) {
    const emailEl = qs("#email");
    emailEl.addEventListener("blur", () => markField(emailEl, validEmail(emailEl.value.trim())));
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = qs("#authNote");
      const email = qs("#email").value.trim().toLowerCase();
      const password = qs("#password").value;
      const emailOk = validEmail(email);
      const passOk = password.length >= 6;
      markField(qs("#email"), emailOk);
      markField(qs("#password"), passOk);

      if (!emailOk || !passOk) {
        showInvalidNote(note);
        return;
      }

      const user = users().find((u) => u.email === email && u.password === password);

      if (!user) {
        showInvalidNote(note);
        return;
      }

      write(SESSION_KEY, {
        name: user.name,
        phone: user.phone,
        dob: user.dob,
        pan: user.pan,
        email: user.email,
      });
      note.className = "notice ok show";
      note.textContent = `${user.name} logged in successfully.`;
      setTimeout(() => (location.href = "profile.html"), 700);
    });
  }
});
