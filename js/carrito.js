// Declarar la variable carrito como un array vacío al inicio del archivo
let carrito = [];

// Asegurarse de que la variable carrito se actualice correctamente al obtener los datos del servidor
function obtenerCarritoDelServidor() {
    fetch('http://localhost:3000/carrito')
        .then(response => response.json())
        .then(data => {
            carrito = data; // Actualizar la variable carrito con los datos del servidor
            actualizarCarritoEnPantalla(carrito);
        })
        .catch(error => {
            console.error('Error al obtener el carrito del servidor:', error);
        });
}

// Función para calcular el total del carrito
function calcularTotal(carrito) {
    return carrito.reduce((total, producto) => total + producto.price, 0);
}

// Modificar la función para manejar casos donde el precio no esté definido
function actualizarCarritoEnPantalla(carrito) {
    const listaCarrito = document.getElementById('carrito-lista');
    const totalCarrito = document.getElementById('carrito-total');
    listaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        const item = document.createElement('li');
        item.textContent = 'No hay productos en el carrito';
        listaCarrito.appendChild(item);
        totalCarrito.textContent = '0';
        // Mostrar también subtotal e IVA en 0
        mostrarSubtotalYIVA(0, 0);
    } else {
        let total = 0;
        carrito.forEach((producto, index) => {
            const item = document.createElement('li');
            const precio = producto.price || 0;
            const cantidad = producto.cantidad || 1;
            item.innerHTML = `
                <strong>Modelo:</strong> ${producto.name || 'Desconocido'} <br>
                <strong>Descripción:</strong> ${producto.description || 'Sin descripción'} <br>
                <strong>Precio:</strong> $${precio.toLocaleString('es-MX')} MXN <br>
                <strong>Cantidad:</strong> ${cantidad}
            `;
            // Botón para eliminar producto
            const btnEliminar = document.createElement('button');
            btnEliminar.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
            btnEliminar.className = 'btn-eliminar-producto';
            btnEliminar.style.backgroundColor = '#dc3545'; // Rojo
            btnEliminar.style.color = '#fff';
            btnEliminar.style.marginLeft = '16px';
            btnEliminar.style.float = 'right';
            btnEliminar.onclick = function() {
                eliminarProductoDelCarrito(index);
            };
            item.appendChild(document.createElement('br'));
            item.appendChild(btnEliminar);
            listaCarrito.appendChild(item);
            total += precio * cantidad;
        });
        totalCarrito.textContent = (total * 1.16).toLocaleString('es-MX'); // Mostrar total con IVA
        mostrarSubtotalYIVA(total, total * 0.16);
    }
}

// Función para mostrar el subtotal y el IVA en pantalla
function mostrarSubtotalYIVA(subtotal, iva) {
    let subtotalDiv = document.getElementById('carrito-subtotal-iva');
    if (!subtotalDiv) {
        subtotalDiv = document.createElement('div');
        subtotalDiv.id = 'carrito-subtotal-iva';
        subtotalDiv.style.marginTop = '8px';
        const totalDiv = document.querySelector('.carrito-total');
        totalDiv.parentNode.insertBefore(subtotalDiv, totalDiv);
    }
    subtotalDiv.innerHTML = `
        <strong>Subtotal:</strong> $${subtotal.toLocaleString('es-MX')} MXN<br>
        <strong>IVA (16%):</strong> $${iva.toLocaleString('es-MX')} MXN
    `;
}

function eliminarProductoDelCarrito(index) {
    // Eliminar producto del array local
    carrito.splice(index, 1);
    // Actualizar en el servidor
    fetch('http://localhost:3000/carrito', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carrito)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo eliminar el producto del carrito en el servidor.');
        }
        return response.json();
    })
    .then(() => {
        actualizarCarritoEnPantalla(carrito);
        mostrarAlerta('Producto eliminado del carrito.', 'success');
    })
    .catch(error => {
        console.error('Error al eliminar producto del carrito:', error);
        mostrarAlerta('⚠️ Error: No se pudo eliminar el producto del carrito.', 'error');
    });
}

