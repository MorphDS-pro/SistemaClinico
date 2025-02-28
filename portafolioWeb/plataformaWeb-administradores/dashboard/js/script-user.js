import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDsSD0EcY_QKPcqycpiynXg--mO9VMvRDs",
    authDomain: "usuarios-d4364.firebaseapp.com",
    projectId: "usuarios-d4364",
    storageBucket: "usuarios-d4364.firebasestorage.app",
    messagingSenderId: "1050588492432",
    appId: "1:1050588492432:web:5803cad6718dfa36a09e15",
    measurementId: "G-SZD8728PHP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("dashboard.js cargado correctamente");

onAuthStateChanged(auth, async (user) => {
    console.log("onAuthStateChanged ejecutado, usuario:", user ? user.email : "No hay usuario");
    
    if (user) {
        const userId = sessionStorage.getItem('userId');
        const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
        
        console.log("userId desde sessionStorage:", userId);
        console.log("Roles desde sessionStorage:", roles);

        if (!userId || !roles.includes('admin')) {
            console.log("Acceso denegado: No tienes rol de administrador o userId no encontrado");
            alert("Acceso denegado: No tienes rol de administrador o no estás autenticado.");
            window.location.href = '../../index.html';
            return;
        }

        try {
            const userRef = doc(db, 'usuarios', userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const nombreCompleto = docSnap.data().nombreCompleto;
                console.log("Usuario encontrado, nombreCompleto:", nombreCompleto);
                document.getElementById('user-name-span').textContent = nombreCompleto;
                document.querySelector('.container').style.display = 'block'; 
                console.log("Contenedor mostrado");
            } else {
                console.log("Usuario no encontrado en Firestore");
                alert("Usuario no encontrado en Firestore.");
                window.location.href = '../../index.html';
            }
        } catch (error) {
            console.error("Error al obtener el nombre completo:", error);
            alert("Error al cargar datos del usuario.");
            window.location.href = '../../index.html';
        }
    } else {
        console.log("No hay usuario autenticado, redirigiendo...");
        window.location.href = '../../index.html';
    }
});

const logoutBtn = document.getElementById('logout-btn');
const logoutConfirmation = document.getElementById('logout-confirmation');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        console.log("Botón de logout clickeado");
        logoutConfirmation.style.display = 'flex';
    });
}

if (confirmLogout) {
    confirmLogout.addEventListener('click', () => {
        console.log("Confirmar logout clickeado");
        signOut(auth).then(() => {
            sessionStorage.clear();
            window.location.href = '../login.html';
        }).catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
    });
}

if (cancelLogout) {
    cancelLogout.addEventListener('click', () => {
        console.log("Cancelar logout clickeado");
        logoutConfirmation.style.display = 'none';
    });
}