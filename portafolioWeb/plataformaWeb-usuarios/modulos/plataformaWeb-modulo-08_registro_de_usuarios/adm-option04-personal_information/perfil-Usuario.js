import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

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

// Obtener el ID del usuario desde sessionStorage
const userId = sessionStorage.getItem('userId');

// Depuración: Verificar que el ID del usuario está siendo recuperado correctamente
console.log("userId recuperado desde sessionStorage:", userId);

if (userId) {
    async function obtenerDatosUsuario() {
        try {
            // Consultar el documento del usuario usando el ID de Firestore
            const userRef = doc(db, 'usuarios', userId); // 'userId' es el identificador del usuario
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                // Obtener los datos del documento
                const datosUsuario = docSnap.data();
                
                // Depuración: Verificar los datos que se están obteniendo
                console.log("Datos del usuario:", datosUsuario);

                // Asignar los valores a los elementos HTML
                document.getElementById('user-name-h3').textContent = datosUsuario.nombreCompleto || 'Nombre no disponible';
                
                // Asignar los datos a las clases correspondientes
                document.querySelector('.rut').textContent = datosUsuario.rut || 'RUT no disponible';
                document.querySelector('.email').textContent = datosUsuario.correo || 'Correo no disponible'; // Cambiado a 'correo'
                document.querySelector('.identidad').textContent = datosUsuario.identidad || 'Identidad no disponible';
                document.querySelector('.nombreUsuario').textContent = datosUsuario.usuario || 'Nombre de usuario no disponible'; // Cambiado a 'usuario'
                document.querySelector('.cargo').textContent = datosUsuario.cargo || 'Cargo no disponible';
            } else {
                alert("Usuario no encontrado.");
                window.location.href = 'index.html'; // Redirigir al login si no se encuentra el documento
            }
        } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
            window.location.href = 'index.html'; // Redirigir al login en caso de error
        }
    }

    // Llamar a la función para obtener los datos del usuario
    obtenerDatosUsuario();
} else {
    // Si no hay sesión activa, redirigir al login
    window.location.href = 'index.html'; // Redirigir si no hay sesión activa
}
