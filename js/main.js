
// DOM REFERENCES 

const appointmentForm = document.getElementById("appointmentForm");

const date = document.getElementById("date");
const time = document.getElementById("time");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const dni = document.getElementById("dni");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const birthDate = document.getElementById("birthDate");
const notes = document.getElementById("notes");
const editingId = document.getElementById("editingId");

const showAllBtn = document.getElementById("showAllBtn");
const showTodayBtn = document.getElementById("showTodayBtn");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editId = document.getElementById("editId");
const editDate = document.getElementById("editDate");
const editTime = document.getElementById("editTime");
const editFirstName = document.getElementById("editFirstName");
const editLastName = document.getElementById("editLastName");
const editDni = document.getElementById("editDni");
const editPhone = document.getElementById("editPhone");
const editEmail = document.getElementById("editEmail");
const editBirthDate = document.getElementById("editBirthDate");
const editNotes = document.getElementById("editNotes");


// BURGER MENU: OPEN/CLOSE NAVIGATION

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});


// COOKIES STORAGE (APPOINTMENTS)

// Unique identifier based on creation timestamp
function generateAppointmentId() {
  return Date.now();
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(c => c.startsWith(name + "="))
    ?.split("=")[1];
}

function getAppointments() {
  const raw = getCookie("citas");
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    console.error("Cookie 'citas' inválida:", raw);
    return [];
  }
}

function setAppointments(citas) {
  setCookie("citas", JSON.stringify(citas), 30);
}

// Create or update an appointment
function saveAppointment(cita) {
  const citas = getAppointments();
  const index = citas.findIndex(c => c.id == cita.id);

  if (index >= 0) citas[index] = cita;
  else citas.push(cita);

  setAppointments(citas);
}

// Delete an appointment by id
function deleteAppointment(id) {
  const citas = getAppointments().filter(c => c.id != id);
  setAppointments(citas);
}

// Read appointment data from the main form inputs
function getFormData() {
  return {
    id: editingId.value ? Number(editingId.value) : generateAppointmentId(),
    date: date.value,
    time: time.value,
    firstName: firstName.value,
    lastName: lastName.value,
    dni: dni.value,
    phone: phone.value,
    email: email.value,
    birthDate: birthDate.value,
    notes: notes.value
  };
}


// DATE HELPERS + HEADER LABEL

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function updateHeaderLabel(mode) {
  const title = document.querySelector("#mostrar-citas .header-show-top h2");
  const label = document.getElementById("todayLabel");
  const iso = todayISO();

  if (mode === "today") {
    if (title) title.textContent = "Citas de Hoy";
    if (label) label.textContent = formatDateES(iso);
  } else {
    if (title) title.textContent = "Todas las citas";
    if (label) label.textContent = "";
  }
}


// TABLE RENDERING

function renderAppointments(list) {
  const tbody = document.getElementById("appointmentsTbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8">dato vacío</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((c, index) => `
    <tr data-id="${c.id}">
      <td>${index + 1}</td>
      <td>${formatDateES(c.date)}</td>
      <td>${formatTime(c.time)}</td>
      <td>${escapeHtml(c.firstName)} ${escapeHtml(c.lastName)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>Confirmado</td>
      <td class="table-actions">
        <button type="button" class="btn-action btn-edit" data-action="edit" data-id="${c.id}">Editar</button>
        <button type="button" class="btn-action btn-delete" data-action="delete" data-id="${c.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");
  

  if (!tbody.dataset.listener) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;

      if (action === "edit") openEditModal(id);
      if (action === "delete") {
        const ok = confirm("¿Seguro que quieres eliminar esta cita?");
        if (!ok) return;
        deleteAppointment(id);
        renderAppointments(getAppointments()); 
      }
    });

    tbody.dataset.listener = "true";
  }
}

function formatDateES(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${d} ${meses[m - 1]} ${y}`;
}

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]
  ));
}


// VALIDATION (inline messages per field)

