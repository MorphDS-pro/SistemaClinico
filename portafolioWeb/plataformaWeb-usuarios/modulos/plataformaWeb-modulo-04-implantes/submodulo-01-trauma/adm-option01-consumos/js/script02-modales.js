import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyDfz0_7v43TmV0rlFM9UhnVVHLFGtRWhGw",
  authDomain: "prestaciones-57dcd.firebaseapp.com",
  projectId: "prestaciones-57dcd",
  storageBucket: "prestaciones-57dcd.firebasestorage.app",
  messagingSenderId: "409471759723",
  appId: "1:409471759723:web:faa6812772f44baa3ec82e",
  measurementId: "G-0CZ9BMJWMV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function loadMedicos() {
  try {
    const querySnapshot = await getDocs(collection(db, 'medicos'));
    const selectMedicos = document.getElementById('registerDoctor');
    
    selectMedicos.innerHTML = '<option value="">Selecciona un médico</option>';

    if (querySnapshot.empty) {
        console.log('No se encontraron médicos en Firestore.');
        return;
    }

    const medicos = [];
    querySnapshot.forEach((doc) => {
        const medicoData = doc.data();
        medicos.push({
            id: doc.id,
            nombre: medicoData.nombre || ''
        });
    });

    medicos.sort((a, b) => {
        return a.nombre.localeCompare(b.nombre);
    });

    medicos.forEach((medico) => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = medico.nombre;
        selectMedicos.appendChild(option);
    });

  } catch (error) {
    console.error('Error al obtener los médicos:', error);
  }
}

loadMedicos();

document.addEventListener("DOMContentLoaded", () => {
  const bttnRegister = document.getElementById("bttnRegister");
  const bttnSearch = document.getElementById("bttnSearch");
  const formRegisterContainer = document.getElementById("formRegisterContainer");
  const searchContainer = document.getElementById("searchContainer");

  bttnRegister?.addEventListener("click", () => {
    const isRegisterVisible = !formRegisterContainer.classList.contains("hidden");

    searchContainer.classList.add("hidden");

    if (isRegisterVisible) {
      formRegisterContainer.classList.add("hidden");
    } else {
      formRegisterContainer.classList.remove("hidden");
    }
  });

  bttnSearch?.addEventListener("click", () => {
    const isSearchVisible = !searchContainer.classList.contains("hidden");

    formRegisterContainer.classList.add("hidden");

    if (isSearchVisible) {
      searchContainer.classList.add("hidden");
    } else {
      searchContainer.classList.remove("hidden");
    }
  });

});

document.addEventListener('DOMContentLoaded', function () {
  const surgeryDateInput = document.getElementById('registerSurgeryDate');
  const surgeryDateContainer = document.getElementById('register-surgery-date');
  const today = new Date().toISOString().split('T')[0];

  surgeryDateInput.setAttribute('max', today);
  surgeryDateContainer.addEventListener('click', function () {
      surgeryDateInput.showPicker();
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const admissionInput = document.getElementById('registerAdmission');

  admissionInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 6);
  });

});

document.addEventListener('DOMContentLoaded', function () {
  const codeInput = document.getElementById('registerCode');

  codeInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 20);
  });

});

document.addEventListener('DOMContentLoaded', function () {
  const attributeInput = document.getElementById('registerAttribute');

  attributeInput.value = "Consignación";
  attributeInput.addEventListener('input', function () {
      this.value = "Consignación";
  });
});

async function loadConsignacionDescriptions() {
  try {
      const querySnapshot = await getDocs(collection(db, 'codigos'));
      const input = document.getElementById('registerDescriptionInput');
      const list = document.getElementById('customDescriptionsList');   
      const searchTerm = input.value.trim().toLowerCase();
      
      list.innerHTML = '';

      querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.clasificacion === "consignacion" && data.descripcion.toLowerCase().includes(searchTerm)) {
              const optionItem = document.createElement('li');
              optionItem.textContent = data.descripcion;
              optionItem.onclick = function() {
                  input.value = data.descripcion;
                  document.getElementById('registerCode').value = data.codigo;
                  document.getElementById('registerPrice').value = data.precio;
                  document.getElementById('registerCompany').value = data.empresa; 
                  list.style.display = 'none';
              };
              list.appendChild(optionItem);
          }
      });

      list.style.display = list.innerHTML.trim() !== '' ? 'block' : 'none';

  } catch (error) {
      console.error("Error al cargar las descripciones:", error);
  }
}

document.addEventListener('DOMContentLoaded', loadConsignacionDescriptions);
document.getElementById('registerDescriptionInput').addEventListener('input', loadConsignacionDescriptions);

document.getElementById('showDescriptionsButton').addEventListener('click', function() {
    const list = document.getElementById('customDescriptionsList');
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
    loadConsignacionDescriptions(); 
});

document.addEventListener('click', function(e) {
  if (!document.getElementById('registerDescriptionInput').contains(e.target) && !document.getElementById('showDescriptionsButton').contains(e.target)) {
      document.getElementById('customDescriptionsList').style.display = 'none';
  }
});