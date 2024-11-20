// Función para obtener los parámetros de la URL
function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    return params;
}

const params = getQueryParams();
const id = params.id;

// Función para capitalizar la primera letra de cada palabra
function capitalizeFirstLetter(text) {
    return text
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Hacer una petición para obtener los datos del gafete por ID
fetch(`/Gafetes/datosQR/${id}`)
    .then(response => response.json())
    .then(data => {
        if (data && Object.keys(data).length > 0) {
            // Formatear la fecha de nacimiento
            const birthdate = data.birthdate ? new Date(data.birthdate).toLocaleDateString('es-ES') : 'No disponible';

            // Mostrar la tarjeta de datos
            document.getElementById('badge-container').style.display = 'block';
            document.getElementById('title').textContent = "Datos del Gafete";

            // Actualizar los elementos HTML con los datos obtenidos, aplicando capitalización
            document.getElementById('photo').src = data.photo || 'ruta_a_imagen_por_defecto.jpg'; // Usar una imagen por defecto si no hay foto
            document.getElementById('name').textContent = `Nombre: ${capitalizeFirstLetter(data.name)}`;
            document.getElementById('birthdate').textContent = `Fecha de Nacimiento: ${birthdate}`;
            document.getElementById('telephone').textContent = `Teléfono: ${data.telephone}`;
            document.getElementById('celphone').textContent = `Celular: ${data.celphone}`;
            document.getElementById('address').textContent = `Dirección: ${capitalizeFirstLetter(data.address)}`;
            document.getElementById('alergia').textContent = `Alergias: ${capitalizeFirstLetter(data.alergia)}`;
            document.getElementById('e_contact').textContent = `Contacto de Emergencia: ${capitalizeFirstLetter(data.e_contact)}`;
            document.getElementById('parents').textContent = `Parentesco: ${capitalizeFirstLetter(data.parents)}`;
            document.getElementById('e_contact_celphone').textContent = `Celular de Contacto de Emergencia: ${data.e_contact_celphone}`;
            document.getElementById('job').textContent = `Puesto: ${capitalizeFirstLetter(data.job)}`;
            document.getElementById('departament').textContent = `Departamento: ${capitalizeFirstLetter(data.departament)}`;
            document.getElementById('brigadista').textContent = `Brigadista: ${capitalizeFirstLetter(data.brigadista)}`;
            document.getElementById('type_blood').textContent = `Tipo de Sangre: ${capitalizeFirstLetter(data.type_blood)}`;
        } else {
            // Si no se encuentra el gafete, mostrar solo el mensaje
            document.getElementById('title').textContent = "Gafete no existente";
        }
    })
    .catch(error => {
        console.error('Error al cargar los datos del gafete:', error);
        document.getElementById('title').textContent = "Error al cargar el gafete";
    });