function setFieldError(input, message) {
  input.classList.add("error");
  const msgEl = input.closest("label")?.querySelector(".error-msg");
  if (msgEl) msgEl.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove("error");
  const msgEl = input.closest("label")?.querySelector(".error-msg");
  if (msgEl) msgEl.textContent = "";
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function isValidPhone(v) {
  const digits = v.replace(/\D/g, "");
  return /^\d{9}$/.test(digits);
}

function isValidDniNie(value) {
  const v = value.toUpperCase().replace(/\s|-/g, "");
  return /^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/.test(v);
}

function validateForm() {
  let valid = true;

  const fields = [date, time, firstName, lastName, dni, phone, email, birthDate];
  fields.forEach(clearFieldError);

  if (!date.value) { setFieldError(date, "Por favor, indica una fecha."); valid = false; }
  if (!time.value) { setFieldError(time, "Por favor, indica una hora."); valid = false; }

  if (!firstName.value.trim()) { setFieldError(firstName, "Nombre es obligatorio."); valid = false; }
  if (!lastName.value.trim()) { setFieldError(lastName, "Apellidos es obligatorio."); valid = false; }

  // DNI is required 
  if (!dni.value.trim()) {
    setFieldError(dni, "DNI/NIE es obligatorio.");
    valid = false;
  } else if (!isValidDniNie(dni.value)) {
    setFieldError(dni, "Formato no válido (ej., 12345678A o X1234567B).");
    valid = false;
  }

  // Phone required + numeric rules
  if (!phone.value.trim()) {
    setFieldError(phone, "Teléfono es obligatorio.");
    valid = false;
  } else if (!isValidPhone(phone.value)) {
    setFieldError(phone, "El teléfono debe tener 9 dígitos (solo números).");
    valid = false;
  }

  // Email required 
  if (!email.value.trim()) {
    setFieldError(email, "Email es obligatorio.");
    valid = false;
  } else if (!isValidEmail(email.value.trim())) {
    setFieldError(email, "Formato de email inválido (ej., nombre@dominio.com).");
    valid = false;
  }

  // Birth date cannot be future
  if (!birthDate.value) {
    setFieldError(birthDate, "Fecha de nacimiento es obligatoria.");
    valid = false;
  } else {
    const bd = new Date(birthDate.value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bd > today) {
      setFieldError(birthDate, "La fecha de nacimiento no puede ser futura.");
      valid = false;
    }
  }

  // Appointment date+time not in the past
  if (date.value && time.value) {
    const appt = new Date(`${date.value}T${time.value}:00`);
    const now = new Date();
    if (appt < now) {
      setFieldError(time, "La cita no puede ser en el pasado.");
      valid = false;
    }
  }

  return valid;
}


// FILTER MODE (today / all) + RENDER

let viewMode = "today"; // "today" | "all"

function applyFiltersAndRender() {
  const citas = getAppointments();

  let list = viewMode === "today"
    ? citas.filter(c => c.date === todayISO())
    : citas;

  // ⬇️ filtro por paciente (nombre + apellidos)
  if (searchQuery) {
    list = list.filter(c => {
      const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
      return fullName.includes(searchQuery);
    });
  }

  renderAppointments(list);
  updateHeaderLabel(viewMode);

  showTodayBtn?.classList.toggle("is-active", viewMode === "today");
  showAllBtn?.classList.toggle("is-active", viewMode === "all");
}



// EVENTS

appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const cita = getFormData();
  saveAppointment(cita);

  applyFiltersAndRender();

  appointmentForm.reset();
  editingId.value = "";
});

document.getElementById("appointmentsTbody")?.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-action]");
  if (!link) return;

  e.preventDefault();
  const id = link.dataset.id;

  if (link.dataset.action === "edit") {
    openEditModal(id);
    return;
  }

  if (link.dataset.action === "delete") {
    if (!confirm("¿Quieres eliminar esta cita?")) return;
    deleteAppointment(id);
    applyFiltersAndRender();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  applyFiltersAndRender();
});

