import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  startAfter, 
  startAt, 
  limit, 
  getDocs,
  doc,
  getDoc,
  where,
  updateDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfigHistorial = {
  apiKey: "AIzaSyDlOW1-vrW4uiXrveFPoBcJ1ImZlPqzzlA",
  authDomain: "consignaciones-ee423.firebaseapp.com",
  projectId: "consignaciones-ee423",
  storageBucket: "consignaciones-ee423.firebasestorage.app",
  messagingSenderId: "992838229253",
  appId: "1:992838229253:web:38462a4886e4ede6a7ab6c",
  measurementId: "G-K58BRH151H"
};

const firebaseConfigMedicos = {
  apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
  authDomain: "prestaciones-57dcd.firebaseapp.com",
  projectId: "prestaciones-57dcd",
  storageBucket: "prestaciones-57dcd.firebasestorage.app",
  messagingSenderId: "409471759723",
  appId: "1:409471759723:web:faa6812772f44baa3ec82e",
  measurementId: "G-0CZ9BMJWMV"
};

const firebaseConfigPlanilla = {
  apiKey: "AIzaSyDRpskUwmGXFrTggbUEEwG3_-5M6Sznq9Y",
  authDomain: "corporativo-3a3f2.firebaseapp.com",
  projectId: "corporativo-3a3f2",
  storageBucket: "corporativo-3a3f2.firebasestorage.app",
  messagingSenderId: "2416210110",
  appId: "1:2416210110:web:f3321faa969bf3d6ef2eef",
  measurementId: "G-J29C5HPX5C"
};

const appHistorial = initializeApp(firebaseConfigHistorial);
const dbHistorial = getFirestore(appHistorial);
const appMedicos = initializeApp(firebaseConfigMedicos, "medicosApp");
const dbMedicos = getFirestore(appMedicos);
const appPlanilla = initializeApp(firebaseConfigPlanilla, "planillaApp");
const dbPlanilla = getFirestore(appPlanilla);

const pageSize = 10;
let currentPage = 1;
let lastVisible = null; 
let pageCursors = [];
const doctorCache = {};
let initialLoad = true;

// Función para formatear fechas a "dd-mm-yyyy"
function formatDate(dateString) {
  if (!dateString) return ""; // Si no hay fecha, devuelve vacío
  // Si la fecha incluye una marca de tiempo (ISO), tomamos solo la parte de la fecha
  const datePart = dateString.split("T")[0];
  const [year, month, day] = datePart.split("-");
  return `${day}-${month}-${year}`;
}

function showSpinner() {
  const overlay = document.getElementById("overlayLoading");
  overlay.classList.remove("hidden");
}
function hideSpinner() {
  const overlay = document.getElementById("overlayLoading");
  overlay.classList.add("hidden");
}

const tableBody = document.getElementById("table-body");
const btnPrevious = document.getElementById("btnPrevious");
const btnNext = document.getElementById("btnNext");
const pageNumberSpan = document.getElementById("pageNumber");
const historialRef = collection(dbHistorial, "historial");
const searchSurgeryDateFrom = document.getElementById("searchSurgeryDateFrom");
const searchSurgeryDateTo = document.getElementById("searchSurgeryDateTo");
const searchSurgeryDate = document.getElementById("searchSurgeryDate");

// Función auxiliar para comparar IDs numéricamente
function compareIds(idA, idB) {
  const numA = parseInt(idA, 10); // Convertir a número eliminando ceros a la izquierda
  const numB = parseInt(idB, 10);
  return numA - numB; // Orden numérico ascendente
}

