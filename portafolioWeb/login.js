import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { getFirestore, query, where, getDocs, collection } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

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

const loginForm = document.getElementById('loginForm');
const overlay = document.getElementById('overlay');
const roleModal = document.getElementById('roleModal');
const roleSelect = document.getElementById('roleSelect');
const continueBtn = document.getElementById('continueBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    overlay.classList.remove('hidden');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where("usuario", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userEmail = userDoc.data().correo;
            const roles = userDoc.data().roles || [];

            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const user = userCredential.user;

            if (user) {
                sessionStorage.setItem('userId', userDoc.id);
                sessionStorage.setItem('roles', JSON.stringify(roles));

                console.log("Usuario:", username, "Roles encontrados:", roles);

                if (username.toLowerCase() === "admin") {
                    roleSelect.innerHTML = '';
                    roles.forEach(role => {
                        const option = document.createElement('option');
                        option.value = role;
                        option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
                        roleSelect.appendChild(option);
                    });
                    roleModal.classList.remove('hidden');
                    overlay.classList.add('hidden');
                } else if (roles.length === 1) {
                    if (roles[0] === "admin") {
                        window.location.href = 'plataformaWeb-administradores/dashboard.html';
                    } else if (roles[0] === "usuario") {
                        window.location.href = 'plataformaWeb-usuarios/dashboard.html';
                    } else {
                        throw new Error("Rol no válido");
                    }
                } else if (roles.length > 1) {
                    if (roles.includes("admin")) {
                        window.location.href = 'plataformaWeb-administradores/dashboard.html';
                    } else if (roles.includes("usuario")) {
                        window.location.href = 'plataformaWeb-usuarios/dashboard.html';
                    }
                } else {
                    throw new Error("No se encontraron roles válidos");
                }
            }
        } else {
            alert("Nombre de usuario no encontrado.");
        }
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        alert("Credenciales incorrectas o error de acceso. Intenta nuevamente.");
    } finally {
        if (!roleModal.classList.contains('hidden')) return;
        overlay.classList.add('hidden');
    }
});

continueBtn.addEventListener('click', () => {
    const selectedRole = roleSelect.value;
    roleModal.classList.add('hidden');
    if (selectedRole === "admin") {
        window.location.href = 'plataformaWeb-administradores/dashboard.html';
    } else if (selectedRole === "usuario") {
        window.location.href = 'plataformaWeb-usuarios/dashboard.html';
    }
});