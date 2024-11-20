const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
const QRCode = require('qrcode');
const fs = require('fs');





const app = express();
const PORT = process.env.PORT || 3000;

// Deshabilitar caché en todas las respuestas
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/Gafetes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'linkinpark12',
    database: 'agendacitas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/Gafetes/save-form', upload.single('photo'), (req, res) => {
    const formData = req.body;
    const photoBuffer = req.file ? req.file.buffer : null;

    const sql = `INSERT INTO gafetes (photo, name, birthdate, telephone, celphone, address, alergia, e_contact, parents, e_contact_celphone, job, departament, brigadista, type_blood)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        photoBuffer,
        formData.name,
        formData.birthdate,
        formData.telephone,
        formData.celphone,
        formData.address,
        formData.alergia,
        formData.e_contact,
        formData.parents,
        formData.e_contact_celphone,
        formData.job,
        formData.departament,
        formData.brigadista,
        formData.type_blood
    ];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err);
            return res.status(500).json({ error: 'Error al guardar los datos', details: err.message });
        }
        const id = result.insertId;
        const urlToRedirect = `https://coventryschool.edu.mx/Gafetes/DatosQR.html?id=${id}`;
        QRCode.toDataURL(urlToRedirect, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).json({ error: 'Error al generar el código QR', details: err.message });
            }
            const photoBase64 = photoBuffer ? photoBuffer.toString('base64') : null;
            const photoUrl = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;

            res.json({ ...formData, qrCode, id, photo: photoUrl });
        });
    });
});


app.delete('/Gafetes/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM gafetes WHERE id = ?';

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el usuario:', err);
            return res.status(500).send('Error al eliminar el usuario');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.send('Usuario eliminado correctamente');
    });
});





