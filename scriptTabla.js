document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const tbody = document.querySelector('#clientsTable tbody');

    // Función para filtrar filas de la tabla según el término de búsqueda
    searchInput.addEventListener('keyup', function() {
        const searchTerm = searchInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Normaliza y quita acentos
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const nameCell = row.querySelector('td:nth-child(2)'); // Segunda columna es el nombre
            const name = nameCell ? nameCell.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

            // Compara usando el término de búsqueda normalizado
            row.style.display = name.includes(searchTerm) ? '' : 'none'; // Muestra u oculta las filas
        });
    });

    // Función para cargar datos de la tabla
    fetch('/Gafetes/Tabla')
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener los datos');
            return response.json();
        })
        .then(data => {
            tbody.innerHTML = ''; // Limpia el tbody antes de agregar nuevos datos

            data.forEach(cliente => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.name}</td>
                    <td>${formatDate(cliente.birthdate)}</td>
                    <td>${cliente.address}</td>
                    <td>${cliente.job}</td>
                    <td><button class="btn btn-success btn-sm" onclick="showQRCode(${cliente.id})">Mostrar QR</button></td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Función para formatear la fecha en formato "YYYY-MM-DD"
function formatDate(date) {
    if (!date || date === '0000-00-00') return 'No disponible';
    const jsDate = new Date(date);
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



console.log("steven de dios montoya hernandez")


// Función para abrir el formulario de actualización
function openUpdateForm(id) {
    fetch(`/Gafetes/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('updateName').value = data.name;
            document.getElementById('updateBirthdate').value = data.birthdate;
            document.getElementById('updateTelephone').value = data.telephone;
            document.getElementById('updateCelphone').value = data.celphone;
            document.getElementById('updateAddress').value = data.address;
            document.getElementById('updateAlergia').value = data.alergia;
            document.getElementById('updateEContact').value = data.e_contact;
            document.getElementById('updateParents').value = data.parents;
            document.getElementById('updateEContactCelphone').value = data.e_contact_celphone;
            document.getElementById('updateJob').value = data.job;
            document.getElementById('updateDepartament').value = data.departament;
            document.getElementById('updateBrigadista').value = data.brigadista;
            document.getElementById('updateTypeBlood').value = data.type_blood;
            document.getElementById('updateForm').dataset.id = id; // Guardar el ID del cliente en el formulario
            $('#updateModal').modal('show'); // Mostrar el modal
        });
}

// Función para manejar el envío del formulario de actualización
function submitUpdateForm(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.dataset.id;
    const updatedData = {
        name: document.getElementById('updateName').value,
        birthdate: document.getElementById('updateBirthdate').value,
        telephone: document.getElementById('updateTelephone').value,
        celphone: document.getElementById('updateCelphone').value,
        address: document.getElementById('updateAddress').value,
        alergia: document.getElementById('updateAlergia').value,
        e_contact: document.getElementById('updateEContact').value,
        parents: document.getElementById('updateParents').value,
        e_contact_celphone: document.getElementById('updateEContactCelphone').value,
        job: document.getElementById('updateJob').value,
        departament: document.getElementById('updateDepartament').value,
        brigadista: document.getElementById('updateBrigadista').value,
        type_blood: document.getElementById('updateTypeBlood').value,
    };

    fetch(`/Gafetes/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar los datos');
        $('#updateModal').modal('hide');
        alert('Datos actualizados correctamente');
        location.reload(); // Recargar la tabla para ver los cambios
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al actualizar los datos');
    });
}

// Función para eliminar un usuario
function deleteUser(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        fetch(`/Gafetes/delete/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al eliminar el usuario');
            alert('Usuario eliminado correctamente');
            location.reload(); // Recargar la página para actualizar la tabla
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al eliminar el usuario');
        });
    }
}

// Función para abrir el modal de "Agregar Usuario"
function openAddUserModal() {
    $('#addUserModal').modal('show');
}

// Función para manejar el envío del formulario de "Agregar Usuario"
function submitAddUserForm(event) {
    event.preventDefault();

    const newUserData = {
        name: document.getElementById('addName').value,
        birthdate: document.getElementById('addBirthdate').value,
        telephone: document.getElementById('addTelephone').value,
        celphone: document.getElementById('addCelphone').value,
        address: document.getElementById('addAddress').value,
        alergia: document.getElementById('addAlergia').value,
        e_contact: document.getElementById('addEContact').value,
        parents: document.getElementById('addParents').value,
        e_contact_celphone: document.getElementById('addEContactCelphone').value,
        job: document.getElementById('addJob').value,
        departament: document.getElementById('addDepartament').value,
        brigadista: document.getElementById('addBrigadista').value,
        type_blood: document.getElementById('addTypeBlood').value,
    };

    fetch('/Gafetes/save-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al agregar el usuario');
        $('#addUserModal').modal('hide');
        alert('Usuario agregado correctamente');
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al agregar el usuario');
    });
}

// Función para mostrar el código QR
function showQRCode(id) {
    const urlToRedirect = `https://coventryschool.edu.mx/Gafetes/DatosQR.html?id=${id}`;
    
    QRCode.toDataURL(urlToRedirect, { errorCorrectionLevel: 'H' }, (err, qrCode) => {
        if (err) {
            console.error('Error al generar el código QR:', err);
            return;
        }

        const qrCodeWindow = window.open('', '_blank');
        qrCodeWindow.document.write(`
            <html>
                <head><title>Código QR</title></head>
                <body>
                    <h1>Código QR</h1>
                    <img src="${qrCode}" alt="Código QR">
                </body>
            </html>
        `);
        qrCodeWindow.document.close();
    });
}
