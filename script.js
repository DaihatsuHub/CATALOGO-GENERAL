// ========== CONFIGURACIÓN ==========
const CONFIG = {
    CSV_FILE: "PRODUCTOS.csv",
    FOTO_FOLDERS: ["FOTOS1", "FOTOS2", "FOTOS3", "FOTOS4", "FOTOS5", "FOTOS6"],
    FALLBACK_IMAGE: "noimg.jpg",
    DEBOUNCE_DELAY: 300
};

// ========== ESTADO GLOBAL ==========
let productos = [];
let rubros = new Set();
let rubroActual = "";
let imagenCache = new Map();
let searchTimeout = null;

// ========== ELEMENTOS DOM ==========
const elementos = {
    rubrosLista: null,
    productos: null,
    buscador: null,
    loading: null,
    sinResultados: null,
    btnLimpiar: null,
    toggleMenu: null,
    rubrosNav: null
};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarElementos();
    inicializarEventos();
    cargarProductos();
});

function inicializarElementos() {
    elementos.rubrosLista = document.getElementById('rubros-lista');
    elementos.productos = document.getElementById('productos');
    elementos.buscador = document.getElementById('buscador');
    elementos.loading = document.getElementById('loading');
    elementos.sinResultados = document.getElementById('sin-resultados');
    elementos.btnLimpiar = document.getElementById('limpiar-busqueda');
    elementos.toggleMenu = document.getElementById('toggle-menu');
    elementos.rubrosNav = document.getElementById('rubros');
}

function inicializarEventos() {
    // Buscador con debounce
    elementos.buscador.addEventListener('input', manejarBusqueda);
    
    // Botón limpiar búsqueda
    elementos.btnLimpiar.addEventListener('click', limpiarBusqueda);
    
    // Toggle menú móvil
    elementos.toggleMenu.addEventListener('click', toggleMenu);
    
    // Cerrar menú al hacer click fuera (móvil)
    elementos.rubrosNav.addEventListener('click', (e) => {
        if (e.target === elementos.rubrosNav && window.innerWidth <= 768) {
            cerrarMenu();
        }
    });
}

