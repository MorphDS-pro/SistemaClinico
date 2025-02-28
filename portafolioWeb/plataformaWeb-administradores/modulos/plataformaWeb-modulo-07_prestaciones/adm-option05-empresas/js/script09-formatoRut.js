function formatRUT(rut) {
    rut = rut.replace(/[^\dKk]/g, '');
    rut = rut.substring(0, 9);

    if (rut.length > 2) {
        rut = rut.replace(/^(\d{2})(\d)/, '$1.$2');
    }
    if (rut.length > 5) {
        rut = rut.replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2');
    }
    if (rut.length > 8) {
        rut = rut.replace(/^(\d{2}\.\d{3}\.\d{3})(\d|[Kk])/, '$1-$2');
    }
    return rut.toUpperCase();
}

function validateRUT(rut) {
    const rutRegex = /^\d{2}\.\d{3}\.\d{3}-[\dKk]$/;
    return rutRegex.test(rut);
}

function showMessage(message, type) {
    const messageContainer = document.getElementById(`message${type}`);
    const textContainer = document.getElementById(`${type.toLowerCase()}Text`);
    
    if (messageContainer && textContainer) {
        textContainer.textContent = message;
        messageContainer.classList.remove('hidden');
        
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const searchRutInput = document.querySelector('#searchRut');
    const registerRutInput = document.querySelector('#registerRut');

    function handleRutInput(e) {
        let value = e.target.value;
        value = formatRUT(value);
        e.target.value = value;
        
        if (!validateRUT(value)) {
            showMessage('El RUT ingresado no está completo o es incorrecto.', 'Warning');
        }
    }

    if (searchRutInput) {
        searchRutInput.addEventListener('input', handleRutInput);
    }

    if (registerRutInput) {
        registerRutInput.addEventListener('input', handleRutInput);
    }

    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function () {
            this.parentElement.classList.add('hidden');
        });
    });
});
