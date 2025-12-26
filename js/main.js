//BURGER MENU: OPEN/CLOSE NAVIGATION
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});

//COOKIES STORAGE (APPOINTMENTS)

// Unique identifier based on creation timestamp
function generateAppointmentId() {
  return Date.now();
}

//Read appointment data from the "create appointment" form inputs
function getFormData() {
  return {
    id: editingId.value ? Number(editingId.value) : generateAppointmentId(),
    date: date.value,
    time: time.value,
    firstName: firstName.value,
    lastName: lastName.value,
    phone: phone.value,
    email: email.value,
    birthDate: birthDate.value,
    notes: notes.value
  };
}

//Set a cookie with expiration in days
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}

//Get a cookie value by name
function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(c => c.startsWith(name + "="))
    ?.split("=")[1];
}

//Read and parse appointments array from the cookie
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

//Persist appointments array into the cookie (30 days)
function setAppointments(citas) {
  setCookie("citas", JSON.stringify(citas), 30);
}

// CRUD OPERATIONS
//Create or update an appointment
function saveAppointment(cita) {
  const citas = getAppointments();
  const index = citas.findIndex(c => c.id == cita.id);

  if (index >= 0) citas[index] = cita;
  else citas.push(cita);

  setAppointments(citas);
}

//Load appointment data into the main form (NOT used by the modal flow)
function loadAppointment(id) {
  const citas = getAppointments();
  const c = citas.find(c => c.id == id);
  if (!c) return;

  //// Fill the form fields with stored values
  editingId.value = c.id;
  date.value = c.date;
  time.value = c.time;
  firstName.value = c.firstName;
  lastName.value = c.lastName;
  phone.value = c.phone;
  email.value = c.email;
  birthDate.value = c.birthDate;
  notes.value = c.notes;
}

//// Delete an appointment by id
function deleteAppointment(id) {
  const citas = getAppointments().filter(c => c.id != id);
  setAppointments(citas);
}


// TABLE RENDERING

function renderAppointments(citas = getAppointments()) {
  const tbody = document.getElementById("appointmentsTbody");
  if (!tbody) return;

  if (!citas.length) {
    tbody.innerHTML = `<tr><td colspan="7">dato vacío</td></tr>`;
    return;
  }

  // Build table rows dynamically
  tbody.innerHTML = citas.map((c, index) => `
    <tr data-id="${c.id}">
      <!-- Order in table (1,2,3...) -->
      <td>${index + 1}</td>

      <td>${formatDateES(c.date)}</td>
      <td>${formatTime(c.time)}</td>
      <td>${escapeHtml(c.firstName)} ${escapeHtml(c.lastName)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>Confirmed</td>
      <td>
        <a href="#" data-action="edit" data-id="${c.id}">Editar</a>
        <a href="#" data-action="delete" data-id="${c.id}">Eliminar</a>
      </td>
    </tr>
  `).join("");
}

