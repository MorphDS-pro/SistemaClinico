import { db, auth } from './script01-firebase.js';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { deleteDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { initializeLogEvents } from './script13-infoLog.js';

// Variables y elementos del DOM
const formRegister = document.getElementById('formRegisterContainer');
const registerUsuario = document.getElementById('registerUsuario');
const registerReference = document.getElementById('registerReference');
const registerDetails = document.getElementById('registerDetails');
const registerPriceNet = document.getElementById('registerPriceNet');
const registerCode = document.getElementById('registerCode');
const registerCompany = document.getElementById('registerCompany');
const registerClassification = document.getElementById('registerClassification');
const registerDescription = document.getElementById('registerDescription');
const registerStatus = document.getElementsByName('status');
const overlayRegister = document.getElementById('overlayRegister');
const messageSuccess = document.getElementById('messageSuccess');
const successText = document.getElementById('successText');
const closeMessageSuccess = document.getElementById('closeMessageSuccess');
const tableBody = document.getElementById('table-body');
const pendientesTableBody = document.getElementById('pendientesTableBody');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const saveChangesButton = document.getElementById('saveChangesButton');
const editModalTitle = document.getElementById('editModalTitle');
const editModalCodeValue = document.getElementById('editModalCodeValue');
const editModalDescriptionValue = document.getElementById('editModalDescriptionValue');
const editModalProviderName = document.getElementById('editModalProviderName');
const editModalCodeInput = document.getElementById('editModalCodeInput');
const editModalPriceInput = document.getElementById('editModalPriceInput');
const editStatusActive = document.getElementById('editStatusActive');
const editStatusInactive = document.getElementById('editStatusInactive');
const editModalOverlay = document.getElementById('editModalOverlay'); 
const confirmationContainer = document.getElementById('confirmationDeleteContainerNew');
const overlayDelete = document.getElementById('overlayDelete');
const spinnerDelete = document.getElementById('spinnerDelete');
const loadingTextDelete = document.getElementById('loadingTextDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDeleteNew');
const btnCancelDelete = document.getElementById('btnCancelDeleteNew');
const closeConfirmation = document.getElementById('closeConfirmationDeleteNew');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const pageNumberSpan = document.getElementById('pageNumber');
const codigosTable = document.getElementById('codigosTable');
const pendientesTable = document.getElementById('pendientesTable');
const tabCodigos = document.getElementById('tabCodigos');
const tabPendientes = document.getElementById('tabPendientes');

let allCodigos = [];
let allPendientes = [];
let currentPage = 1;
const pageSize = 20;
let currentTab = 'codigos';

onAuthStateChanged(auth, (user) => {
    if (user) {
        registerUsuario.textContent = user.email;
    }
});

tabCodigos.addEventListener('click', () => {
    codigosTable.style.display = 'block';
    pendientesTable.style.display = 'none';
    currentTab = 'codigos';
    currentPage = 1;
    renderPage();

    tabCodigos.classList.add('active-tab');
    tabPendientes.classList.remove('active-tab');
});

tabPendientes.addEventListener('click', () => {
    pendientesTable.style.display = 'block';
    codigosTable.style.display = 'none';
    currentTab = 'pendientes';
    currentPage = 1;
    renderPage();

    tabPendientes.classList.add('active-tab');
    tabCodigos.classList.remove('active-tab');
});

async function displayData() {
    document.getElementById('overlayLoading').classList.remove('hidden');

    const codigosRef = collection(db, 'codigos');
    const querySnapshot = await getDocs(codigosRef);

    allCodigos = [];
    allPendientes = [];
    tableBody.innerHTML = '';
    pendientesTableBody.innerHTML = '';

    querySnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (parseInt(data.codigo) > 1) {
            allCodigos.push({ docId: docSnapshot.id, data });
        } else {
            allPendientes.push({ docId: docSnapshot.id, data });
        }
    });

    allCodigos.sort((a, b) => parseInt(a.data.id) - parseInt(b.data.id));
    allPendientes.sort((a, b) => parseInt(a.data.id) - parseInt(b.data.id));

    currentPage = 1;
    renderPage();

    document.getElementById('overlayLoading').classList.add('hidden');
}

