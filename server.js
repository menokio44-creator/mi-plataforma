const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware para leer JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta a nuestra "base de datos" simple
const DB_PATH = path.join(__dirname, 'base-de-datos.json');

// Función para leer la base de datos de forma segura
const leerDB = () => {
    if (!fs.existsSync(DB_PATH)) return { tiendas: [], productos: [] };
    const data = fs.readFileSync(DB_PATH);
    return JSON.parse(data);
};

// Función para guardar en la base de datos
const guardarDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- RUTAS DE LA API ---

// 1. Crear una tienda
app.post('/api/tiendas', (req, res) => {
    const { nombre } = req.body;
    const db = leerDB();
    if (db.tiendas.find(t => t.nombre === nombre)) {
        return res.status(400).json({ error: "La tienda ya existe" });
    }
    db.tiendas.push({ nombre });
    guardarDB(db);
    res.json({ success: true });
});

// 2. Agregar un producto
app.post('/api/productos', (req, res) => {
    const { tienda, nombre, precio, imagen } = req.body;
    const db = leerDB();
    db.productos.push({ tienda, nombre, precio, imagen });
    guardarDB(db);
    res.json({ success: true });
});

// 3. Obtener productos de una tienda específica
app.get('/api/productos/:tienda', (req, res) => {
    const db = leerDB();
    const filtrados = db.productos.filter(p => p.tienda === req.params.tienda);
    res.json(filtrados);
});

// --- RUTAS DE NAVEGACIÓN ---

// Ruta para ver la tienda pública
app.get('/tienda/:nombre', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tienda.html'));
});

// Ruta para el panel
app.get('/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'panel.html'));
});

// --- CONFIGURACIÓN DE PUERTO PARA RENDER ---
// Importante: Render usa la variable process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('-----------------------------------------');
    console.log(`🚀 SERVIDOR FUNCIONANDO`);
    console.log(`📍 Puerto: ${PORT}`);
    console.log('-----------------------------------------');
});