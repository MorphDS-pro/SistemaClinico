
import { db } from './script01-firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

export function attachLogEvents() {
    const infoIcons = document.querySelectorAll('.info-icon');
    infoIcons.forEach(icon => {
        icon.addEventListener('click', async (e) => {
            const docId = e.target.getAttribute('data-id');
            const docRef = doc(db, 'codigos', docId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Actualizar datos del modal
                    document.getElementById('logCodeValue').textContent = data.codigo || 'Sin código';
                    document.getElementById('logDescriptionValue').textContent = data.descripcion || 'Sin descripción';
                    
                    const logContentDiv = document.getElementById('logContent');
                    logContentDiv.innerHTML = "";
                    if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
                        data.logs.forEach(entry => {
                            const p = document.createElement('p');
                            p.textContent = entry;
                            logContentDiv.appendChild(p);
                        });
                    } else {
                        logContentDiv.textContent = "No hay historial de modificaciones.";
                    }
                    // Mostrar el modal de log
                    document.getElementById('logModal').classList.remove('hidden');
                }
            } catch (error) {
                console.error("Error al obtener el log del documento:", error);
            }
        });
    });
}

/**
 * Adjunta el evento al botón de cierre del modal de log.
 */
export function attachLogModalClose() {
    const closeBtn = document.getElementById('closeLogModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('logModal').classList.add('hidden');
        });
    }
}

/**
 * Función de inicialización para la funcionalidad de logs.
 * Llama a esta función después de renderizar los elementos.
 */
export function initializeLogEvents() {
    attachLogEvents();
    attachLogModalClose();
}