//// Convert YYYY-MM-DD to Spanish text date (e.g., 21 diciembre 2025)
function formatDateES(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${d} ${meses[m - 1]} ${y}`;
}

//// Convert HH:MM to 12-hour format with AM/PM
function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Basic HTML escaping to avoid injecting HTML into the table
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]
  ));
}

// EVENTS

// Submit handler
appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const cita = getFormData();
  saveAppointment(cita);

  renderAppointments();

  appointmentForm.reset();
  editingId.value = "";
});

// Click handler for Edit/Delete links (event delegation)
document.getElementById("appointmentsTbody").addEventListener("click", (e) => {
  const link = e.target.closest("a[data-action]");
  if (!link) return;

  e.preventDefault();
  const id = link.dataset.id;

  if (link.dataset.action === "edit") {
    openEditModal(id);
  }

  if (link.dataset.action === "delete") {
    if (!confirm("¿Quieres eliminar esta cita?")) return;
    deleteAppointment(id);
    renderAppointments();
  }
});

// Render table on initial page load
document.addEventListener("DOMContentLoaded", () => renderAppointments());
/* END COOKIES */

//FORM VALIDATION
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return /^\d{9}$/.test(digits);
}

function isValidDniNie(value) {
  // Accept DNI: 8 digits + letter, NIE: X/Y/Z + 7 digits + letter
  const v = value.toUpperCase().replace(/\s|-/g, "");
  return /^(\d{8}[A-Z]|[XYZ]\d{7}[A-Z])$/.test(v);
}

function validateForm() {
  let valid = true;

  // Clear previous errors (so messages update live)
  const fields = [date, time, firstName, lastName, dni, phone, email, birthDate];
  fields.forEach(clearFieldError);

  // Required fields 
  if (!date.value) { setFieldError(date, "Por favor, indica una fecha."); valid = false; }
  if (!time.value) { setFieldError(time, "Por favor, indica una hora."); valid = false; }

  if (!firstName.value.trim()) { setFieldError(firstName, "Nombre es obligatorio."); valid = false; }
  if (!lastName.value.trim()) { setFieldError(lastName, "Apellido es obligatorio."); valid = false; }
  if (!phone.value.trim()) {
    setFieldError(phone, "Por favor, indica un teléfono.");
    valid = false;
  } else if (!isValidPhone(phone.value)) {
    setFieldError(phone, "El teléfono debe tener 9 dígitos (solo números).");
    valid = false;
  }

  if (dni.value.trim() && !isValidDniNie(dni.value)) {
    setFieldError(dni, "Formato no válido (ej., 12345678A or X1234567B).");
    valid = false;
  }

  if (email.value.trim() && !isValidEmail(email.value.trim())) {
    setFieldError(email, "Formato de email inválido (ej., name@example.com).");
    valid = false;
  }

  // BirthDate cannot be in the future
  if (birthDate.value) {
    const bd = new Date(birthDate.value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bd > today) {
      setFieldError(birthDate, "La fecha de nacimiento no puede ser futura.");
      valid = false;
    }
  }

  // Appointment date+time should not be in the past (basic coherence)
  if (date.value && time.value) {
    const appt = new Date(`${date.value}T${time.value}:00`);
    const now = new Date();
    
    if (appt < now) {
      setFieldError(time, "Appointment time cannot be in the past.");
      valid = false;
    }
  }

  return valid;
}


appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const cita = getFormData();
  saveAppointment(cita);
  renderAppointments();

  appointmentForm.reset();
  editingId.value = "";
});

/* END VALIDATION */

//EDIT MODAL
function openEditModal(id) {
  const citas = getAppointments();
  const c = citas.find(x => x.id == id);
  if (!c) return;

  // Show modal
  editModal.hidden = false;

  // Fill modal inputs
  editId.value = c.id;
  editDate.value = c.date;
  editTime.value = c.time;
  editFirstName.value = c.firstName;
  editLastName.value = c.lastName;
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

// Save changes from modal
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const citaEditada = {
    id: Number(editId.value),
    date: editDate.value,
    time: editTime.value,
    firstName: editFirstName.value,
    lastName: editLastName.value,
    phone: editPhone.value,
    email: editEmail.value,
    birthDate: editBirthDate.value,
    notes: editNotes.value
  };

  saveAppointment(citaEditada);
  console.log(getAppointments());
  renderAppointments();
  closeEditModal();
});


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
    if (label) label.textContent = ""; // or keep today date if you prefer
  }
}


/*Filter*/
let viewMode = "today"; // "today" | "all"

function applyViewMode() {
  const citas = getAppointments();
  const list = viewMode === "today"
    ? citas.filter(c => c.date === todayISO())
    : citas;

  renderAppointments(list);
  updateHeaderLabel(viewMode);

  // button active state
  showTodayBtn?.classList.toggle("is-active", viewMode === "today");
  showAllBtn?.classList.toggle("is-active", viewMode === "all");
}

showTodayBtn?.addEventListener("click", () => {
  viewMode = "today";
  applyViewMode();
});

showAllBtn?.addEventListener("click", () => {
  viewMode = "all";
  applyViewMode();
});