showTodayBtn?.addEventListener("click", () => {
  viewMode = "today";
  applyFiltersAndRender();
});

showAllBtn?.addEventListener("click", () => {
  viewMode = "all";
  applyFiltersAndRender();
});


// EDIT MODAL

function openEditModal(id) {
  const citas = getAppointments();
  const c = citas.find(x => x.id == id);
  if (!c) return;

  editModal.hidden = false;

  editId.value = c.id;
  editDate.value = c.date;
  editTime.value = c.time;
  editFirstName.value = c.firstName;
  editLastName.value = c.lastName;
  editDni.value = c.dni;
  editPhone.value = c.phone;
  editEmail.value = c.email;
  editBirthDate.value = c.birthDate;
  editNotes.value = c.notes || "";
}

function closeEditModal() {
  editModal.hidden = true;
}

editModal.addEventListener("click", (e) => {
  if (e.target.dataset.close === "true") closeEditModal();
});

document.addEventListener("keydown", (e) => {
  if (!editModal.hidden && e.key === "Escape") closeEditModal();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateEditForm()) return;

  const citaEditada = {
    id: Number(editId.value),
    date: editDate.value,
    time: editTime.value,
    firstName: editFirstName.value.trim(),
    lastName: editLastName.value.trim(),
    dni: editDni.value.trim().toUpperCase(),
    phone: editPhone.value.trim(),
    email: editEmail.value.trim(),
    birthDate: editBirthDate.value,
    notes: editNotes.value
  };

  const current = getAppointments().find(x => x.id == citaEditada.id);
  if (current?.dni) citaEditada.dni = current.dni;

  saveAppointment(citaEditada);
  applyFiltersAndRender();
  closeEditModal();
});

function clearFieldError(el) {
  el.classList.remove("error");
  const old = el.parentElement.querySelector(".error-msg");
  if (old) old.remove();
}

function setFieldError(el, message) {
  el.classList.add("error");
  const span = document.createElement("span");
  span.className = "error-msg";
  span.textContent = message;
  el.parentElement.appendChild(span);
}

function validateEditForm() {
  let ok = true;

  const fields = [
    { el: editDate,      msg: "Selecciona una fecha." },
    { el: editTime,      msg: "Selecciona una hora." },
    { el: editFirstName, msg: "Nombre obligatorio (mín. 2 caracteres)." },
    { el: editLastName,  msg: "Apellidos obligatorios (mín. 2 caracteres)." },
    { el: editDni,       msg: "DNI/NIE no válido." },
    { el: editPhone,     msg: "Teléfono no válido." },
    { el: editEmail,     msg: "Email no válido." },
    { el: editBirthDate, msg: "Fecha de nacimiento obligatoria." }
  ];

  // limpia errores previos
  fields.forEach(f => clearFieldError(f.el));

  // validaciones
  fields.forEach(({ el, msg }) => {
    const value = (el.value || "").trim();

    // required
    if (!value) {
      ok = false;
      setFieldError(el, msg);
      return;
    }

    // reglas específicas (mínimos)
    if (el === editFirstName && value.length < 2) {
      ok = false; setFieldError(el, msg); return;
    }

    if (el === editLastName && value.length < 2) {
      ok = false; setFieldError(el, msg); return;
    }

    if (el === editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      ok = false; setFieldError(el, msg); return;
    }

    // Tel: simple (9-15 dígitos, permite + y espacios)
    if (el === editPhone && !/^[0-9+ ]{9,15}$/.test(value)) {
      ok = false; setFieldError(el, msg); return;
    }

    // DNI/NIE básico
    if (el === editDni && !/^([0-9]{8}[A-Za-z]|[XYZxyz][0-9]{7}[A-Za-z])$/.test(value)) {
      ok = false; setFieldError(el, msg); return;
    }
  });

  // foco al primer error
  if (!ok) {
    const firstError = editForm.querySelector(".error");
    firstError?.focus();
  }

  return ok;
}

//Busqueda
let searchQuery = "";

searchInput?.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  applyFiltersAndRender();
});
