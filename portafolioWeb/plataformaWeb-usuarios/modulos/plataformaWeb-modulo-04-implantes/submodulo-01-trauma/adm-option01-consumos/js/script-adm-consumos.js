import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js'; 
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  deleteDoc, doc, updateDoc, getDoc, getDocs 
} from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';

export const firebaseConfigUsers = {
    apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
    authDomain: "prestaciones-57dcd.firebaseapp.com",
    projectId: "prestaciones-57dcd",
    storageBucket: "prestaciones-57dcd.firebasestorage.app",
    messagingSenderId: "409471759723",
    appId: "1:409471759723:web:faa6812772f44baa3ec82e",
    measurementId: "G-0CZ9BMJWMV"
};
  
export const firebaseConfigConsignaciones = {
    apiKey: "AIzaSyDlOW1-vrW4uiXrveFPoBcJ1ImZlPqzzlA",
    authDomain: "consignaciones-ee423.firebaseapp.com",
    projectId: "consignaciones-ee423",
    storageBucket: "consignaciones-ee423.firebasestorage.app",
    messagingSenderId: "992838229253",
    appId: "1:992838229253:web:38462a4886e4ede6a7ab6c",
    measurementId: "G-K58BRH151H"
};
  
let appUsers;
if (!getApps().some(app => app.name === 'usersApp')) {
  appUsers = initializeApp(firebaseConfigUsers, 'usersApp');
} else {
  appUsers = getApps().find(app => app.name === 'usersApp');
}
const dbUsers = getFirestore(appUsers);
const authUsers = getAuth(appUsers);
  
let appConsignaciones;
if (!getApps().some(app => app.name === 'consignacionesApp')) {
  appConsignaciones = initializeApp(firebaseConfigConsignaciones, 'consignacionesApp');
} else {
  appConsignaciones = getApps().find(app => app.name === 'consignacionesApp');
}
const dbConsignaciones = getFirestore(appConsignaciones);

