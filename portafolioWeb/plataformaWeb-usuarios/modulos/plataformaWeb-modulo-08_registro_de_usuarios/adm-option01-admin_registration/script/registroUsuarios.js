// Importar los módulos necesarios de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Función para mostrar el spinner
function mostrarSpinner() {
    document.getElementById("overlay").classList.remove("hidden");
}

// Función para ocultar el spinner
function ocultarSpinner() {
    document.getElementById("overlay").classList.add("hidden");
}

// Función para mostrar el mensaje de éxito
function mostrarMensajeExito() {
    document.getElementById("messageSuccess").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("messageSuccess").classList.add("hidden");
    }, 5000);
}

// Función para mostrar el mensaje de error
function mostrarMensajeError(errorMessage) {
    document.getElementById("errorText").textContent = errorMessage;
    document.getElementById("messageError").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("messageError").classList.add("hidden");
    }, 5000);
}

// Función para validar el formulario
function validarFormulario() {
    const nombreCompleto = document.getElementById("registrarNombreCompleto").value;
    const rut = document.getElementById("registrarRut").value;
    const correo = document.getElementById("registrarCorreo").value;
    const identidad = document.getElementById("registrarIdentidad").value;
    const usuario = document.getElementById("registrarUsuario").value;
    const cargo = document.getElementById("registrarCargo").value;
    const contrasena = document.getElementById("registrarContrasena").value;

    // Validación simple para asegurarse de que todos los campos estén completos
    return nombreCompleto && rut && correo && identidad && usuario && cargo && contrasena;
}

// Función para registrar usuario
async function registrarUsuario() {
    // Mostrar spinner
    mostrarSpinner();

    // Obtener los valores del formulario
    const nombreCompleto = document.getElementById("registrarNombreCompleto").value;
    const rut = document.getElementById("registrarRut").value;
    const correo = document.getElementById("registrarCorreo").value;
    const identidad = document.getElementById("registrarIdentidad").value;
    const usuario = document.getElementById("registrarUsuario").value;
    const cargo = document.getElementById("registrarCargo").value;
    const contrasena = document.getElementById("registrarContrasena").value;

    try {
        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
        const userId = userCredential.user.uid;

        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, "usuarios", userId), {
            nombreCompleto,
            rut,
            correo,
            identidad,
            usuario,
            cargo,
            fechaRegistro: new Date().toISOString(),
        });

        // Mostrar mensaje de éxito
        mostrarMensajeExito();
        resetFormulario();
    } catch (error) {
        // Mostrar mensaje de error
        mostrarMensajeError(error.message);
    } finally {
        // Ocultar spinner
        ocultarSpinner();
    }
}

// Función para resetear el formulario
function resetFormulario() {
    document.getElementById("registrarNombreCompleto").value = '';
    document.getElementById("registrarRut").value = '';
    document.getElementById("registrarCorreo").value = '';
    document.getElementById("registrarIdentidad").value = '';
    document.getElementById("registrarUsuario").value = '';
    document.getElementById("registrarCargo").value = '';
    document.getElementById("registrarContrasena").value = '';
    document.getElementById("btnGuardar").disabled = true; // Deshabilitar el botón "Guardar"
}

// Habilitar/deshabilitar el botón "Guardar" según la validez del formulario
document.querySelectorAll('.form-group-registrar input, .form-group-registrar select').forEach(input => {
    input.addEventListener('input', () => {
        const btnGuardar = document.getElementById("btnGuardar");
        btnGuardar.disabled = !validarFormulario(); // Deshabilitar el botón si el formulario no es válido
    });
});

// Asignar el evento al botón "Guardar"
document.getElementById("btnGuardar").addEventListener("click", (e) => {
    e.preventDefault();
    if (validarFormulario()) {
        registrarUsuario();
    } else {
        alert("Por favor, complete todos los campos del formulario.");
    }
});
