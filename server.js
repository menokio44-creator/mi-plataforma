const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Herramienta para leer/escribir archivos

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- SISTEMA DE GUARDADO (PERSISTENCIA) ---
const ARCHIVO_DB = 'base-de-datos.json';

// 1. Variables en memoria
let datos = {
    tiendas: [],
    productos: []
};

// 2. Función para CARGAR datos al iniciar
function cargarDatos() {
    try {
        if (fs.existsSync(ARCHIVO_DB)) {
            const contenido = fs.readFileSync(ARCHIVO_DB, 'utf-8');
            datos = JSON.parse(contenido);
            console.log("💾 Datos cargados correctamente del archivo.");
        } else {
            console.log("🆕 Archivo no existe. Se creará uno nuevo al guardar.");
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

// 3. Función para GUARDAR datos en el disco
function guardarDatos() {
    try {
        fs.writeFileSync(ARCHIVO_DB, JSON.stringify(datos, null, 2));
        console.log("💾 Cambios guardados en el disco duro.");
    } catch (error) {
        console.error("Error al guardar datos:", error);
    }
}

// Cargamos los datos apenas arranca el servidor
cargarDatos();


// --- RUTAS (API) ---

app.post('/api/crear-tienda', (req, res) => {
    const nuevaTienda = req.body;
    
    // Validar si ya existe
    const existe = datos.tiendas.find(t => t.nombre === nuevaTienda.nombre);
    if(existe) {
        return res.json({ success: false, mensaje: "Ese nombre ya existe" });
    }

    datos.tiendas.push(nuevaTienda);
    guardarDatos(); // <--- AQUÍ GUARDAMOS PARA SIEMPRE
    
    console.log("🔥 Nueva Tienda:", nuevaTienda.nombre);
    res.json({ success: true });
});

app.post('/api/productos', (req, res) => {
    const nuevoProducto = req.body;
    datos.productos.push(nuevoProducto);
    guardarDatos(); // <--- AQUÍ GUARDAMOS PARA SIEMPRE
    
    console.log("📦 Nuevo Producto agregado:", nuevoProducto.nombre);
    res.json({ success: true });
});

app.get('/api/productos/:nombreTienda', (req, res) => {
    const tienda = req.params.nombreTienda;
    const misProductos = datos.productos.filter(p => p.tienda === tienda);
    res.json(misProductos);
});

// Ruta para ver la tienda pública
app.get('/tienda/:nombreTienda', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tienda.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Servidor BLINDADO listo en: http://localhost:${PORT}`);
});