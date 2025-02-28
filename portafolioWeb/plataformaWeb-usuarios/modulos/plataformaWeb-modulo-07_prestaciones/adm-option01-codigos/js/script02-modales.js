import { db } from './script01-firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const registerCompany = document.getElementById('registerCompany');
const inputReferencia = document.getElementById('registerReference');
const inputDetalles = document.getElementById('registerDetails');
const spanDescripcion = document.getElementById('registerDescription');
const inputPrecioNeto = document.getElementById('registerPriceNet');
const spanPrecio = document.getElementById('registerPrice');
const editModalPriceInput = document.getElementById('editModalPriceInput');

async function loadEmpresas() {
    try {
        const querySnapshot = await getDocs(collection(db, 'companies'));
        registerCompany.innerHTML = '<option value="">Selecciona una empresa</option>';
        if (querySnapshot.empty) {
            console.log('No se encontraron empresas en Firestore.');
            return;
        }
        const empresas = [];
        querySnapshot.forEach((doc) => {
            const empresaData = doc.data();
            empresas.push({
                id: doc.id,
                nombre: empresaData.empresa || ''
            });
        });
        empresas.sort((a, b) => {
            const nombreA = a.nombre || '';
            const nombreB = b.nombre || '';
            return nombreA.localeCompare(nombreB);
        });
        empresas.forEach((empresa) => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre;
            registerCompany.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener las empresas:', error);
    }
}

loadEmpresas();


function updateDescription() {
    const referencia = inputReferencia.value.trim();
    const detalles = inputDetalles.value.trim();
    spanDescripcion.textContent = referencia + ' ' + detalles;
  }
  
  function updatePrecio() {
    let value = inputPrecioNeto.value;
    let numericValue = parseInt(value.replace(/\D/g, ''), 10);
    if (isNaN(numericValue)) {
      numericValue = 0;
    }
    
    if (numericValue > 8000000) {
      showWarningMessage("El máximo es 8.000.000");
      numericValue = 8000000;
    }
    
    let formatted = numericValue.toLocaleString('es-CL', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    });
    
    spanPrecio.textContent = formatted;
    inputPrecioNeto.value = formatted;
  }
  
  function showWarningMessage(msg) {
    const messageWarning = document.getElementById('messageWarning');
    const warningText = document.getElementById('warningText');
    warningText.textContent = msg;
    messageWarning.classList.remove('hidden');
    setTimeout(() => {
      messageWarning.classList.add('hidden');
    }, 5000);
  }
  
  function formatPriceInput() {
    let value = editModalPriceInput.value;
  
    // Eliminar todo lo que no sea número
    let numericValue = value.replace(/\D/g, '');
  
    // Limitar el valor a 6.000.000
    if (numericValue > 6000000) {
      numericValue = '6000000';
    }
  
    // Formatear el número con separadores de miles
    let formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
    // Asignar el valor formateado al campo de entrada
    editModalPriceInput.value = formattedValue;
  }
  
  // Escuchar el evento de 'input' para formatear el precio mientras se escribe
  editModalPriceInput.addEventListener('input', formatPriceInput);
  
  inputReferencia.addEventListener('input', updateDescription);
  inputDetalles.addEventListener('input', updateDescription);
  inputPrecioNeto.addEventListener('input', updatePrecio);
  
  const closeMessageWarning = document.getElementById('closeMessageWarning');
  closeMessageWarning.addEventListener('click', () => {
    document.getElementById('messageWarning').classList.add('hidden');
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const bttnNew = document.getElementById("bttnNew");
    const formNewContainer = document.getElementById("formNewContainer");
    const formRegisterContainer = document.getElementById("formRegisterContainer");
    const btnReset = document.getElementById("btnReset");

    bttnNew?.addEventListener("click", () => {
        formNewContainer.classList.add("hidden");
        formRegisterContainer.classList.remove("hidden");
    });

    btnReset?.addEventListener("click", () => {
        formRegisterContainer.classList.add("hidden");
        formNewContainer.classList.remove("hidden");
    });
});