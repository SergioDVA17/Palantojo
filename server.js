// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde public
app.use(express.static(path.join(__dirname, 'public')));

// Servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Palan_DB',
  port: 3306
});

db.connect(err => {
  if (err) console.error('❌ Error conectando a MySQL:', err);
  else console.log('✅ Conectado a MySQL');
});

// Configuración multer para subir fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ---------- RUTA DE REGISTRO ----------
app.post('/register', upload.single('fotoPerfil'), async (req, res) => {
  const { nombres, apellidos, correo, username, password } = req.body;
  if (!nombres || !apellidos || !correo || !username || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    db.query(
      'SELECT id FROM users WHERE username = ? OR correo = ?',
      [username, correo],
      async (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos', err });
        if (rows.length > 0) {
          return res.status(409).json({ message: 'El nombre de usuario o correo ya está en uso' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fotoPerfil = req.file ? '/uploads/' + req.file.filename : '/uploads/default.png';

        const query =
          'INSERT INTO users (nombres, apellidos, correo, username, password, fotoPerfil) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(
          query,
          [nombres, apellidos, correo, username, hashedPassword, fotoPerfil],
          (err2, result) => {
            if (err2) return res.status(500).json({ message: 'Error al registrar usuario', error: err2 });
            return res.status(201).json({
              message: 'Usuario registrado correctamente',
              userId: result.insertId,
              username
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

// ---------- RUTA DE LOGIN ----------
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  const query = 'SELECT * FROM users WHERE username = ? OR correo = ?';
  db.query(query, [usuario, usuario], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos', err });
    if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const user = results[0];
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

      const fotoPerfilPath = user.fotoPerfil.startsWith('/')
        ? user.fotoPerfil
        : '/' + user.fotoPerfil;

      return res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          username: user.username,
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          fotoPerfil: fotoPerfilPath
        }
      });
    } catch (compErr) {
      return res.status(500).json({ message: 'Error en la verificación de contraseña' });
    }
  });
});

// ---------- RUTA DE ACTUALIZAR PERFIL ----------
app.post('/update-profile', upload.single('profile_image'), async (req, res) => {
  const { id, nombres, apellidos, correo, username, password } = req.body;

  try {
    db.query('SELECT * FROM users WHERE id = ?', [id], async (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error DB', err });
      if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

      const updates = [];
      const values = [];
      let newFotoPerfil = null;

      if (nombres) { updates.push('nombres = ?'); values.push(nombres); }
      if (apellidos) { updates.push('apellidos = ?'); values.push(apellidos); }
      if (correo) { updates.push('correo = ?'); values.push(correo); }
      if (username) { updates.push('username = ?'); values.push(username); }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        values.push(hashedPassword);
      }
      if (req.file) {
        newFotoPerfil = '/uploads/' + req.file.filename;
        updates.push('fotoPerfil = ?');
        values.push(newFotoPerfil);
      }

      if (updates.length === 0) {
        return res.json({ success: true, message: 'No se realizaron cambios' });
      }

      values.push(id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      db.query(query, values, (err2) => {
        if (err2) return res.status(500).json({ success: false, message: 'Error actualizando', err2 });
        return res.json({ success: true, message: 'Perfil actualizado correctamente', newFotoPerfil });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error servidor', error });
  }
});

// ---------- RUTA PARA OBTENER TODOS LOS USUARIOS ----------
app.get('/users', (req, res) => {
  const query = 'SELECT id, nombres, apellidos, correo, username, fotoPerfil FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ message: 'Error al obtener usuarios', err });
    }
    res.json(results);
  });
});

// ---------- RUTA PARA OBTENER UN USUARIO POR ID ----------
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT id, nombres, apellidos, correo, username, fotoPerfil FROM users WHERE id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error en la base de datos', err });
      if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(results[0]);
    }
  );
});

// ---------- RUTA PARA ELIMINAR UN USUARIO ----------
app.delete('/api/delete-user/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return res.status(500).json({ message: 'Error al eliminar usuario', err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Su cuenta en PalAntojo fue eliminada' });
  });
});

// ---------- RUTA RAÍZ ----------
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
);
