// Función para obtener los parámetros de la URL
function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    return params;
}

// Manejo del evento del formulario
document.getElementById('badge-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const name = document.getElementById('name').value;
    const job = document.getElementById('job').value;
    const photoInput = document.getElementById('photo');
    const photoFile = photoInput.files[0];

    const canvas = document.getElementById('badgeCanvas');
    const ctx = canvas.getContext('2d');

    // Enviar el formulario para guardar los datos y obtener el ID
    const formData = new FormData(this); // Usamos FormData para enviar los archivos y los datos del formulario

    fetch('/Gafetes/save-form', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al enviar el formulario');
        }
        return response.json();
    })
    .then(data => {
        const badgeId = data.id;  // Obtenemos el ID correcto del gafete

        // Aquí obtenemos los parámetros de la URL y hacemos una petición para obtener los datos del gafete por ID
        const params = getQueryParams();
        const id = params.id || badgeId; // Usamos el ID del gafete guardado o el que se pasó en la URL

        fetch(`/Gafetes/datosQR/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del gafete');
                }
                return response.json();
            })
            .then(data => {
                const { qrCode, name: fetchedName, job: fetchedJob, photo: fetchedPhoto } = data;

                // Cargar y dibujar el diseño de fondo
                const designImg = new Image();
                designImg.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const imgWidth = designImg.naturalWidth;
                    const imgHeight = designImg.naturalHeight;
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;

                    const imgAspectRatio = imgWidth / imgHeight;
                    const canvasAspectRatio = canvasWidth / canvasHeight;

                    let drawWidth, drawHeight;

                    if (imgAspectRatio > canvasAspectRatio) {
                        drawWidth = canvasWidth;
                        drawHeight = canvasWidth / imgAspectRatio;
                    } else {
                        drawHeight = canvasHeight;
                        drawWidth = canvasHeight * imgAspectRatio;
                    }

                    const x = (canvasWidth - drawWidth) / 2;
                    const y = (canvasHeight - drawHeight) / 2;

                    ctx.drawImage(designImg, x, y, drawWidth, drawHeight);

                    // Dibujar la foto
                    if (photoFile) {
                        const photoUrl = URL.createObjectURL(photoFile);
                        const photoImg = new Image();
                        photoImg.onload = function() {
                            ctx.drawImage(photoImg, 20, 20, 100, 100); // Ajusta la posición y el tamaño de la foto
                            URL.revokeObjectURL(photoUrl); // Liberar el objeto URL después de usarlo
                        };
                        photoImg.onerror = function() {
                            console.error('No se pudo cargar la imagen de la foto.');
                        };
                        photoImg.src = photoUrl;
                    } else if (fetchedPhoto) {
                        const photoImg = new Image();
                        photoImg.onload = function() {
                            ctx.drawImage(photoImg, 20, 20, 100, 100); // Ajusta la posición y el tamaño de la foto
                        };
                        photoImg.src = fetchedPhoto;
                    }

                    // Dibujar el código QR
                    const qrImg = new Image();
                    qrImg.onload = function() {
                        ctx.drawImage(qrImg, 200, 300, 100, 100); // Ajusta la posición y el tamaño del código QR
                    };
                    qrImg.src = qrCode;

                    // Configurar fuente y color del texto
                    ctx.font = 'bold 26px Arial';
                    ctx.fillStyle = '#000000';

                    // Dibujar texto
                    ctx.fillText(fetchedName || name, 200, 100);
                    ctx.fillText('Puesto: ' + (fetchedJob || job), 140, 60);
                };
                designImg.onerror = function() {
                    console.error('No se pudo cargar la imagen de diseño.');
                };
                designImg.src = 'Diseño_Gafete/Gafete2.jpg'; // Usa la ruta relativa adecuada

                // Mostrar datos del gafete en la página
                const birthdate = new Date(data.birthdate).toISOString().split('T')[0];

                // Mostrar la tarjeta de datos
                document.getElementById('badge-container').style.display = 'block';
                document.getElementById('title').textContent = "Datos del Gafete";

                // Actualizar los elementos HTML con los datos obtenidos
                document.getElementById('photo').src = data.photo || 'ruta_a_imagen_por_defecto.jpg'; // Usar la imagen en Base64 o una imagen por defecto
                document.getElementById('name').textContent = `Nombre: ${data.name}`;
                document.getElementById('first-name').textContent = `Primer Nombre: ${data.first_name}`;
                document.getElementById('middle-name').textContent = `Segundo Nombre: ${data.middle_name}`;
                document.getElementById('birthdate').textContent = `Fecha de Nacimiento: ${birthdate}`;
                document.getElementById('telephone').textContent = `Teléfono: ${data.telephone}`;
                document.getElementById('celphone').textContent = `Celular: ${data.celphone}`;
                document.getElementById('email').textContent = `Correo Electrónico: ${data.email}`;
                document.getElementById('address').textContent = `Dirección: ${data.address}`;
                document.getElementById('alergia').textContent = `Alergias: ${data.alergia}`;
                document.getElementById('e_contact').textContent = `Contacto de Emergencia: ${data.e_contact}`;
                document.getElementById('parents').textContent = `Padres: ${data.parents}`;
                document.getElementById('e_contact_celphone').textContent = `Celular de Contacto de Emergencia: ${data.e_contact_celphone}`;
                document.getElementById('job').textContent = `Puesto: ${data.job}`;
                document.getElementById('departament').textContent = `Departamento: ${data.departament}`;
                document.getElementById('brigadista').textContent = `Brigadista: ${data.brigadista}`;

            })
            .catch(error => {
                console.error('Error al obtener los datos del gafete:', error);
                document.getElementById('title').textContent = "Error al cargar el gafete";
            });
    }); // Aquí se cierra el addEventListener
}); // Y aquí se cierra el script global
