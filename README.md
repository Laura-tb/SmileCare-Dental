# SmileCare Dental – Gestión de Citas

## 1. Descripción del proyecto

Este proyecto consiste en el desarrollo de una **aplicación web de gestión de citas** para clínicas dentales franquiciadas.
La aplicación está pensada para ser utilizada **exclusivamente en los ordenadores de cada sede**, de forma que las citas de una clínica no se compartan con las de otras sedes.

Para cumplir este requisito, los datos se almacenan como cookies en el navegador, sin utilizar ninguna base de datos externa ni local.

---

## 2. Tecnologías utilizadas

- **HTML5**: estructura de la interfaz.
- **CSS3**: estilos y maquetación.
- **JavaScript (Vanilla JS)**: lógica de la aplicación, validación, gestión de eventos y almacenamiento.
- **Cookies del navegador**: persistencia de datos por sede.

No se utiliza ningún framework ni librería externa para la lógica del proyecto.

---

## 3. Estructura de la interfaz

La aplicación se compone de las siguientes secciones:

### 3.1 Cabecera
- Logo de la clínica **SmileCare Dental**.
- Menú de navegación adaptado a dispositivos móviles mediante un **menú hamburguesa accesible**.

---

### 3.2 Formulario de creación de citas

Formulario que permite introducir los datos de una cita:

- Fecha y hora de la cita.
- Datos del paciente:
  - Nombre  
  - Apellidos  
  - DNI/NIE  
  - Teléfono  
  - Email  
  - Fecha de nacimiento  
- Observaciones adicionales.

El formulario incluye:
- Validación de campos obligatorios.
- Mensajes de error visibles junto a cada campo.
- Conservación de los datos introducidos si la validación falla.

---

### 3.3 Tabla de citas

Tabla que muestra las citas almacenadas en el navegador:

- El **identificador interno no se muestra al usuario**.
- Se muestra una columna de **orden (#)** que indica la posición de la cita en la tabla.
- Botones de acción por fila: Editar y Eliminar.

La tabla permite:
- Mostrar solo las citas del día actual.
- Mostrar todas las citas guardadas.

---

### 3.4 Modal de edición

La modificación de una cita se realiza mediante un **formulario modal**, donde se cargan los datos de la cita seleccionada desde las cookies y se permite su edición.

---

### 3.5 Pie de página

Incluye:
- Datos de contacto de la clínica.
- Información corporativa.

---

## 4. Gestión y almacenamiento de datos

### 4.1 Almacenamiento local

Las citas se almacenan en **cookies del navegador**, cumpliendo el requisito de no utilizar ninguna base de datos.

Cada sede trabaja de forma independiente, ya que los datos quedan guardados únicamente en el navegador del ordenador utilizado.

---

### 4.2 Identificador único

Cada cita se identifica internamente mediante un **identificador único basado en el instante de creación**, utilizando un timestamp. Este identificador es único, no se muestra al usuario y se utiliza para editar y eliminar citas.

---

## 5. Validación de datos

Antes de guardar una cita, se realiza una validación completa de los campos.

### Campos obligatorios
- Fecha  
- Hora  
- Nombre  
- Apellidos  
- DNI/NIE  
- Teléfono  
- Email  
- Fecha de nacimiento  

### Reglas de validación
- Teléfono: solo números, 9 dígitos.
- DNI/NIE: formato válido.
- Email: formato correcto.
- Fecha de nacimiento: no puede ser futura.
- Fecha y hora de la cita: no puede ser anterior al momento actual.

Si existe algún error:
- No se crea la cita.
- Se resaltan los campos erróneos.
- Se muestra un mensaje de error específico.
- Los datos introducidos no se pierden.

---

## 6. Funcionalidades principales

### 6.1 Crear cita
- Se validan los datos.
- Se crea un objeto **Cita**.
- Se guarda en cookies.
- Se actualiza la tabla automáticamente.

---

### 6.2 Mostrar citas

Al cargar la aplicación:
- Si no hay citas, se muestra una fila con el texto **“dato vacío”**.
- Si existen citas, se muestran automáticamente.

Se puede alternar entre:
- Citas de hoy.
- Todas las citas.

---

### 6.3 Editar cita
- Se selecciona una cita desde la tabla.
- Se cargan sus datos desde cookies en un formulario modal.
- Al guardar:
  - Se actualizan los datos en cookies.
  - Se refresca la tabla sin recargar la página.

---

### 6.4 Eliminar cita
- Se solicita confirmación al usuario.
- Se elimina la cita de cookies.
- La tabla se actualiza automáticamente.
- Si no quedan citas, se vuelve a mostrar la fila **“dato vacío”**.

---

## 7. Accesibilidad
- Uso de etiquetas HTML semánticas.
- Campos de formulario asociados correctamente a etiquetas `<label>`.
- Mensajes de error accesibles mediante `aria-live`.
- Botones y navegación con atributos ARIA en el menú hamburguesa.

---

## 8. Conclusión

Este proyecto permite aplicar de forma práctica los conocimientos adquiridos en:
- Manipulación del DOM con JavaScript.
- Validación de formularios.
- Persistencia de datos en el navegador.
- Gestión de eventos y renderizado dinámico.
- Buenas prácticas de accesibilidad y experiencia de usuario.

La aplicación cumple los requisitos planteados y ofrece una solución funcional y clara para la gestión de citas en clínicas dentales.

