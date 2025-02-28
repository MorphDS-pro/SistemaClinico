import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, onSnapshot, getDocs, updateDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDsSD0EcY_QKPcqycpiynXg--mO9VMvRDs",
    authDomain: "usuarios-d4364.firebaseapp.com",
    projectId: "usuarios-d4364",
    storageBucket: "usuarios-d4364.firebasestorage.app",
    messagingSenderId: "1050588492432",
    appId: "1:1050588492432:web:5803cad6718dfa36a09e15",
    measurementId: "G-SZD8728PHP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const registerForm = document.getElementById('registerForm');
const overlay = document.getElementById('overlay');
const usersTableBody = document.getElementById('usersTableBody');
let usersData = [];

// Función para formatear la fecha
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Cargar usuarios en la tabla en tiempo real
function loadUsers() {
    onSnapshot(collection(db, 'usuarios'), (snapshot) => {
        usersData = [];
        snapshot.forEach((doc) => {
            const user = doc.data();
            usersData.push({
                nombreCompleto: user.nombreCompleto,
                rut: user.rut,
                correo: user.correo,
                identidad: user.identidad,
                usuario: user.usuario,
                roles: user.roles.join(', '),
                fechaRegistro: user.fechaRegistro
            });
        });
        renderTable(usersData);
    }, (error) => {
        console.error("Error al cargar usuarios:", error);
    });
}

// Renderizar la tabla
function renderTable(data) {
    usersTableBody.innerHTML = '';
    data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.nombreCompleto}</td>
            <td>${user.rut}</td>
            <td>${user.correo}</td>
            <td>${user.identidad}</td>
            <td>${user.usuario}</td>
            <td>${user.roles}</td>
            <td>${formatDate(user.fechaRegistro)}</td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Registrar usuario o agregar rol
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    overlay.classList.remove('hidden');

    const nombreCompleto = document.getElementById('registrarNombreCompleto').value.trim();
    const rut = document.getElementById('registrarRut').value.trim();
    const correo = document.getElementById('registrarCorreo').value.trim();
    const identidad = document.getElementById('registrarIdentidad').value;
    const usuario = document.getElementById('registrarUsuario').value.trim();
    const contrasena = document.getElementById('registrarContrasena').value;
    const rol = document.getElementById('registrarRol').value;

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!nombreCompleto || !rut || !correo || !identidad || !usuario || !contrasena || !rol) {
            throw new Error("Todos los campos son obligatorios");
        }
        if (!emailRegex.test(correo)) {
            throw new Error("El correo electrónico no es válido");
        }
        if (contrasena.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        console.log("Procesando registro para:", { correo, rol });

        // Intentar registrar el usuario
        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
            const userId = userCredential.user.uid;

            // Nuevo usuario: crear documento en Firestore
            await setDoc(doc(db, "usuarios", userId), {
                nombreCompleto,
                rut,
                correo,
                identidad,
                usuario,
                roles: [rol],
                fechaRegistro: new Date().toISOString()
            });

            document.getElementById('successText').textContent = `Usuario ${usuario} registrado como ${rol} con éxito`;
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                // El correo ya existe, intentar agregar el rol
                const q = query(collection(db, "usuarios"), where("correo", "==", correo));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userId = userDoc.id;
                    const existingRoles = userDoc.data().roles || [];

                    if (existingRoles.includes(rol)) {
                        throw new Error(`El usuario ya tiene el rol ${rol}`);
                    }

                    // Verificar la contraseña antes de actualizar
                    await signInWithEmailAndPassword(auth, correo, contrasena);

                    // Agregar el nuevo rol
                    const updatedRoles = [...existingRoles, rol];
                    await updateDoc(doc(db, "usuarios", userId), {
                        roles: updatedRoles
                    });

                    document.getElementById('successText').textContent = `Rol ${rol} agregado al usuario ${usuario} con éxito`;
                } else {
                    throw new Error("Usuario registrado en Authentication pero no encontrado en Firestore");
                }
            } else {
                throw error;
            }
        }

        document.getElementById('messageSuccess').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('messageSuccess').classList.add('hidden');
            registerForm.reset();
        }, 3000);
    } catch (error) {
        console.error("Error al procesar:", error.message);
        let errorMessage = "Error desconocido";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "El correo ya está registrado (verifica la contraseña)";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "El correo no es válido";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "La contraseña debe tener al menos 6 caracteres";
        } else if (error.code === "auth/wrong-password") {
            errorMessage = "Contraseña incorrecta para agregar rol";
        } else {
            errorMessage = error.message;
        }
        document.getElementById('errorText').textContent = errorMessage;
        document.getElementById('messageError').classList.remove('hidden');
        setTimeout(() => document.getElementById('messageError').classList.add('hidden'), 3000);
    } finally {
        overlay.classList.add('hidden');
    }
});

window.toggleFilter = function(columnIndex) {
    const filterInput = document.getElementsByClassName('filter-input')[columnIndex];
    filterInput.classList.toggle('hidden');
    if (!filterInput.classList.contains('hidden')) {
        filterInput.focus();
    }
};

window.filterTable = function(columnIndex) {
    const filterValue = document.getElementsByClassName('filter-input')[columnIndex].value.trim().toLowerCase();
    const filteredData = usersData.filter(user => {
        const values = [
            user.nombreCompleto,
            user.rut,
            user.correo,
            user.identidad,
            user.usuario,
            user.roles,
            formatDate(user.fechaRegistro)
        ];
        return values[columnIndex].toLowerCase().includes(filterValue);
    });
    renderTable(filteredData);
};

// Eventos para cerrar mensajes
document.getElementById('closeMessageSuccess').addEventListener('click', () => {
    document.getElementById('messageSuccess').classList.add('hidden');
});

document.getElementById('closeMessageError').addEventListener('click', () => {
    document.getElementById('messageError').classList.add('hidden');
});

// Cargar los usuarios al iniciar
loadUsers();