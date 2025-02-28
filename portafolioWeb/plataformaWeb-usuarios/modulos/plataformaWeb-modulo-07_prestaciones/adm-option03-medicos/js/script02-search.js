import { db } from './script01-firebase.js';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const searchInput = document.getElementById('searchDoctors');
const tableBody = document.getElementById('table-body');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const pageNumber = document.getElementById('pageNumber');
let currentPage = 1;
const itemsPerPage = 20;
let totalPages = 1;

const confirmationDeleteContainerNew = document.getElementById('confirmationDeleteContainerNew');
const btnConfirmDeleteNew = document.getElementById('btnConfirmDeleteNew');
const btnCancelDeleteNew = document.getElementById('btnCancelDeleteNew');
const overlayDelete = document.getElementById('overlayDelete');
const spinnerContainerDelete = document.getElementById('spinnerContainerDelete');
const spinnerDelete = document.getElementById('spinnerDelete');
const loadingTextDelete = document.getElementById('loadingTextDelete');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const messageError = document.getElementById('messageError');
const errorText = document.getElementById('errorText');

const getDoctors = async (queryText = '') => {
    const doctorsRef = collection(db, "medicos");

    try {
        tableBody.innerHTML = '';  // Limpiar la tabla antes de cargar nuevos datos
        const snapshot = await getDocs(doctorsRef, { source: 'server' });

        const doctors = [];
        snapshot.forEach(doc => {
            const doctor = doc.data();
            const doctorNameLower = doctor.nombre.toLowerCase();
            const queryTextLower = queryText.toLowerCase();

            if (doctorNameLower.includes(queryTextLower)) {
                doctors.push({ ...doctor, docId: doc.id });
            }
        });

        if (doctors.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No se encontraron médicos.</td></tr>';
        } else {
            doctors.sort((a, b) => a.nombre.localeCompare(b.nombre));

            totalPages = Math.ceil(doctors.length / itemsPerPage);

            const startIndex = (currentPage - 1) * itemsPerPage;
            const currentPageDoctors = doctors.slice(startIndex, startIndex + itemsPerPage);

            currentPageDoctors.forEach(doctor => {
                addRowToTable(doctor.id, doctor.nombre, doctor.fechaCreacion, doctor.registradoPor, doctor.docId);
            });
        }

        pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;
        btnPrevious.disabled = currentPage === 1; 
        btnNext.disabled = currentPage === totalPages;

    } catch (error) {
        console.error("Error al obtener los médicos: ", error);
    }
};

function addRowToTable(id, nombre, fechaCreacion, registradoPor, docId) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><i class="fas fa-trash-alt delete-icon" data-id="${docId}"></i></td>
        <td>${id}</td>
        <td>${nombre}</td>
        <td>${fechaCreacion}</td>
        <td>${registradoPor}</td>
    `;
    tableBody.appendChild(row);

    const deleteIcon = row.querySelector('.delete-icon');
    deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, nombre, row));
}

function showDeleteConfirmation(docId, nombre, row) {
    confirmationDeleteContainerNew.classList.remove('hidden');
    btnConfirmDeleteNew.onclick = () => deleteDoctor(docId, nombre, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

async function deleteDoctor(docId, nombre, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showDeleteSpinner();

        const docRef = doc(db, 'medicos', docId);
        await deleteDoc(docRef);

        hideDeleteSpinner();
        showMessage(messageSuccess, successText, `El médico ${nombre} ha sido eliminado con éxito`);

        row.remove();

        // Recargar los médicos después de la eliminación
        getDoctors(searchInput.value);
    } catch (error) {
        hideDeleteSpinner();
        showMessage(messageError, errorText, `Ocurrió un error al eliminar el médico: ${error.message}`);
    }
}

function showDeleteSpinner() {
    overlayDelete.classList.remove('hidden');
    spinnerContainerDelete.classList.remove('hidden');
    spinnerDelete.classList.remove('hidden');
    loadingTextDelete.classList.remove('hidden');
}

function hideDeleteSpinner() {
    overlayDelete.classList.add('hidden');
    spinnerContainerDelete.classList.add('hidden');
    spinnerDelete.classList.add('hidden');
    loadingTextDelete.classList.add('hidden');
}

function showMessage(messageElement, textElement, message) {
    messageElement.classList.remove('hidden');
    textElement.textContent = message;
    
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

searchInput.addEventListener('input', (e) => {
    const queryText = e.target.value.trim();
    currentPage = 1; 
    getDoctors(queryText);
});

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        getDoctors(searchInput.value); 
    }
});

btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        getDoctors(searchInput.value);
    }
});

window.onload = () => {
    getDoctors(); 
};

// Función para eliminar todos los médicos de Firebase y de la tabla
const deleteAllDoctors = async () => {
    try {
        const doctorsRef = collection(db, "medicos");
        const snapshot = await getDocs(doctorsRef);
        
        if (snapshot.empty) {
            alert("No hay médicos para eliminar.");
            return;
        }

        const batch = writeBatch(db);

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        // Actualizar la tabla para reflejar que no hay médicos
        tableBody.innerHTML = '<tr><td colspan="5">No hay médicos registrados.</td></tr>';
        alert("Todos los médicos han sido eliminados.");
    } catch (error) {
        console.error("Error al eliminar todos los médicos: ", error);
        alert("Hubo un error al eliminar todos los médicos.");
    }
};

// Agregar evento al botón de eliminar todos
const deleteAllButton = document.getElementById('deleteAllButton');
