document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM
    const btnNuevo = document.getElementById("bttnNuevo");
    const formNuevoContainer = document.getElementById("formNuevoContainer");
    const formRegistrarContainer = document.getElementById("formRegistrarContainer");
    const btnCancelar = document.getElementById("btnCancelar");

    // Evento para mostrar el formulario de registro al presionar "Nuevo"
    btnNuevo?.addEventListener("click", () => {
        // Ocultar el contenedor de "Nuevo"
        formNuevoContainer.classList.add("hidden");

        // Mostrar el contenedor del formulario de registro
        formRegistrarContainer.classList.remove("hidden");
    });

    // Evento para cancelar el registro y volver al estado inicial
    btnCancelar?.addEventListener("click", () => {
        // Ocultar el contenedor del formulario de registro
        formRegistrarContainer.classList.add("hidden");

        // Mostrar el contenedor de "Nuevo"
        formNuevoContainer.classList.remove("hidden");
    });
});
