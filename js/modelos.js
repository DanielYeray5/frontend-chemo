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

document.addEventListener('DOMContentLoaded', () => {
    // Obtener los modelos desde el backend
    fetch('http://localhost:3000/cars')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los modelos desde el servidor.');
            }
            return response.json();
        })
        .then(modelos => {
            const modelosGrid = document.getElementById('modelos-grid');
            modelosGrid.innerHTML = '';

            modelos.forEach(modelo => {
                const modeloDiv = document.createElement('div');
                modeloDiv.className = 'modelo';
                modeloDiv.innerHTML = `
                    <img src="${modelo.image}" alt="${modelo.name}">
                    <div class="modelo-info">
                        <h3>${modelo.name}</h3>
                        <p>${modelo.description}</p>
                        <p>Precio: $${modelo.price.toLocaleString('es-MX')} MXN</p>
                        <button class="btn-comprar">Comprar</button>
                    </div>
                `;
                modelosGrid.appendChild(modeloDiv);

                // Agregar evento al botón de comprar
                const boton = modeloDiv.querySelector('.btn-comprar');
                boton.addEventListener('click', () => {
                    agregarAlCarrito(boton);
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar los modelos:', error);
            mostrarAlerta('⚠️ Error al cargar los modelos.', 'error');
        });
});