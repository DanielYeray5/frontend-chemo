// Array para almacenar los productos en el carrito
let carrito = [];

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

// Modificar la función enviarProductoAlServidor para manejar errores
function enviarProductoAlServidor(producto) {
    fetch('http://localhost:3000/carrito', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ producto })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo agregar el producto al carrito.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Producto enviado al servidor:', data);
    })
    .catch(error => {
        console.error('Error al enviar el producto al servidor:', error);
        mostrarAlerta('⚠️ Error: No se pudo agregar el producto al carrito.', 'error');
    });
}

// Modificar la función para enviar un objeto completo al carrito
function agregarAlCarrito(boton) {
    const modeloDiv = boton.parentElement;
    const producto = {
        name: modeloDiv.querySelector('h3').textContent,
        description: modeloDiv.querySelector('p').textContent,
        price: parseFloat(modeloDiv.querySelector('p:nth-of-type(2)').textContent.replace(/[^0-9.-]+/g, ''))
    };

    carrito.push(producto);
    console.log(`Producto agregado:`, producto);
    console.log('Carrito actual:', carrito);
    actualizarCarrito();
    enviarProductoAlServidor(producto);
    mostrarAlerta(`Has agregado el producto: ${producto.name} al carrito de compras.`, 'success');
}

// Función para mostrar el carrito al pasar el cursor
function mostrarCarrito() {
    const carritoDesplegable = document.getElementById('carrito-desplegable');
    carritoDesplegable.classList.remove('oculto');
}

// Función para ocultar el carrito cuando se quita el cursor
function ocultarCarrito() {
    const carritoDesplegable = document.getElementById('carrito-desplegable');
    carritoDesplegable.classList.add('oculto');
}

// Función para actualizar la lista del carrito
function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    listaCarrito.innerHTML = '';
    if (carrito.length === 0) {
        const item = document.createElement('li');
        item.textContent = 'No hay productos agregados';
        listaCarrito.appendChild(item);
    } else {
        carrito.forEach(producto => {
            const item = document.createElement('li');
            item.textContent = `${producto.name} - ${producto.description} - $${producto.price.toFixed(2)}`;
            listaCarrito.appendChild(item);
        });
    }
}

// Asignar eventos para mostrar y ocultar el carrito al pasar el cursor
document.addEventListener('DOMContentLoaded', () => {
    const menuCarrito = document.querySelector('.menu-carrito');
    menuCarrito.addEventListener('mouseenter', mostrarCarrito);
    menuCarrito.addEventListener('mouseleave', ocultarCarrito);
});

// Inicializar botones de agregar al carrito
document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.modelo button');
    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            agregarAlCarrito(boton);
        });
    });
});