// ========== UTILIDADES ==========
function formatPrecio(precio) {
    const numero = Number(precio);
    if (isNaN(numero)) return "$ 0";
    return "$ " + numero.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function sanitizarTexto(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function mostrarLoading(mostrar) {
    elementos.loading.classList.toggle('hidden', !mostrar);
}

function mostrarSinResultados(mostrar) {
    elementos.sinResultados.classList.toggle('hidden', !mostrar);
}

// ========== MENÚ MÓVIL ==========
function toggleMenu() {
    elementos.rubrosNav.classList.toggle('active');
}

function cerrarMenu() {
    elementos.rubrosNav.classList.remove('active');
}

// ========== BÚSQUEDA DE IMÁGENES ==========
async function buscarImagen(codigo) {
    // Revisar caché primero
    if (imagenCache.has(codigo)) {
        return imagenCache.get(codigo);
    }

    // Buscar en carpetas
    for (const folder of CONFIG.FOTO_FOLDERS) {
        const url = `${folder}/${codigo}.jpg`;
        try {
            const existe = await verificarImagen(url);
            if (existe) {
                imagenCache.set(codigo, url);
                return url;
            }
        } catch (error) {
            continue;
        }
    }

    // Fallback
    imagenCache.set(codigo, CONFIG.FALLBACK_IMAGE);
    return CONFIG.FALLBACK_IMAGE;
}

function verificarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// ========== CARGA DE CSV ==========
async function cargarProductos() {
    mostrarLoading(true);
    
    try {
        const response = await fetch(CONFIG.CSV_FILE);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const text = await response.text();
        procesarCSV(text);
        
        crearRubros();
        
        // Mostrar primer rubro
        if (rubros.size > 0) {
            mostrarRubro([...rubros][0]);
        }
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        elementos.productos.innerHTML = `
            <div class="sin-resultados">
                <p>⚠️ Error al cargar el catálogo. Por favor, recarga la página.</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    } finally {
        mostrarLoading(false);
    }
}

function procesarCSV(text) {
    const lines = text.trim().split("\n");
    if (lines.length === 0) return;
    
    const headers = lines[0].split(";").map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";").map(c => c.trim());
        if (cols.length < 3) continue;
        
        const obj = {};
        headers.forEach((header, j) => {
            obj[header] = cols[j] || "";
        });
        
        productos.push(obj);
        
        if (obj.RUBRO) {
            rubros.add(obj.RUBRO);
        }
    }
    
    // Ordenar productos por código
    productos.sort((a, b) => a.CODIGO.localeCompare(b.CODIGO));
}

// ========== RUBROS ==========
function crearRubros() {
    elementos.rubrosLista.innerHTML = '';
    
    [...rubros].sort().forEach(rubro => {
        const button = document.createElement('button');
        button.textContent = rubro;
        button.setAttribute('aria-label', `Ver productos de ${rubro}`);
        button.addEventListener('click', () => {
            mostrarRubro(rubro);
            if (window.innerWidth <= 768) {
                cerrarMenu();
            }
        });
        elementos.rubrosLista.appendChild(button);
    });
}

function actualizarRubroActivo(rubro) {
    const botones = elementos.rubrosLista.querySelectorAll('button');
    botones.forEach(btn => {
        btn.classList.toggle('active', btn.textContent === rubro);
    });
}

async function mostrarRubro(rubro) {
    rubroActual = rubro;
    
    // Actualizar fondo
    const className = 'bg-' + rubro.replace(/ /g, '-');
    document.body.className = className;
    
    // Actualizar botón activo
    actualizarRubroActivo(rubro);
    
    // Limpiar búsqueda
    elementos.buscador.value = '';
    elementos.btnLimpiar.classList.remove('visible');
    
    // Filtrar productos
    const listaProductos = productos.filter(p => p.RUBRO === rubro);
    
    await renderizarProductos(listaProductos);
}

// ========== RENDERIZADO DE PRODUCTOS ==========
async function renderizarProductos(listaProductos) {
    elementos.productos.innerHTML = '';
    mostrarSinResultados(false);
    
    if (listaProductos.length === 0) {
        mostrarSinResultados(true);
        return;
    }
    
    // Renderizar productos en lotes para mejor performance
    const BATCH_SIZE = 12;
    
    for (let i = 0; i < listaProductos.length; i += BATCH_SIZE) {
        const batch = listaProductos.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
            batch.map(producto => renderizarProducto(producto))
        );
        
        // Pequeña pausa para no bloquear el UI
        if (i + BATCH_SIZE < listaProductos.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
}

async function renderizarProducto(producto) {
    const imgUrl = await buscarImagen(producto.CODIGO);
    
    const div = document.createElement('div');
    div.className = 'producto';
    div.setAttribute('role', 'listitem');
    
    const descripcion = [
        producto.LINEA1,
        producto.LINEA2,
        producto.LINEA3,
        producto.LINEA4
    ].filter(Boolean).map(sanitizarTexto).join('<br>');
    
    div.innerHTML = `
        <img 
            src="${imgUrl}" 
            alt="${sanitizarTexto(producto.LINEA1 || producto.CODIGO)}"
            loading="lazy"
        >
        <h3>${sanitizarTexto(producto.CODIGO)}</h3>
        <div class="descripcion">${descripcion}</div>
        <div class="precio">${formatPrecio(producto.PRECIO)}</div>
    `;
    
    elementos.productos.appendChild(div);
}

// ========== BÚSQUEDA ==========
function manejarBusqueda(e) {
    const texto = e.target.value.trim();
    
    // Mostrar/ocultar botón limpiar
    elementos.btnLimpiar.classList.toggle('visible', texto.length > 0);
    
    // Limpiar timeout anterior
    clearTimeout(searchTimeout);
    
    // Si está vacío, volver al rubro actual
    if (texto === '') {
        if (rubroActual) {
            mostrarRubro(rubroActual);
        }
        return;
    }
    
    // Debounce
    searchTimeout = setTimeout(() => {
        realizarBusqueda(texto);
    }, CONFIG.DEBOUNCE_DELAY);
}

async function realizarBusqueda(texto) {
    const textoLower = texto.toLowerCase();
    
    // Cambiar fondo a neutral
    document.body.className = 'bg-default';
    
    // Desactivar todos los botones de rubro
    const botones = elementos.rubrosLista.querySelectorAll('button');
    botones.forEach(btn => btn.classList.remove('active'));
    
    const resultados = productos.filter(p =>
        p.CODIGO.toLowerCase().includes(textoLower) ||
        (p.LINEA1 || '').toLowerCase().includes(textoLower) ||
        (p.LINEA2 || '').toLowerCase().includes(textoLower) ||
        (p.RUBRO || '').toLowerCase().includes(textoLower)
    );
    
    await renderizarProductos(resultados);
}

function limpiarBusqueda() {
    elementos.buscador.value = '';
    elementos.btnLimpiar.classList.remove('visible');
    
    if (rubroActual) {
        mostrarRubro(rubroActual);
    }
    
    elementos.buscador.focus();
}

// ========== MANEJO DE ERRORES GLOBAL ==========
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rechazada:', e.reason);
});
