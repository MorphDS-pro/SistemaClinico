import { db } from './script01-firebase.js';  
import { collection, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const searchCompanyInput = document.getElementById('searchCompany');
const searchRutInput = document.getElementById('searchRut');
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

let companiesData = [];

const getCompanies = async (companyQuery = '', rutQuery = '') => {
    const companiesRef = collection(db, "companies");

    try {
        const snapshot = await getDocs(companiesRef);
        companiesData = [];

        snapshot.forEach(doc => {
            const company = doc.data();
            const companyName = company.empresa ? company.empresa : 'Sin Nombre';
            const companyNameLower = companyName.toLowerCase();
            const rutLower = company.rut ? company.rut.toLowerCase() : '';
            const companyQueryLower = companyQuery.toLowerCase();
            const rutQueryLower = rutQuery.toLowerCase();
            const registradoPor = company.registradoPor || 'Usuario desconocido';

            if (
                (companyQuery === '' || companyNameLower.includes(companyQueryLower)) &&
                (rutQuery === '' || rutLower.includes(rutQueryLower))
            ) {
                companiesData.push({ ...company, docId: doc.id });
            }
        });

        companiesData.sort((a, b) => {
            const nameA = a.empresa || '';
            const nameB = b.empresa || '';
            return nameA.localeCompare(nameB);
        });

        totalPages = Math.ceil(companiesData.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const currentPageCompanies = companiesData.slice(startIndex, startIndex + itemsPerPage);

        tableBody.innerHTML = '';

        currentPageCompanies.forEach(company => {
            addRowToTable(company.id, company.empresa, company.rut, company.fechaCreacion, company.registradoPor, company.docId);
        });

        pageNumber.textContent = `Página ${currentPage} de ${totalPages}`;
        btnPrevious.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;

    } catch (error) {
        console.error("Error al obtener las empresas: ", error);
    }
};

function addRowToTable(id, empresa, rut, fechaCreacion, usuarioDigitado, docId) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><i class="fas fa-trash-alt delete-icon" data-id="${docId}"></i></td>
        <td>${id}</td>
        <td>${empresa}</td>
        <td>${rut}</td>
        <td>${fechaCreacion}</td>
        <td>${usuarioDigitado}</td>
    `;
    tableBody.appendChild(row);

    const deleteIcon = row.querySelector('.delete-icon');
    deleteIcon.addEventListener('click', () => showDeleteConfirmation(docId, empresa, row));
}

function showDeleteConfirmation(docId, empresa, row) {
    confirmationDeleteContainerNew.classList.remove('hidden');
    btnConfirmDeleteNew.onclick = () => deleteCompany(docId, empresa, row);
    btnCancelDeleteNew.onclick = () => confirmationDeleteContainerNew.classList.add('hidden');
}

async function deleteCompany(docId, empresa, row) {
    try {
        confirmationDeleteContainerNew.classList.add('hidden');
        showDeleteSpinner();

        const docRef = doc(db, 'companies', docId);
        await deleteDoc(docRef);

        hideDeleteSpinner();
        showMessage(messageSuccess, successText, `La empresa ${empresa} ha sido eliminada con éxito`);

        getCompanies(searchCompanyInput.value, searchRutInput.value); 

        row.remove();
    } catch (error) {
        hideDeleteSpinner();
        showMessage(messageError, errorText, `Ocurrió un error al eliminar la empresa: ${error.message}`);
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

searchCompanyInput.addEventListener('input', () => {
    const companyQuery = searchCompanyInput.value.trim();
    const rutQuery = searchRutInput.value.trim();
    currentPage = 1; 
    getCompanies(companyQuery, rutQuery); 
});

searchRutInput.addEventListener('input', () => {
    const companyQuery = searchCompanyInput.value.trim();
    const rutQuery = searchRutInput.value.trim();
    currentPage = 1; 
    getCompanies(companyQuery, rutQuery); 
});

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        getCompanies(searchCompanyInput.value, searchRutInput.value); 
    }
});

btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        getCompanies(searchCompanyInput.value, searchRutInput.value);
    }
});

window.onload = () => {
    getCompanies('', ''); 
};