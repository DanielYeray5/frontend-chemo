// Array para almacenar los productos en el carrito
let carrito = [];

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
    carrito.push(producto);
    console.log(`Producto agregado: ${producto}`);
    console.log('Carrito actual:', carrito);
    actualizarCarrito();
}

// Función para conectar los botones de agregar al carrito
function inicializarBotonesCarrito() {
    const botones = document.querySelectorAll('.modelo button');
    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            const producto = boton.parentElement.querySelector('h3').textContent;
            agregarAlCarrito(producto);
        });
    });
}

// Inicializar los botones al cargar la página
document.addEventListener('DOMContentLoaded', inicializarBotonesCarrito);

// Función para mostrar/ocultar el carrito desplegable
function toggleCarrito() {
    const carritoDesplegable = document.getElementById('carrito-desplegable');
    carritoDesplegable.classList.toggle('oculto');
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

// Modificar la función actualizarCarrito para manejar el caso de carrito vacío
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
            item.textContent = producto;
            listaCarrito.appendChild(item);
        });
    }
}

// Asignar evento al botón de toggle del carrito
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-carrito');
    toggleButton.addEventListener('click', toggleCarrito);
});

// Asignar eventos para mostrar y ocultar el carrito al pasar el cursor
document.addEventListener('DOMContentLoaded', () => {
    const menuCarrito = document.querySelector('.menu-carrito');
    menuCarrito.addEventListener('mouseenter', mostrarCarrito);
    menuCarrito.addEventListener('mouseleave', ocultarCarrito);
});

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.querySelector('.modelos-grid');
    if (!grid) return;

    // Obtener autos desde el backend
    let autos = [];
    try {
        const res = await fetch('http://localhost:3000/cars');
        autos = await res.json();
    } catch (e) {
        grid.innerHTML = '<p style="color:red">No se pudieron cargar los autos.</p>';
        return;
    }

    function mostrarAleatorios() {
        grid.innerHTML = '';
        // Seleccionar 3 autos aleatorios
        const seleccionados = autos.sort(() => 0.5 - Math.random()).slice(0, 3);
        seleccionados.forEach((auto, i) => {
            const div = document.createElement('div');
            div.className = 'modelo animado';
            div.style.animationDelay = `${i * 0.2}s`;
            // Usar la propiedad 'image' directamente si existe
            let imgFile = auto.image;
            // Si la imagen empieza con /images/ quitar el primer slash para que funcione en frontend
            if (imgFile && imgFile.startsWith('/images/')) {
                imgFile = imgFile.substring(1); // quita el primer /
            }
            // Si la imagen es una URL absoluta, úsala tal cual
            let imgSrc = imgFile && (imgFile.startsWith('http://') || imgFile.startsWith('https://'))
                ? imgFile
                : (imgFile ? imgFile : 'images/default.jpg');
            div.innerHTML = `
                <img src="${imgSrc}" alt="${auto.name}">
                <h3>${auto.name}</h3>
                <p>Año: ${auto.year || ''}</p>
                <p>Precio: $${auto.price ? auto.price.toLocaleString('es-MX') : ''} MXN</p>
            `;
            grid.appendChild(div);
        });
    }

    mostrarAleatorios();
    setInterval(mostrarAleatorios, 4000);
});