app.get('/Gafetes/Tabla', (req, res) => {
    const sql = 'SELECT * FROM gafetes';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            return res.status(500).send('Error al obtener los datos');
        }

        // Función para formatear la fecha en YYYY-MM-DD
        const formatDate = (date) => {
            if (!date || date === '0000-00-00') return 'No disponible';
            const jsDate = new Date(date);
            const year = jsDate.getFullYear();
            const month = String(jsDate.getMonth() + 1).padStart(2, '0');
            const day = String(jsDate.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Función para capitalizar la primera letra de cada palabra
        const capitalizeWords = (text) => {
            return text.split(' ').map(word => {
                if (word.length > 0) {
                    // Capitaliza solo la primera letra, el resto se convierte en minúsculas
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                return word;
            }).join(' ');
        };

        // Generar el HTML de la tabla con el botón de "Agregar Usuario"
            let tableHTML = `
                <button class="btn btn-gradient mb-2 Agregar" onclick="openAddUserModal()">Agregar Usuario</button>
                <div class="input-group mb-0 custom-margin">
                    <span class="input-group-text" id="search-addon">Buscar por nombre</span>
                    <input id="searchInput" type="text" class="form-control" placeholder="Nombre Completo" aria-label="Buscar por nombre" aria-describedby="search-addon">
                </div>
                <table class="table table-bordered table-hover align-middle mt-2" id="clientsTable">
                    <thead class="table-primary">
                        <tr>
                            <th><i class="fas fa-id-badge"></i> ID</th>
                            <th><i class="fas fa-user"></i> Nombre Completo</th>
                            <th><i class="fas fa-calendar"></i> Fecha de Nacimiento</th>
                            <th><i class="fas fa-map-marker-alt"></i> Dirección</th>
                            <th><i class="fas fa-briefcase"></i> Puesto de Trabajo</th>
                            <th><i class="fas fa-cogs"></i> Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;


        // Iterar sobre los resultados y agregar filas a la tabla
        results.forEach(cliente => {
            const birthdate = formatDate(cliente.birthdate);

            tableHTML += `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${capitalizeWords(cliente.name)}</td>
                    <td>${birthdate}</td>
                    <td>${capitalizeWords(cliente.address)}</td>
                    <td>${capitalizeWords(cliente.job)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn button-add btn-sm" onclick="showQRCode(${cliente.id})">Mostrar QR</button>
                            <form action="/Gafetes/uploadPhoto/${cliente.id}" method="POST" enctype="multipart/form-data" style="display:inline;">
                                <input type="file" name="photo" accept="image/*" style="display:none;" onchange="this.form.submit()">
                                <button type="button" class="btn button-photo btn-primary btn-sm" onclick="this.previousElementSibling.click()">Subir Imagen</button>
                            </form>
                            <button class="btn button-edit btn-sm" onclick="openUpdateForm(${cliente.id})">Actualizar</button>
                            <button class="btn button-delete btn-sm" onclick="deleteUser(${cliente.id})">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>

            <!-- Modal de Actualización -->
            <div class="modal fade" id="updateModal" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="updateModalLabel">Actualizar Gafete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="updateForm" onsubmit="submitUpdateForm(event)">
                                <label for="updateName">Nombre Completo</label>
                                <input type="text" id="updateName" class="form-control mb-2" required>

                                <label for="updateBirthdate">Fecha de Nacimiento</label>
                                <input type="date" id="updateBirthdate" class="form-control mb-2">

                                <label for="updateTelephone">Teléfono</label>
                                <input type="text" id="updateTelephone" class="form-control mb-2">

                                <label for="updateCelphone">Celular</label>
                                <input type="text" id="updateCelphone" class="form-control mb-2">

                                <label for="updateAddress">Dirección</label>
                                <input type="text" id="updateAddress" class="form-control mb-2">

                                <label for="updateAlergia">Alergia</label>
                                <input type="text" id="updateAlergia" class="form-control mb-2">

                                <label for="updateEContact">Contacto de Emergencia</label>
                                <input type="text" id="updateEContact" class="form-control mb-2">

                                <label for="updateParents">Padres</label>
                                <input type="text" id="updateParents" class="form-control mb-2">

                                <label for="updateEContactCelphone">Celular Contacto Emergencia</label>
                                <input type="text" id="updateEContactCelphone" class="form-control mb-2">

                                <label for="updateJob">Puesto de Trabajo</label>
                                <input type="text" id="updateJob" class="form-control mb-2">

                                <label for="updateDepartament">Departamento</label>
                                <input type="text" id="updateDepartament" class="form-control mb-2">

                                <label for="updateBrigadista">Brigadista</label>
                                <input type="text" id="updateBrigadista" class="form-control mb-2">

                                <label for="updateTypeBlood">Tipo de Sangre</label>
                                <input type="text" id="updateTypeBlood" class="form-control mb-2">

                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Agregar Usuario -->
            <div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addUserModalLabel">Agregar Nuevo Usuario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="addUserForm" onsubmit="submitAddUserForm(event)">
                                <label for="addName">Nombre Completo</label>
                                <input type="text" id="addName" class="form-control mb-2" required>

                                <label for="addBirthdate">Fecha de Nacimiento</label>
                                <input type="date" id="addBirthdate" class="form-control mb-2">

                                <label for="addTelephone">Teléfono</label>
                                <input type="text" id="addTelephone" class="form-control mb-2">

                                <label for="addCelphone">Celular</label>
                                <input type="text" id="addCelphone" class="form-control mb-2">

                                <label for="addAddress">Dirección</label>
                                <input type="text" id="addAddress" class="form-control mb-2">

                                <label for="addAlergia">Alergia</label>
                                <input type="text" id="addAlergia" class="form-control mb-2">

                                <label for="addEContact">Contacto de Emergencia</label>
                                <input type="text" id="addEContact" class="form-control mb-2">

                                <label for="addParents">Padres</label>
                                <input type="text" id="addParents" class="form-control mb-2">

                                <label for="addEContactCelphone">Celular Contacto Emergencia</label>
                                <input type="text" id="addEContactCelphone" class="form-control mb-2">

                                <label for="addJob">Puesto de Trabajo</label>
                                <input type="text" id="addJob" class="form-control mb-2">

                                <label for="addDepartament">Departamento</label>
                                <input type="text" id="addDepartament" class="form-control mb-2">

                                <label for="addBrigadista">Brigadista</label>
                                <input type="text" id="addBrigadista" class="form-control mb-2">

                                <label for="addTypeBlood">Tipo de Sangre</label>
                                <input type="text" id="addTypeBlood" class="form-control mb-2">

                                <button type="submit" class="btn btn-primary">Guardar Usuario</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Devolver la tabla en formato HTML
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="icon" href="/Diseño_Gafete/icono.jpg" type="image/jpeg">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700;700&display=swap" rel="stylesheet">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="/tabla.css">
                <title>Tabla de Gafetes</title>
                <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
            </head>
            <body>
                <div class="container mt-6 overflow-auto">
                    <h1 class="display-4">Gafetes QR</h1>
                    ${tableHTML}
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
                <script src="/js/scriptTabla.js"></script>
                <script src="/js/script2.js></script>
            </body>
            </html>
        `);
    });
});






app.put('/Gafetes/update/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    // Si la fecha de nacimiento es null o está vacía, usar NULL
    const birthdate = updatedData.birthdate || null;

    const sql = `
        UPDATE gafetes SET
            name = ?, birthdate = ?, telephone = ?, celphone = ?, address = ?, 
            alergia = ?, e_contact = ?, parents = ?, e_contact_celphone = ?, 
            job = ?, departament = ?, brigadista = ?, type_blood = ?
        WHERE id = ?`;

    const values = [
        updatedData.name,
        birthdate,
        updatedData.telephone,
        updatedData.celphone,
        updatedData.address,
        updatedData.alergia,
        updatedData.e_contact,
        updatedData.parents,
        updatedData.e_contact_celphone,
        updatedData.job,
        updatedData.departament,
        updatedData.brigadista,
        updatedData.type_blood,
        id
    ];

    connection.query(sql, values, (err) => {
        if (err) {
            console.error('Error al actualizar los datos:', err);
            return res.status(500).json({ error: 'Error al actualizar los datos', details: err.message });
        }
        res.send('Datos actualizados correctamente');
    });
});




app.get('/Gafetes/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM gafetes WHERE id = ?';

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el gafete:', err);
            return res.status(500).json({ error: 'Error al obtener los datos del gafete' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Gafete no encontrado' });
        }
        res.json(results[0]); // Devolver solo el primer resultado como JSON
    });
});




// Endpoint para subir foto individual
app.post('/Gafetes/uploadPhoto/:id', upload.single('photo'), (req, res) => {
    const { id } = req.params;
    const photoBuffer = req.file ? req.file.buffer : null;

    if (!photoBuffer) {
        return res.status(400).send('No se subió ninguna imagen');
    }

    const sql = 'UPDATE gafetes SET photo = ? WHERE id = ?';
    connection.query(sql, [photoBuffer, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la imagen:', err);
            return res.status(500).send('Error al actualizar la imagen');
        }
        res.redirect('/Gafetes/Tabla'); // Redirige a la tabla después de actualizar la imagen
    });
});














// Ruta para servir el archivo HTML buscarGafete.html
app.get('/Gafetes/BuscarGafete', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buscarGafete.html'));
});








app.get('/Gafetes/datosQR/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM gafetes WHERE id = ?';

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al obtener los datos');
        }
        if (results.length === 0) {
            return res.status(404).send('Gafete no encontrado');
        }
        const formData = results[0];
        const photoBase64 = formData.photo ? formData.photo.toString('base64') : null;
        const photoUrl = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;
        const urlToRedirect = `https://coventryschool.edu.mx/Gafetes/DatosQR.html?id=${id}`;
        QRCode.toDataURL(urlToRedirect, (err, qrCode) => {
            if (err) {
                console.error('Error al generar el código QR:', err);
                return res.status(500).send('Error al generar el código QR');
            }

            res.json({ ...formData, qrCode, photo: photoUrl });
        });
    });
});



// Servir el archivo HTML para mostrar los códigos QR
app.get('/AllQR/Codigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'CodigosQR.html'));
});