// Función para formatear fechas a "dd-mm-yyyy"
function formatDate(dateString) {
  if (!dateString) return ""; // Si no hay fecha, devuelve vacío
  // Si la fecha incluye una marca de tiempo (ISO), tomamos solo la parte de la fecha
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${day}-${month}-${year}`;
}

async function guardarIngreso(event) {
  event.preventDefault();

  document.getElementById('overlayRegister').classList.remove('hidden');

  const usuario = document.getElementById('registerUsuario').textContent.trim();
  const admission = document.getElementById('registerAdmission').value;
  const patient = document.getElementById('registerPatient').value;
  const doctorSelect = document.getElementById('registerDoctor');
  const doctorId = doctorSelect.value;
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex].text;
  const surgeryDate = document.getElementById('registerSurgeryDate').value;
  const description = document.getElementById('registerDescriptionInput').value;
  const quantity = document.getElementById('registerQuantity').value;
  const company = document.getElementById('registerCompany').value;
  const code = document.getElementById('registerCode').value;
  const price = document.getElementById('registerPrice').value;
  const attribute = document.getElementById('registerAttribute').value;
  const status = document.getElementById('registerStatus').value;
  const type = document.getElementById('registerType').value;
  const creationDate = new Date().toISOString().split("T")[0]; // Solo la fecha en "yyyy-mm-dd"

  try {
      const ingresosCollection = collection(dbConsignaciones, 'ingresos');
      await addDoc(ingresosCollection, {
          usuario,
          admission,
          patient,
          doctorId,
          nombre: doctorName,
          surgeryDate, // Guardamos como "yyyy-mm-dd" (formato nativo del input)
          description,
          quantity,
          company,
          code,
          price,
          attribute,
          status,
          type,
          creationDate // Guardamos como "yyyy-mm-dd"
      });

      document.getElementById('overlayRegister').classList.add('hidden');
      document.getElementById('successText').innerHTML = `Se ha registrado con éxito el paciente <strong>${patient}</strong> con el código <strong>${code}</strong> y la descripción <strong>${description}</strong>.`;
      document.getElementById('messageSuccess').classList.remove('hidden');

      setTimeout(() => {
          document.getElementById('messageSuccess').classList.add('hidden');
      }, 6000);

      document.getElementById('registerDescriptionInput').value = '';
      document.getElementById('registerQuantity').value = '';
      document.getElementById('registerCompany').value = '';
      document.getElementById('registerCode').value = '';
      document.getElementById('registerPrice').value = '';
  } catch (error) {
      console.error("Error al guardar el ingreso:", error);

      document.getElementById('overlayRegister').classList.add('hidden');
      document.getElementById('errorText').innerHTML = `Error al registrar el ingreso: ${error.message}`;
      document.getElementById('messageError').classList.remove('hidden');

      setTimeout(() => {
          document.getElementById('messageError').classList.add('hidden');
      }, 6000);
  }
}

document.getElementById('closeMessageSuccess').addEventListener('click', () => {
  document.getElementById('messageSuccess').classList.add('hidden');
});
document.getElementById('closeMessageError').addEventListener('click', () => {
  document.getElementById('messageError').classList.add('hidden');
});

const btnSave = document.getElementById('btnSave');
btnSave.addEventListener('click', guardarIngreso);

const tableBody = document.getElementById('table-body');
const ingresosCollection = collection(dbConsignaciones, 'ingresos');
onSnapshot(ingresosCollection, (snapshot) => {
  tableBody.innerHTML = ''; 
  snapshot.forEach((doc) => {
    const ingreso = doc.data();
    const docId = doc.id;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <i class="fas fa-trash-alt delete-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
        <i class="fas fa-edit edit-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
      </td>
      <td>${ingreso.admission}</td>
      <td>${ingreso.patient}</td>
      <td>${ingreso.nombre}</td>
      <td>${formatDate(ingreso.surgeryDate)}</td> <!-- Fecha Cx formateada -->
      <td>${ingreso.company}</td>
      <td>${ingreso.code}</td>
      <td>${ingreso.description}</td>
      <td>${ingreso.quantity}</td>
      <td>${ingreso.price}</td>
      <td>${ingreso.attribute}</td>
      <td>${ingreso.status}</td>
      <td>${ingreso.type}</td>
      <td>${formatDate(ingreso.creationDate)}</td> <!-- Fecha de creación formateada -->
      <td>${ingreso.usuario}</td>
    `;
    tableBody.appendChild(row);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("table-body");
  const db = dbConsignaciones;
  let deleteId = null;
  let currentDocId = null; 

  tableBody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-icon")) {
      deleteId = event.target.getAttribute("data-id");
      document.getElementById("confirmationDeleteContainerNew").classList.remove("hidden");
    }
  });

  document.getElementById("btnConfirmDeleteNew").addEventListener("click", async () => {
    if (deleteId) {
      document.getElementById("confirmationDeleteContainerNew").classList.add("hidden");
      document.getElementById("overlayDelete").classList.remove("hidden");

      try {
        await deleteDoc(doc(db, "ingresos", deleteId));
        document.getElementById("overlayDelete").classList.add("hidden");
        document.getElementById("messageSuccess").classList.remove("hidden");
        document.getElementById("successText").innerText = `Se ha eliminado el registro ${deleteId}`;
      } catch (error) {
        document.getElementById("overlayDelete").classList.add("hidden");
        document.getElementById("messageError").classList.remove("hidden");
        document.getElementById("errorText").innerText = `Error al eliminar: ${error.message}`;
      }
    }
  });

  document.getElementById("btnCancelDeleteNew").addEventListener("click", () => {
    document.getElementById("confirmationDeleteContainerNew").classList.add("hidden");
  });

  tableBody.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-icon")) {
      const docId = event.target.getAttribute("data-id");
      currentDocId = docId; 

      try {
        const docSnap = await getDoc(doc(db, "ingresos", docId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          document.getElementById("editModalTitle").innerText = `Editar: ${data.code}`;
          document.getElementById("editModalAdmisionInput").value = data.admission || "";
          document.getElementById("editModalPacienteInput").value = data.patient || "";
          document.getElementById("editModalCantInput").value = data.quantity || "";
          document.getElementById("editModal").classList.add("visible");
          document.getElementById("editModalOverlay").classList.add("visible");
          document.getElementById("saveChangesButton").onclick = async () => {
            const updatedData = {
              admission: document.getElementById("editModalAdmisionInput").value,
              patient: document.getElementById("editModalPacienteInput").value,
              quantity: document.getElementById("editModalCantInput").value
            };

            try {
              await updateDoc(doc(db, "ingresos", currentDocId), updatedData);
              document.getElementById("editModal").classList.remove("visible");
              document.getElementById("editModalOverlay").classList.remove("visible");
              document.getElementById("messageSuccess").classList.remove("hidden");
              document.getElementById("successText").innerText = `Se ha actualizado el registro ${currentDocId}`;
            } catch (error) {
              document.getElementById("messageError").classList.remove("hidden");
              document.getElementById("errorText").innerText = `Error al actualizar: ${error.message}`;
            }
          };
        }
      } catch (error) {
        document.getElementById("messageError").classList.remove("hidden");
        document.getElementById("errorText").innerText = `Error al obtener datos: ${error.message}`;
      }
    }
  });

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.add("hidden");
    });
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('registerAdmission').value = '';
    document.getElementById('registerPatient').value = '';
    document.getElementById('registerDoctor').selectedIndex = 0; 
    document.getElementById('registerSurgeryDate').value = '';
    document.getElementById('registerDescriptionInput').value = '';
    document.getElementById('registerQuantity').value = '';
    document.getElementById('registerCompany').value = '';
    document.getElementById('registerCode').value = '';
    document.getElementById('registerPrice').value = '';
  });

  onSnapshot(collection(db, "ingresos"), (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const row = `
        <tr>
          <td>
            <i class="fas fa-trash-alt delete-icon" data-id="${docSnap.id}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
            <i class="fas fa-edit edit-icon" data-id="${docSnap.id}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
          </td>
          <td>${data.admission}</td>
          <td>${data.patient}</td>
          <td>${data.nombre}</td>
          <td>${formatDate(data.surgeryDate)}</td> <!-- Fecha Cx formateada -->
          <td>${data.company}</td>
          <td>${data.code}</td>
          <td>${data.description}</td>
          <td>${data.quantity}</td>
          <td>${data.price}</td>
          <td>${data.attribute}</td>
          <td>${data.status}</td>
          <td>${data.type}</td>
          <td>${formatDate(data.creationDate)}</td> <!-- Fecha de creación formateada -->
          <td>${data.usuario}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  });
});

async function obtenerSiguienteIdHistorial() {
  const historialCollection = collection(dbConsignaciones, "historial");
  const snapshot = await getDocs(historialCollection);

  let maxId = 250000;

  snapshot.forEach(doc => {
      const data = doc.data();
      if (data.incrementalId) {
          const numId = parseInt(data.incrementalId, 10);
          if (!isNaN(numId) && numId > maxId) {
              maxId = numId;
          }
      }
  });

  const siguienteId = (maxId + 1).toString();
  return siguienteId;
}

async function traspasarIngresosAHistorial() {
  document.getElementById('overlayImport').classList.remove('hidden');

  try {
      const ingresosCollection = collection(dbConsignaciones, "ingresos");
      const snapshot = await getDocs(ingresosCollection);

      if (snapshot.empty) {
          alert("No hay datos para traspasar.");
          document.getElementById('overlayImport').classList.add('hidden');
          return;
      }

      for (const docSnap of snapshot.docs) {
          const ingreso = docSnap.data();
          const nuevoId = await obtenerSiguienteIdHistorial();

          const cadena = String(ingreso.admission) + String(ingreso.code);

          await addDoc(collection(dbConsignaciones, "historial"), {
              ...ingreso,
              incrementalId: nuevoId,
              orden_de_compra: "",
              guia: "",
              factura: "",
              cadena: cadena
          });

          await deleteDoc(doc(dbConsignaciones, "ingresos", docSnap.id));
      }

      document.getElementById('overlayImport').classList.add('hidden');
      document.getElementById('successText').innerHTML = "Traspaso realizado con éxito.";
      document.getElementById('messageSuccess').classList.remove('hidden');

      setTimeout(() => {
          document.getElementById('messageSuccess').classList.add('hidden');
      }, 6000);
  } catch (error) {
      console.error("Error al traspasar ingresos:", error);

      document.getElementById('overlayImport').classList.add('hidden');
      document.getElementById('errorText').innerHTML = `Error en el traspaso: ${error.message}`;
      document.getElementById('messageError').classList.remove('hidden');

      setTimeout(() => {
          document.getElementById('messageError').classList.add('hidden');
      }, 6000);
  }
}

document.getElementById('saveButton').addEventListener('click', traspasarIngresosAHistorial);