async function loadPage(direction = "initial") {
  if (initialLoad) showSpinner();

  let q = query(historialRef, orderBy("incrementalId", "asc"), orderBy("surgeryDate", "asc"));

  // Aplicar filtros de fecha si están presentes
  if (searchSurgeryDateFrom.value) {
    q = query(q, where("surgeryDate", ">=", searchSurgeryDateFrom.value));
  }
  if (searchSurgeryDateTo.value) {
    q = query(q, where("surgeryDate", "<=", searchSurgeryDateTo.value));
  }
  if (searchSurgeryDate.value) {
    q = query(q, where("surgeryDate", "==", searchSurgeryDate.value));
  }

  if (direction === "next" && lastVisible) {
    q = query(q, startAfter(lastVisible), limit(pageSize));
  } else if (direction === "previous") {
    const previousCursor = pageCursors[currentPage - 1];
    if (previousCursor) {
      q = query(q, startAt(previousCursor), limit(pageSize));
    } else {
      q = query(q, limit(pageSize));
    }
  } else {
    q = query(q, limit(pageSize));
  }

  try {
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty && direction === "next") {
      console.warn("No hay más registros para mostrar.");
      currentPage--;
      return;
    }

    let docsArray = querySnapshot.docs;

    if (docsArray.length > 0) {
      pageCursors[currentPage - 1] = docsArray[0];
      lastVisible = docsArray[docsArray.length - 1];
    } else {
      lastVisible = null;
    }

    await renderTable(docsArray);

    // Calcular el total de documentos para la paginación
    let totalDocsQuery = query(historialRef);
    if (searchSurgeryDateFrom.value) {
      totalDocsQuery = query(totalDocsQuery, where("surgeryDate", ">=", searchSurgeryDateFrom.value));
    }
    if (searchSurgeryDateTo.value) {
      totalDocsQuery = query(totalDocsQuery, where("surgeryDate", "<=", searchSurgeryDateTo.value));
    }
    if (searchSurgeryDate.value) {
      totalDocsQuery = query(totalDocsQuery, where("surgeryDate", "==", searchSurgeryDate.value));
    }
    const totalDocsSnapshot = await getDocs(totalDocsQuery);
    const totalPages = Math.ceil(totalDocsSnapshot.size / pageSize);
    pageNumberSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    btnPrevious.disabled = (currentPage <= 1);
    btnNext.disabled = (docsArray.length < pageSize);

  } catch (error) {
    console.error("Error al cargar los registros:", error);
  }

  if (initialLoad) {
    hideSpinner();
    initialLoad = false;
  }
}

async function renderTable(docsArray) {
  tableBody.innerHTML = "";
  if (docsArray.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="22">No se encontraron registros.</td></tr>`;
  } else {
    // Pre-cargar nombres de médicos para esta página
    const doctorIds = [...new Set(docsArray.map(doc => doc.data().doctorId).filter(id => id && !doctorCache[id]))];
    if (doctorIds.length > 0) {
      const doctorPromises = doctorIds.map(id => 
        getDoc(doc(dbMedicos, "medicos", id)).then(docSnap => {
          if (docSnap.exists()) {
            doctorCache[id] = docSnap.data().nombre;
          }
        }).catch(error => {
          console.error(`Error al obtener médico ${id}:`, error);
          doctorCache[id] = id; // Usar ID como fallback
        })
      );
      await Promise.all(doctorPromises);
    }

    for (const docSnap of docsArray) {
      const data = docSnap.data();
      const doctorName = doctorCache[data.doctorId] || data.doctorId;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <i class="fas fa-edit edit-icon" style="cursor:pointer;" title="Editar" onclick="editRecord('${docSnap.id}')"></i>
          <i class="fas fa-trash delete-icon" style="cursor:pointer;" title="Eliminar" onclick="deleteRecord('${docSnap.id}')"></i>
        </td>
        <td>${data.incrementalId || docSnap.id}</td>
        <td>${data.admission || ""}</td>
        <td>${data.patient || ""}</td>
        <td>${doctorName}</td>
        <td>${formatDate(data.surgeryDate)}</td> <!-- Fecha Cx formateada -->
        <td>${data.company || ""}</td>
        <td>${data.code || ""}</td>
        <td>${data.description || ""}</td>
        <td>${data.quantity || ""}</td>
        <td>${data.price || ""}</td>
        <td>${data.attribute || ""}</td>
        <td>${data.status || ""}</td>
        <td>${data.type || ""}</td>
        <td>${data.oc || ""}</td>
        <td>${data.factura || ""}</td>
        <td>${data.guia || ""}</td>
        <td>
          <i class="fas fa-eye" style="cursor:pointer; color: #3498db; margin-right: 5px;" title="EditSelec" onclick="editSelecRecord('${docSnap.id}')"></i>
          ${data.documento || ""}
        </td>
        <td>
          ${
            !data.guia || data.guia === "" 
              ? "Pendiente" 
              : (parseInt(data.guia) > 1 ? "Consig.repuesta" : data.despacho || "")
          }
        </td>
        <td>${data.cadena || ""}</td>
        <td>${formatDate(data.creationDate)}</td> <!-- Fecha de creación formateada -->
        <td>${data.usuario || ""}</td>
      `;
      tableBody.appendChild(row);
    }
  }
}

