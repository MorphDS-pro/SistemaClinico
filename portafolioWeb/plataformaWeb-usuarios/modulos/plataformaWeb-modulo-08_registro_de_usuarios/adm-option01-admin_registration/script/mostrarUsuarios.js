// Importar los módulos necesarios de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Configuración de Firebase 
const firebaseConfig = {
    apiKey: "AIzaSyCAQefjRO9ixEnnlyIohqnOI4MVzC38lc8",
    authDomain: "administrador-638bc.firebaseapp.com",
    projectId: "administrador-638bc",
    storageBucket: "administrador-638bc.firebasestorage.app",
    messagingSenderId: "31705925031",
    appId: "1:31705925031:web:0f3c1158f7a7ff91fde282",
    measurementId: "G-EJFSB52GBN"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener los usuarios registrados desde Firestore y mostrar en la tabla
async function cargarUsuarios() {
    const usuariosCollection = collection(db, "usuarios");
    const querySnapshot = await getDocs(usuariosCollection);
    const tableBody = document.getElementById("table-body");
    
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        const row = document.createElement("tr");
        
        // Crear celdas para cada campo de usuario
        const seleccionCell = document.createElement("td");
        const seleccionInput = document.createElement("input");
        seleccionInput.type = "checkbox";
        seleccionCell.appendChild(seleccionInput);
        
        const idCell = document.createElement("td");
        idCell.textContent = doc.id;

        const perfilCell = document.createElement("td");
        const perfilIcon = document.createElement("i");

        // Asignar el icono según el valor de "identidad"
        if (user.identidad === "hombre") {
            perfilIcon.classList.add("fas", "fa-mars");
            perfilIcon.style.color = "blue";
        } else if (user.identidad === "mujer") {
            perfilIcon.classList.add("fas", "fa-venus");
            perfilIcon.style.color = "pink";
        } else {
            perfilIcon.classList.add("fas", "fa-genderless");
            perfilIcon.style.color = "gray";
        }
        perfilCell.appendChild(perfilIcon);
        
        const nombreCompletoCell = document.createElement("td");
        nombreCompletoCell.textContent = user.nombreCompleto;

        const rutCell = document.createElement("td");
        rutCell.textContent = user.rut;

        const correoCell = document.createElement("td");
        correoCell.textContent = user.correo;

        const identidadCell = document.createElement("td");
        identidadCell.textContent = user.identidad;

        const usuarioCell = document.createElement("td");
        usuarioCell.textContent = user.usuario;

        const cargoCell = document.createElement("td");
        cargoCell.textContent = user.cargo;

        // Añadir todas las celdas a la fila
        row.appendChild(seleccionCell);
        row.appendChild(idCell);
        row.appendChild(perfilCell);
        row.appendChild(nombreCompletoCell);
        row.appendChild(rutCell);
        row.appendChild(correoCell);
        row.appendChild(identidadCell);
        row.appendChild(usuarioCell);
        row.appendChild(cargoCell);

        // Agregar la fila al cuerpo de la tabla
        tableBody.appendChild(row);
    });
}

// Llamar a la función para cargar los usuarios cuando se cargue la página
document.addEventListener("DOMContentLoaded", cargarUsuarios);