app.get('/AllQR', async (req, res) => {
    console.log('Ruta /AllQR fue llamada');
    const sql = 'SELECT id, name FROM gafetes'; // Obtenemos ID y nombre desde la base de datos

    connection.query(sql, async (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).send('Error al obtener los datos');
        }

        if (results.length === 0) {
            console.warn('No se encontraron gafetes en la base de datos');
            return res.status(404).send('No se encontraron gafetes');
        }

        try {
            const qrDataArray = [];

            // Iteramos sobre los resultados y generamos los QR
            for (const { id, name } of results) {
                // Generamos un enlace personalizado para el QR basado en el ID del usuario
                const qrLink = `https://coventryschool.edu.mx/Gafetes/DatosQR.html?id=${id}`;

                // Generamos el código QR como un Data URL
                const qrCode = await QRCode.toDataURL(qrLink);

                // Añadimos los datos al array
                qrDataArray.push({
                    id,
                    name,
                    qrCode,
                    link: qrLink, // Incluimos el enlace personalizado en los datos
                });
            }

            console.log('Códigos QR generados:', qrDataArray);
            res.json(qrDataArray); // Devolvemos todos los datos generados
        } catch (error) {
            console.error('Error al generar los códigos QR:', error);
            res.status(500).send('Error al generar los códigos QR');
        }
    });
});








const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en https://coventryschool.edu.mx:Gafetes`);
});

// Configurar timeout sin límite para las conexiones
server.setTimeout(0); // 0 significa sin límite de timeout