async function syncWithPlanilla() {
  showSpinner();

  try {
    const planillaSnapshot = await getDocs(collection(dbPlanilla, "implantes"));
    const planillaMap = new Map();

    planillaSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const cadena = `${data.ID_PACIENTE || ""}${data.CODIGO_CLINICA || ""}`;
      if (cadena) {
        planillaMap.set(cadena, {
          oc: data.OC || "",
          guia: data.NUMERO_GUIA || "", 
          factura: data.NUMERO_FACTURA || ""
        });
      }
    });

    const historialSnapshot = await getDocs(collection(dbHistorial, "historial"));
    const batch = writeBatch(dbHistorial);
    let updatesCount = 0;

    historialSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const cadena = `${data.admission || ""}${data.code || ""}`;
      const planillaData = planillaMap.get(cadena);

      if (planillaData && (data.oc !== planillaData.oc || data.guia !== planillaData.guia || data.factura !== planillaData.factura)) {
        const docRef = doc(dbHistorial, "historial", docSnap.id);
        batch.update(docRef, {
          oc: planillaData.oc,
          guia: data.guia,
          factura: planillaData.factura 
        });
        updatesCount++;
      }
    });

    if (updatesCount > 0) {
      await batch.commit();
      showMessage("success", `Se actualizaron ${updatesCount} registros con datos de Planilla.`);
    } else {
      showMessage("info", "No se encontraron coincidencias para actualizar.");
    }

    await loadPage();

  } catch (error) {
    console.error("Error al sincronizar con Planilla:", error);
    showMessage("error", "Ocurrió un error al sincronizar los datos.");
  } finally {
    hideSpinner();
  }
}

function showMessage(type, text) {
  const messageContainer = document.getElementById(`message${type.charAt(0).toUpperCase() + type.slice(1)}`);
  const textElement = document.getElementById(`${type}Text`);
  textElement.textContent = text;
  messageContainer.classList.remove("hidden");
  setTimeout(() => messageContainer.classList.add("hidden"), 5000);
}

window.toggleFilter = function(columnIndex) {
  const filterInput = document.getElementsByClassName("filter-input")[columnIndex];
  if (filterInput) {
    filterInput.classList.toggle("hidden");
    if (!filterInput.classList.contains("hidden")) {
      filterInput.focus();
    }
  } else {
    console.error(`No se encontró el input para la columna ${columnIndex}`);
  }
};

window.filterTable = async function(columnIndex) {
  const filterValue = document.getElementsByClassName("filter-input")[columnIndex].value.trim().toLowerCase();

  let q = query(historialRef, orderBy("incrementalId", "asc"), orderBy("surgeryDate", "asc"));
  if (searchSurgeryDateFrom.value) {
    q = query(q, where("surgeryDate", ">=", searchSurgeryDateFrom.value));
  }
  if (searchSurgeryDateTo.value) {
    q = query(q, where("surgeryDate", "<=", searchSurgeryDateTo.value));
  }
  if (searchSurgeryDate.value) {
    q = query(q, where("surgeryDate", "==", searchSurgeryDate.value));
  }

  const querySnapshot = await getDocs(q);
  let filteredDocs = querySnapshot.docs;

  if (filterValue) {
    filteredDocs = filteredDocs.filter(docSnap => {
      const data = docSnap.data();
      const values = [
        "", // Acción (no filtrable)
        data.incrementalId || docSnap.id,
        data.admission || "",
        data.patient || "",
        doctorCache[data.doctorId] || data.doctorId,
        formatDate(data.surgeryDate) || "", // Usar formato "dd-mm-yyyy" en filtros
        data.company || "",
        data.code || "",
        data.description || "",
        data.quantity || "",
        data.price || "",
        data.attribute || "",
        data.status || "",
        data.type || "",
        data.oc || "",
        data.factura || "",
        data.guia || "",
        data.documento || "",
        !data.guia || data.guia === "" ? "Pendiente" : (parseInt(data.guia) > 1 ? "Consig.repuesta" : data.despacho || ""),
        data.cadena || "",
        formatDate(data.creationDate) || "", // Usar formato "dd-mm-yyyy" en filtros
        data.usuario || ""
      ];
      return values[columnIndex].toString().toLowerCase().includes(filterValue);
    });
  }

  // Ordenar por incrementalId numéricamente y luego por surgeryDate
  filteredDocs.sort((a, b) => {
    const dataA = a.data();
    const dataB = b.data();
    const idA = dataA.incrementalId || a.id;
    const idB = dataB.incrementalId || b.id;
    const idCompare = compareIds(idA, idB);
    if (idCompare !== 0) return idCompare;
    return dataA.surgeryDate.localeCompare(dataB.surgeryDate);
  });

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const docsPage = filteredDocs.slice(startIndex, endIndex);
  await renderTable(docsPage);

  const totalPages = Math.ceil(filteredDocs.length / pageSize);
  pageNumberSpan.textContent = `Página ${currentPage} de ${totalPages}`;
  btnPrevious.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= totalPages;
};

