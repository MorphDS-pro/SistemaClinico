function cargarPaginaPrincipal() {
    const mainContent = document.getElementById("main-content");

    const iframe = document.createElement("iframe");

    iframe.src = "info/info.html";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.frameBorder = "0%";

    mainContent.innerHTML = "";
    mainContent.appendChild(iframe);
}

function ocultarSubmenusYSecciones() {
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(function(submenu) {
        submenu.style.display = 'none';
    });

    const allSections = document.querySelectorAll('.contenedor-seccion');
    allSections.forEach(function(section) {
        section.style.display = 'none';
        section.classList.remove('open');
    });
}

function mostrarPaginaPrincipal() {
    cargarPaginaPrincipal();
    ocultarSubmenusYSecciones();

    const contenedorPrincipal = document.querySelector('.contenedor-principal');
    contenedorPrincipal.style.display = 'block';
}

window.addEventListener("load", function() {
    mostrarPaginaPrincipal();
});

function mostrarFecha() {
    const fechaActual = new Date();
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);
    const dateElement = document.getElementById('date');
    
    if (dateElement) {
        dateElement.innerHTML = fechaFormateada;
    }
}

document.addEventListener('DOMContentLoaded', mostrarFecha);

function showSection(sectionId) { 
    document.querySelector('.contenedor-principal').style.display = 'none';
  
    const sections = document.querySelectorAll('.contenedor-seccion');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
  
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }
}
  
function volverAlMenu() {
    const sections = document.querySelectorAll('.contenedor-seccion');
    sections.forEach(function(section) {
        section.style.display = 'none';
    });
  
    document.querySelector('.contenedor-principal').style.display = 'block';
}
  
function toggleSubmenu(element) {
    const allSubmenus = document.querySelectorAll('.submenu');
    allSubmenus.forEach(submenu => {
        if (submenu !== element.nextElementSibling) {
            submenu.style.display = 'none';
        }
    });
  
    const submenu = element.nextElementSibling;
  
    if (submenu.style.display === 'none' || submenu.style.display === '') {
        submenu.style.display = 'block';
    } else {
        submenu.style.display = 'none';
    }
  
    const allIcons = document.querySelectorAll(".fas.fa-chevron-right");

    allIcons.forEach(icon => {
        if(icon !== element.querySelector(".fas.fa-chevron-right")) {
            icon.classList.remove("rotated");
        }
    });
    
    const icon = element.querySelector(".fas.fa-chevron-right");
    icon.classList.toggle("rotated"); 
}

function cargarFormulario(url) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = "99%";
    iframe.height = "800px";
    iframe.frameBorder = "0%";

    mainContent.appendChild(iframe);
}

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.formulario-link');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const target = this.getAttribute('data-target');
            cargarFormulario(target);
        });
    });
});

const logoutContainer = document.getElementById('logout-confirmation');
const confirmLogout = document.getElementById('confirm-logout');
const cancelLogout = document.getElementById('cancel-logout');
const logoutBtn = document.getElementById('logout-btn');

function showLogoutConfirmation() {
  logoutContainer.classList.add('active');
}

function hideLogoutConfirmation() {
  logoutContainer.classList.remove('active');
}

logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  showLogoutConfirmation();
});

confirmLogout.addEventListener('click', () => {
  console.log('Cerrando sesión...');
  window.location.href = 'index.html';
});

cancelLogout.addEventListener('click', hideLogoutConfirmation);

document.addEventListener('DOMContentLoaded', function () {
    const userIcon = document.getElementById('user-icon');
    const userContainer = document.getElementById('user-container');
    const optionsContainer = document.getElementById('options-container');
    const optionLinks = optionsContainer.querySelectorAll('a.formulario-link');
  
    userIcon.addEventListener('click', function (event) {
      event.stopPropagation();
      optionsContainer.classList.toggle('hidden');
    });
  
    document.addEventListener('click', function (event) {
      if (!userContainer.contains(event.target)) {
        optionsContainer.classList.add('hidden');
      }
    });
  
    optionsContainer.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  
    optionLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        optionsContainer.classList.add('hidden');
      });
    });
  });
  