function applyFilters(dataArray) {
    const companyFilter = document.getElementById('searchCompany').value.trim().toLowerCase();
    const referenceFilter = document.getElementById('searchReference').value.trim().toLowerCase();
    const detailsFilter = document.getElementById('searchDetails').value.trim().toLowerCase();
    const codeFilter = document.getElementById('searchCode').value.trim().toLowerCase();

    return dataArray.filter(item => {
        const data = item.data;
        const companyName = ((data.proveedor && data.proveedor.nombre) || data.empresa || "").toLowerCase();
        const referencia = (data.referencia || "").toLowerCase();
        const detalles = (data.detalles || "").toLowerCase();
        const codigo = (data.codigo || "").toLowerCase();

        return (
            (!companyFilter || companyName.includes(companyFilter)) &&
            (!referenceFilter || referencia.includes(referenceFilter)) &&
            (!detailsFilter || detalles.includes(detailsFilter)) &&
            (!codeFilter || codigo.includes(codeFilter))
        );
    });
}

function renderPage() {
    if (currentTab === 'codigos') {
        const filteredData = applyFilters(allCodigos);
        const totalRecords = filteredData.length;
        const totalPages = Math.ceil(totalRecords / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const pageRecords = filteredData.slice(start, start + pageSize);
        tableBody.innerHTML = '';
        pageRecords.forEach(item => {
            const { docId, data } = item;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <i class="fas fa-trash-alt delete-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
                    <i class="fas fa-edit edit-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
                    <i class="fas fa-info-circle info-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #3498db;"></i>
                </td>
                <td>${data.id}</td>
                <td>${data.referencia}</td>
                <td>${data.detalles}</td>
                <td>${data.precioNeto}</td>
                <td>${data.codigo}</td>
                <td>${(data.proveedor && data.proveedor.nombre) || data.empresa || 'Proveedor no disponible'}</td>
                <td>${data.descripcion}</td>
                <td>${data.precio}</td>
                <td>${data.clasificacion}</td>
                <td>${data.estado}</td>
                <td>${data.fechaRegistro}</td>
                <td>${data.usuario}</td>
            `;
            tableBody.appendChild(row);
        });
        pageNumberSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    } else if (currentTab === 'pendientes') {
        const filteredData = applyFilters(allPendientes);
        const totalRecords = filteredData.length;
        const totalPages = Math.ceil(totalRecords / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const pageRecords = filteredData.slice(start, start + pageSize);
        pendientesTableBody.innerHTML = '';
        pageRecords.forEach(item => {
            const { docId, data } = item;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <i class="fas fa-trash-alt delete-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #e74c3c;"></i>
                    <i class="fas fa-edit edit-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #4CAF50;"></i>
                    <i class="fas fa-info-circle info-icon" data-id="${docId}" style="margin-right: 10px; cursor: pointer; color: #3498db;"></i>
                </td>
                <td>${data.id}</td>
                <td>${data.referencia}</td>
                <td>${data.detalles}</td>
                <td>${data.precioNeto}</td>
                <td>${data.codigo}</td>
                <td>${(data.proveedor && data.proveedor.nombre) || data.empresa || 'Proveedor no disponible'}</td>
                <td>${data.descripcion}</td>
                <td>${data.precio}</td>
                <td>${data.clasificacion}</td>
                <td>${data.estado}</td>
                <td>${data.fechaRegistro}</td>
                <td>${data.usuario}</td>
            `;
            pendientesTableBody.appendChild(row);
        });
        pageNumberSpan.textContent = `Página ${currentPage} de ${totalPages}`;
    }

    attachRowEvents();
}

document.getElementById('searchCompany').addEventListener('input', () => {
    currentPage = 1;
    renderPage();
});
document.getElementById('searchReference').addEventListener('input', () => {
    currentPage = 1;
    renderPage();
});
document.getElementById('searchDetails').addEventListener('input', () => {
    currentPage = 1;
    renderPage();
});
document.getElementById('searchCode').addEventListener('input', () => {
    currentPage = 1;
    renderPage();
});

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
});

btnNext.addEventListener('click', () => {
    const totalRecords = currentTab === 'codigos' ? allCodigos.length : allPendientes.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage();
    }
});