btnNext.addEventListener("click", async () => {
  currentPage++;
  await loadPage("next");
});

btnPrevious.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    await loadPage("previous");
  }
});

window.editRecord = function(id) {};
window.deleteRecord = function(id) {};

let currentEditId = null;

window.editSelecRecord = async function(id) {
  currentEditId = id;

  const modalOverlay = document.getElementById("modalOverlayDocumento");
  const editModalDocumentoDiv = document.getElementById("editModalDocumentoInputDiv");
  modalOverlay.style.display = "block"; 
  editModalDocumentoDiv.style.display = "flex"; 

  const editModalDocumentoInput = document.getElementById("editModalDocumentoInput");
  editModalDocumentoInput.value = "";

  try {
    const docRef = doc(dbHistorial, "historial", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      editModalDocumentoInput.value = data.documento || ""; 
    }
  } catch (error) {
    console.error("Error al obtener el documento:", error);
    showMessage("error", "No se pudo cargar el documento actual.");
  }
};

document.getElementById("btnAgregarDocumento").addEventListener("click", async () => {
  if (!currentEditId) {
    showMessage("error", "No se ha seleccionado ningún registro para editar.");
    return;
  }

  const editModalDocumentoInput = document.getElementById("editModalDocumentoInput").value.trim();
  if (!editModalDocumentoInput) {
    showMessage("warning", "Por favor, ingrese un número de documento.");
    return;
  }

  try {
    const docRef = doc(dbHistorial, "historial", currentEditId);

    await updateDoc(docRef, {
      documento: editModalDocumentoInput
    });

    showMessage("success", "Documento guardado correctamente.");

    const modalOverlay = document.getElementById("modalOverlayDocumento");
    const editModalDocumentoDiv = document.getElementById("editModalDocumentoInputDiv");
    modalOverlay.style.display = "none";
    editModalDocumentoDiv.style.display = "none";

    await loadPage();

  } catch (error) {
    console.error("Error al guardar el documento:", error);
    showMessage("error", "Ocurrió un error al guardar el documento.");
  }
});

document.addEventListener("DOMContentLoaded", function() {
  const modalOverlay = document.getElementById("modalOverlayDocumento");
  const editModalDocumentoDiv = document.getElementById("editModalDocumentoInputDiv");
  modalOverlay.style.display = "none"; 
  editModalDocumentoDiv.style.display = "none"; 

  modalOverlay.addEventListener("click", function(event) {
    modalOverlay.style.display = "none";
    editModalDocumentoDiv.style.display = "none";
  });

  editModalDocumentoDiv.addEventListener("click", function(event) {
    event.stopPropagation();
  });

  document.getElementById("btnSync").addEventListener("click", syncWithPlanilla);

  [searchSurgeryDateFrom, searchSurgeryDateTo, searchSurgeryDate].forEach(input => {
    input.addEventListener("change", () => {
      currentPage = 1;
      pageCursors = [];
      lastVisible = null;
      initialLoad = true;
      loadPage();
    });
  });
});



document.addEventListener("DOMContentLoaded", function() {
  // Seleccionar todos los inputs de tipo date con la clase date-input
  const dateInputs = document.querySelectorAll(".date-input");

  dateInputs.forEach(input => {
      input.addEventListener("click", function() {
          // Intentar usar showPicker() (disponible en navegadores modernos)
          if (typeof input.showPicker === "function") {
              input.showPicker();
          } else {
              // Fallback para navegadores que no soportan showPicker()
              input.focus(); // Poner foco en el input
              input.click(); // Simular un clic adicional
          }
      });

      // Opcional: Evitar que el teclado aparezca en dispositivos móviles
      input.addEventListener("keydown", function(e) {
          e.preventDefault(); // Prevenir entrada manual para forzar uso del calendario
          if (typeof input.showPicker === "function") {
              input.showPicker();
          }
      });
  });
});

loadPage();