// Llamar a la función para obtener el carrito al cargar la página
document.addEventListener('DOMContentLoaded', obtenerCarritoDelServidor);

// Validar stock antes de confirmar la compra (con cantidad)
function validarStockCarrito(carrito) {
    for (const producto of carrito) {
        if (producto.stock === undefined) {
            mostrarAlerta(`No se puede validar el stock de ${producto.name}.`, 'error');
            return false;
        }
        // Si el producto tiene una propiedad cantidad, validar contra el stock
        const cantidad = producto.cantidad || 1;
        if (producto.stock < cantidad) {
            mostrarAlerta(`No puedes comprar ${cantidad} unidades de ${producto.name}. Solo hay ${producto.stock} disponibles.`, 'error');
            return false;
        }
        if (producto.stock <= 0) {
            mostrarAlerta(`No hay stock disponible para: ${producto.name}`, 'error');
            return false;
        }
    }
    return true;
}

// Verificar si el carrito está vacío antes de confirmar la compra
document.getElementById('confirmar-compra').addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();

    if (!nombre || !correo) {
        mostrarAlerta('Por favor, completa el registro con tu nombre y correo antes de confirmar la compra.', 'error');
        return;
    }

    // Guardar datos en localStorage para la factura
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('correo', correo);

    // Enviar la compra al backend para actualizar el stock
    fetch('http://localhost:3000/confirmar-compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: nombre,
            correo: correo,
            carrito: carrito
        })
    })
    .then(async response => {
        const data = await response.json();
        if (data.correoEnviado) {
            mostrarAlerta('¡Factura enviada correctamente a tu correo!', 'success');
        } else {
            mostrarAlerta('La compra fue exitosa, pero no se pudo enviar la factura por correo.', 'error');
        }
        window.location.href = 'gracias.html';
    })
    .catch(error => {
        console.error('Error al confirmar la compra:', error);
        mostrarAlerta('⚠️ Error: No se pudo confirmar la compra ni actualizar el stock.', 'error');
    });
});

// Agregar preventDefault al formulario de registro
document.getElementById('form-registro').addEventListener('submit', (event) => {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    mostrarAlerta(`Registro exitoso para: ${nombre} (${correo})`, 'success');
    // Aquí puedes agregar lógica adicional para enviar los datos al servidor
});

// Modificar el botón "Realizar Otra Compra" para vaciar el carrito en el servidor
document.getElementById('otra-compra').addEventListener('click', () => {
    fetch('http://localhost:3000/carrito', {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo vaciar el carrito en el servidor.');
        }
        return response.json();
    })
    .then(() => {
        carrito = []; // Vaciar el carrito localmente
        actualizarCarritoEnPantalla(carrito); // Actualizar la vista del carrito
        window.location.href = 'modelos.html'; // Redirigir a modelos.html
    })
    .catch(error => {
        console.error('Error al vaciar el carrito:', error);
        mostrarAlerta('⚠️ Error: No se pudo agregar el producto al carrito.', 'error');
    });
});

// Funcionalidad para el botón 'Vaciar Carrito'
document.getElementById('vaciar-carrito').addEventListener('click', () => {
    fetch('http://localhost:3000/carrito', {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo vaciar el carrito en el servidor.');
        }
        return response.json();
    })
    .then(() => {
        carrito = []; // Vaciar el carrito localmente
        actualizarCarritoEnPantalla(carrito); // Actualizar la vista del carrito
        mostrarAlerta('El carrito ha sido vaciado.', 'success');
    })
    .catch(error => {
        console.error('Error al vaciar el carrito:', error);
        mostrarAlerta('⚠️ Error: No se pudo vaciar el carrito.', 'error');
    });
});

// Reemplazar alertas con elementos HTML estilizados
function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`; // Clase basada en el tipo de alerta
    alerta.textContent = mensaje;
    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3000); // Eliminar la alerta después de 3 segundos
}