function attachRowEvents() {

    const editIcons = document.querySelectorAll('.edit-icon');
    editIcons.forEach(icon => {
        icon.addEventListener('click', async (e) => {
            const docId = e.target.getAttribute('data-id');
            const docRef = doc(db, 'codigos', docId);
            const docSnap = await getDoc(docRef);
    
            if (docSnap.exists()) {
                const data = docSnap.data();
                editModalTitle.textContent = data.clasificacion;
                editModalCodeValue.textContent = data.codigo || 'Sin código';
                editModalDescriptionValue.textContent = data.descripcion || 'Sin descripción';
                editModalProviderName.textContent = (data.proveedor && data.proveedor.nombre) || data.empresa || 'Proveedor desconocido';
                editModalCodeInput.value = data.codigo || '';
                editModalPriceInput.value = data.precio || '';   
                editStatusActive.checked = false;
                editStatusInactive.checked = false;
                if (data.estado && data.estado.trim().toLowerCase() === 'activo') {
                    editStatusActive.checked = true;
                } else {
                    editStatusInactive.checked = true;
                }    
                editModal.classList.add('visible');
                editModalOverlay.classList.add('visible');
    
                saveChangesButton.replaceWith(saveChangesButton.cloneNode(true));
                const newSaveChangesButton = document.getElementById('saveChangesButton');
    
                newSaveChangesButton.addEventListener('click', async () => {
                    document.getElementById('overlayImport').classList.remove('hidden');
    
                    const updatedData = {
                        codigo: editModalCodeInput.value,
                        precio: editModalPriceInput.value,
                        precioNeto: editModalPriceInput.value, 
                        estado: editStatusActive.checked ? 'activo' : 'inactivo',
                    };
    
                    try {
                        await updateDoc(docRef, updatedData);
                        
                        const messageSuccess = document.getElementById('messageSuccess');
                        const successText = document.getElementById('successText');
                        successText.textContent = `¡Modificación exitosa! El código se ha modificado a ${editModalCodeInput.value} y el precio a ${editModalPriceInput.value}`;
                        messageSuccess.classList.remove('hidden');
                    
                        setTimeout(() => {
                            messageSuccess.classList.add('hidden');
                        }, 5000);
                    
                        document.getElementById('overlayImport').classList.add('hidden');
                        editModal.classList.remove('visible');
                        editModalOverlay.classList.remove('visible');
                    
                        displayData();
                    } catch (error) {
                        console.error("Error actualizando el código: ", error);
                    
                        const messageError = document.getElementById('messageError');
                        const errorText = document.getElementById('errorText');
                        errorText.textContent = 'Hubo un error al modificar el código.';
                        messageError.classList.remove('hidden');
                    
                        setTimeout(() => {
                            messageError.classList.add('hidden');
                        }, 5000);
                    
                        document.getElementById('overlayImport').classList.add('hidden');
                    }
                    
                });
            }
        });
    });
    
    const deleteIcons = document.querySelectorAll('.delete-icon');
    deleteIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            const docId = e.target.getAttribute('data-id');
            showConfirmationDialog(docId);
        });
    });
}

btnPrevious.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
});

btnNext.addEventListener('click', () => {
    if (currentTab === 'codigos') {
        const totalPages = Math.ceil(allCodigos.length / pageSize) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    } else if (currentTab === 'pendientes') {
        const totalPages = Math.ceil(allPendientes.length / pageSize) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    }
});

let docToDeleteId = null;

function showConfirmationDialog(docId) {
    docToDeleteId = docId; 
    confirmationContainer.classList.remove('hidden');
}

function hideConfirmationDialog() {
    confirmationContainer.classList.add('hidden');
}

function toggleDeleteSpinner(show) {
    if (show) {
        overlayDelete.classList.remove('hidden'); 
        spinnerDelete.classList.add('lds-dual-ring'); 
        loadingTextDelete.textContent = 'Eliminando...'; 
    } else {
        overlayDelete.classList.add('hidden'); 
        spinnerDelete.classList.remove('lds-dual-ring'); 
    }
}

