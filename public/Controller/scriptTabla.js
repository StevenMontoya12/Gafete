document.addEventListener('DOMContentLoaded', function() {
    fetch('/Tabla') // Obtiene los datos en JSON desde la ruta `/Tabla`
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.querySelector('#clientsTable tbody');
            data.forEach(cliente => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.name}</td>
                    <td>${cliente.first_name}</td>
                    <td><button onclick="showQRCode(${cliente.id})">Mostrar QR</button></td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Función para mostrar el código QR
function showQRCode(id) {
    const urlToRedirect = `https://coventryschool.edu.mx/Gafetes/DatosQR.html?id=${id}`; // URL con el ID actual

    QRCode.toDataURL(urlToRedirect, { errorCorrectionLevel: 'H' }, (err, qrCode) => {
        if (err) {
            console.error('Error al generar el código QR:', err);
            return;
        }

        const img = document.createElement('img');
        img.src = qrCode;
        img.alt = 'Código QR';
        const qrCodeWindow = window.open('', '_blank');
        qrCodeWindow.document.write('<html><head><title>Código QR</title></head><body>');
        qrCodeWindow.document.write('<h1>Código QR</h1>');
        qrCodeWindow.document.write(img.outerHTML);
        qrCodeWindow.document.write('</body></html>');
        qrCodeWindow.document.close();
    });
}
