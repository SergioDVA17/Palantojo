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
	//Yo necesito la conexion con contra xd
	password: 'qweasdzxc',
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

// ---------- RUTA PARA OBTENER TODOS LOS USUARIOS ----------
app.get('/api/search/users', (req, res) => {
	const search = req.query.q;
	if (!search || search.trim() === '') {
		return res.status(400).json({ message: 'Debe ingresar un término de búsqueda' });
	}

	const query = `
    SELECT id, nombres, apellidos, username, fotoPerfil 
    FROM users 
    WHERE nombres LIKE ? OR apellidos LIKE ? OR username LIKE ?`;
	const term = `%${search}%`;
	db.query(query, [term, term, term], (err, results) => {
		if (err) return res.status(500).json({ message: 'Error en la búsqueda', err });
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

// ---------- RUTA PARA OBTENER LA RECETA MEJOR CALIFICADA DE UN USUARIO ----------
app.get('/api/user/:id/top-recipe', (req, res) => {
	const { id } = req.params;

	const query = `
    SELECT 
      r.id_receta,
      r.nombre_platillo,
      r.descripcion,
      r.id_estado,
      e.nombre_estado,
      i.url_imagen,
      AVG(c.calificacion) as promedio_calificacion,
      COUNT(c.calificacion) as total_calificaciones
    FROM Recetas r
    LEFT JOIN Calificaciones c ON r.id_receta = c.id_receta
    LEFT JOIN Imagenes i ON r.id_receta = i.id_receta
    LEFT JOIN Estados e ON r.id_estado = e.id_estado
    WHERE r.id_usuario = ?
    GROUP BY r.id_receta
    ORDER BY promedio_calificacion DESC, total_calificaciones DESC
    LIMIT 1
  `;

	db.query(query, [id], (err, results) => {
		if (err) {
			console.error('Error al obtener receta mejor calificada:', err);
			return res.status(500).json({ message: 'Error en la base de datos', err });
		}

		if (results.length === 0) {
			return res.json(null); // No hay recetas
		}

		const receta = results[0];
		res.json({
			id: receta.id_receta,
			titulo: receta.nombre_platillo,
			descripcion: receta.descripcion,
			estado: receta.nombre_estado,
			imagen: receta.url_imagen || '/Imagenes/default.png',
			promedioCalificacion: receta.promedio_calificacion || 0,
			totalCalificaciones: receta.total_calificaciones || 0
		});
	});
});

// ---------- RUTA PARA OBTENER EL RATING PROMEDIO DE UN USUARIO ----------
app.get('/api/user/:id/rating', (req, res) => {
	const { id } = req.params;

	const query = `
    SELECT 
      AVG(c.calificacion) as rating_promedio,
      COUNT(DISTINCT r.id_receta) as total_recetas,
      COUNT(c.calificacion) as total_calificaciones
    FROM users u
    LEFT JOIN Recetas r ON u.id = r.id_usuario
    LEFT JOIN Calificaciones c ON r.id_receta = c.id_receta
    WHERE u.id = ?
    GROUP BY u.id
  `;

	db.query(query, [id], (err, results) => {
		if (err) {
			console.error('Error al obtener rating del usuario:', err);
			return res.status(500).json({ message: 'Error en la base de datos', err });
		}

		if (results.length === 0) {
			return res.json({
				rating_promedio: 0,
				total_recetas: 0,
				total_calificaciones: 0
			});
		}

		const data = results[0];
		res.json({
			rating_promedio: parseFloat(data.rating_promedio) || 0,
			total_recetas: parseInt(data.total_recetas) || 0,
			total_calificaciones: parseInt(data.total_calificaciones) || 0
		});
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
// ---------- RUTA PARA OBTENER LA RECETA MÁS COMENTADA ----------
app.get('/api/reportes/receta-mas-comentada', (req, res) => {
	const query = `
    SELECT 
      r.id_receta,
      r.nombre_platillo,
      r.descripcion,
      u.username as autor,
      u.fotoPerfil as autor_foto,
      COUNT(c.id_comentario) as total_comentarios,
      AVG(cal.calificacion) as rating_promedio,
      i.url_imagen,
      e.nombre_estado
    FROM Recetas r
    JOIN users u ON r.id_usuario = u.id
    LEFT JOIN Comentarios c ON r.id_receta = c.id_receta
    LEFT JOIN Calificaciones cal ON r.id_receta = cal.id_receta
    LEFT JOIN Imagenes i ON r.id_receta = i.id_receta
    LEFT JOIN Estados e ON r.id_estado = e.id_estado
    GROUP BY r.id_receta, u.username, u.fotoPerfil, i.url_imagen, e.nombre_estado
    ORDER BY total_comentarios DESC
    LIMIT 1
  `;

	db.query(query, (err, results) => {
		if (err) {
			console.error('Error al obtener receta más comentada:', err);
			return res.status(500).json({ message: 'Error en la base de datos', err });
		}

		if (results.length === 0) {
			return res.json(null);
		}

		const row = results[0];
		const receta = {
			id: row.id_receta,
			titulo: row.nombre_platillo,
			descripcion: row.descripcion,
			autor: row.autor,
			autor_foto: row.autor_foto,
			estado: row.nombre_estado,
			imagen: row.url_imagen || '/Imagenes/default.png',
			total_comentarios: row.total_comentarios,
			rating_promedio: parseFloat(row.rating_promedio) || 0
		};

		res.json(receta);
	});
});

// ---------- RUTA PARA OBTENER TOP 3 USUARIOS CON MÁS RECETAS ----------
app.get('/api/reportes/top-usuarios-recetas', (req, res) => {
	const query = `
    SELECT 
      u.id,
      u.username,
      u.nombres,
      u.apellidos,
      u.fotoPerfil,
      COUNT(r.id_receta) as total_recetas,
      AVG(cal.calificacion) as rating_promedio,
      COUNT(DISTINCT c.id_comentario) as total_comentarios_recibidos
    FROM users u
    LEFT JOIN Recetas r ON u.id = r.id_usuario
    LEFT JOIN Calificaciones cal ON r.id_receta = cal.id_receta
    LEFT JOIN Comentarios c ON r.id_receta = c.id_receta
    GROUP BY u.id, u.username, u.nombres, u.apellidos, u.fotoPerfil
    HAVING total_recetas > 0
    ORDER BY total_recetas DESC
    LIMIT 3
  `;

	db.query(query, (err, results) => {
		if (err) {
			console.error('Error al obtener top usuarios:', err);
			return res.status(500).json({ message: 'Error en la base de datos', err });
		}

		const usuarios = results.map(row => ({
			id: row.id,
			username: row.username,
			nombres: row.nombres,
			apellidos: row.apellidos,
			fotoPerfil: row.fotoPerfil || '/Imagenes/default.png',
			total_recetas: row.total_recetas,
			rating_promedio: parseFloat(row.rating_promedio) || 0,
			total_comentarios_recibidos: row.total_comentarios_recibidos
		}));

		res.json(usuarios);
	});
});
