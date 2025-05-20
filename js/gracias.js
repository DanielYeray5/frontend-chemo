// Script para descargar una factura con productos, subtotal, IVA, total, nombre y correo

document.getElementById('descargar-factura').addEventListener('click', () => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const nombre = localStorage.getItem('nombre') || 'Cliente';
    const correo = localStorage.getItem('correo') || '';
    let factura = `Factura de compra\n---------------------\nNombre: ${nombre}\nCorreo: ${correo}\nFecha: ${(new Date()).toLocaleDateString()}\n\nProductos:\n`;
    let subtotal = 0;
    carrito.forEach((producto, i) => {
        const cantidad = producto.cantidad || 1;
        const precio = producto.price || 0;
        factura += `${i + 1}. ${producto.name} x${cantidad} - $${precio.toLocaleString('es-MX')} MXN\n`;
        subtotal += precio * cantidad;
    });
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    factura += `\nSubtotal: $${subtotal.toLocaleString('es-MX')} MXN`;
    factura += `\nIVA (16%): $${iva.toLocaleString('es-MX')} MXN`;
    factura += `\nTotal: $${total.toLocaleString('es-MX')} MXN`;
    factura += `\n\n¡Gracias por tu compra en SuperCars!`;

    const blob = new Blob([factura], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'factura.txt';
    link.click();
});

document.getElementById('volver-inicio').addEventListener('click', function() {
    window.location.href = 'index.html';
});
