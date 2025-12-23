//ABRIR/CERRAR MENU BURGER
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});

/*COOKIES*/
//Generar ID: nº correlativo + fecha cita
function generateAppointmentId() {
  const raw = getCookie("citas");
  const citas = raw ? JSON.parse(decodeURIComponent(raw)) : [];
  return citas.length ? Math.max(...citas.map(c => Number(c.id))) + 1 : 1;
}

//Leer datos de formulario
function getFormData() {
  return {
    id: editingId.value || generateAppointmentId(),
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

//Guardar en array
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

// CRUD
// =========================
function saveAppointment(cita) {
  const citas = getAppointments();
  const index = citas.findIndex(c => c.id == cita.id);

  if (index >= 0) citas[index] = cita;
  else citas.push(cita);

  setAppointments(citas);
}

function loadAppointment(id) {
  const citas = getAppointments();
  const c = citas.find(c => c.id == id);
  if (!c) return;

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

function deleteAppointment(id) {
  const citas = getAppointments().filter(c => c.id != id);
  setAppointments(citas);
}

// =========================
// Render tabla
// =========================
function renderAppointments() {
  const tbody = document.getElementById("appointmentsTbody");
  const citas = getAppointments();

  if (!citas.length) {
    tbody.innerHTML = `<tr><td colspan="8">dato vacío</td></tr>`;
    return;
  }

  tbody.innerHTML = citas.map(c => `
    <tr data-id="${c.id}">
      <td>${String(c.id).padStart(3, "0")}</td>
      <td>${formatDateES(c.date)}</td>
      <td>${formatTime(c.time)}</td>
      <td><p>${escapeHtml(c.firstName)} ${escapeHtml(c.lastName)}</p></td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>Confirmed</td>
      <td>
        <a href="#" class="btn-edit" data-action="edit" data-id="${c.id}">Editar</a>
        <a href="#" class="btn-delete" data-action="delete" data-id="${c.id}">Eliminar</a>
      </td>
    </tr>
  `).join("");
}

function formatDateES(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${d} ${meses[m - 1]} ${y}`;
}

function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[s]
  ));
}

// =========================
// Eventos
// =========================

// Guardar formulario
appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Si ya tienes validateForm(), descomenta:
  // if (!validateForm()) return;

  const cita = getFormData();
  saveAppointment(cita);

  renderAppointments(); // <-- pinta tabla

  appointmentForm.reset();
  editingId.value = "";
});

// Click en Editar/Eliminar (delegación)
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



// Pintar al cargar página
document.addEventListener("DOMContentLoaded", renderAppointments);
/*FIN COOKIES*/

/*VALIDACIÓN CAMPOS FORMULARIO*/
function validateForm() {
  let valid = true;

  const requiredFields = [date, time, firstName, lastName, dni, phone, email, birthDate];

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add("error");
      valid = false;
    } else {
      field.classList.remove("error");
    }
  });

  if (!valid) alert("Debes rellenar todos los campos obligatorios (observaciones es opcional).");
  return valid;
}


appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return; // muestra aviso y NO borra datos

  const cita = getFormData();
  saveAppointment(cita);

  appointmentForm.reset();     // solo aquí se limpia
  editingId.value = "";
});


/*FIN VALIDACIÓN CAMPOS FORMULARIO*/

/*Ventana modal Editar*/
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
  renderAppointments();
  closeEditModal();
});