async function deleteRecord() {
    if (!docToDeleteId) return;

    try {
        toggleDeleteSpinner(true);
        await deleteDoc(doc(db, 'codigos', docToDeleteId));
        toggleDeleteSpinner(false);
        
        const messageSuccess = document.getElementById('messageSuccess');
        const successText = document.getElementById('successText');
        successText.textContent = '¡El código ha sido eliminado correctamente!';
        messageSuccess.classList.remove('hidden');

        setTimeout(() => {
            messageSuccess.classList.add('hidden');
        }, 5000);

        displayData();
        hideConfirmationDialog();
    } catch (error) {
        console.error('Error al eliminar el código:', error);
        toggleDeleteSpinner(false);

        const messageError = document.getElementById('messageError');
        const errorText = document.getElementById('errorText');
        errorText.textContent = 'Hubo un error al eliminar el código.';
        messageError.classList.remove('hidden');

        setTimeout(() => {
            messageError.classList.add('hidden');
        }, 5000);
    }
}

btnConfirmDelete.addEventListener('click', () => {
    deleteRecord(); 
});

btnCancelDelete.addEventListener('click', () => {
    hideConfirmationDialog();  
});

closeConfirmation.addEventListener('click', () => {
    hideConfirmationDialog();
});

closeEditModal.addEventListener('click', () => {
    editModal.classList.remove('visible');
    editModalOverlay.classList.remove('visible');
});

editModalOverlay.addEventListener('click', () => {
    editModal.classList.remove('visible');
    editModalOverlay.classList.remove('visible');
});

async function generateNewID() {
    const querySnapshot = await getDocs(collection(db, 'codigos'));
    const totalDocs = querySnapshot.size;
    const newID = String(totalDocs + 1).padStart(4, '0');
    return newID;
}

function getCurrentDateTime() {
    const now = new Date();
    const formattedDate = now.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return formattedDate;
}

function toggleSpinner(show) {
    overlayRegister.classList.toggle('hidden', !show);
}

function showMessageSuccess(message) {
    successText.textContent = message;
    messageSuccess.classList.remove('hidden');

    setTimeout(() => {
        messageSuccess.classList.add('hidden');
    }, 6000);
}

closeMessageSuccess.addEventListener('click', () => {
    messageSuccess.classList.add('hidden');
});

function getSelectedStatus() {
    let statusValue = '';
    registerStatus.forEach((radio) => {
        if (radio.checked) {
            statusValue = radio.value;
        }
    });
    return statusValue;
}

formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const companyId = registerCompany.value; 
    const companyName = registerCompany.options[registerCompany.selectedIndex].textContent;

    if (!companyId || companyName === 'Selecciona una empresa') {
        alert('Por favor, selecciona una empresa válida.');
        return;
    }

    const newID = await generateNewID();
    const currentDateTime = getCurrentDateTime();
    const priceNetValue = registerPriceNet.value;
    const descriptionText = (registerReference.value.trim() + " " + registerDetails.value.trim()).trim();
    const statusValue = getSelectedStatus();

    if (!statusValue) {
        alert('Por favor, selecciona un estado.');
        return;
    }

    toggleSpinner(true);

    try {
        const codigosRef = collection(db, 'codigos');
        const querySnapshot = await getDocs(codigosRef);
        
        let isDuplicate = false;

        querySnapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            if (data.referencia === registerReference.value || data.codigo === registerCode.value) {
                isDuplicate = true;
            }
        });

        if (isDuplicate) {
            const messageWarning = document.getElementById('messageWarning');
            const warningText = document.getElementById('warningText');
            warningText.textContent = 'Ya existe un código o referencia con los mismos datos. No se puede registrar.';
            messageWarning.classList.remove('hidden');
            
            setTimeout(() => {
                messageWarning.classList.add('hidden');
            }, 5000);

            toggleSpinner(false);
            return;
        }

        await addDoc(codigosRef, {
            id: newID,
            usuario: registerUsuario.textContent,
            referencia: registerReference.value,
            detalles: registerDetails.value,
            descripcion: descriptionText,
            precioNeto: priceNetValue,
            precio: priceNetValue,
            codigo: registerCode.value,
            empresa: companyName,
            proveedor: { id: companyId, nombre: companyName },
            clasificacion: registerClassification.value,
            estado: statusValue,
            fechaRegistro: currentDateTime,
            timestamp: new Date()
        });

        toggleSpinner(false);
        showMessageSuccess(`el código con el ID: ${newID} se ha registrado con exito! `);
        displayData(); 
        formRegister.reset();
    } catch (error) {
        console.error('Error al registrar:', error);
        toggleSpinner(false);
        alert('Error al registrar los datos.');
    }
});

initializeLogEvents();

displayData();