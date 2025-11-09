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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	//Quitar contraseña si no eres Alberto
	password: '',
	database: 'Palan_DB',
	port: 3306
});

db.connect(err => {
	if (err) console.error('Error conectando a MySQL:', err);
	else console.log('Conectado a MySQL');
});

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

//							USUARIOS 
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

// Busqueda
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

app.get('/api/users/by-username/:username', (req, res) => {
  const { username } = req.params;
  db.query(
    'SELECT id, nombres, apellidos, correo, username, fotoPerfil FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error en DB', err });
      if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(results[0]);
    }
  );
});

// ==========================================================
//							RECETAS 
app.get("/api/estados", (req, res) => {
  db.query("SELECT nombre_estado FROM Estados ORDER BY nombre_estado ASC", (err, results) => {
    if (err) return res.status(500).json({ message: "Error al obtener estados", err });
    res.json(results);
  });
});

app.post("/api/recetas", upload.single("imagen"), (req, res) => {
  const { titulo, descripcion, ingredientes, instrucciones, estado, id_usuario } = req.body;

  if (!id_usuario || !titulo || !ingredientes || !instrucciones || !estado) {
    return res.status(400).json({ message: "Todos los campos deben estar completos" });
  }

  const urlImagen = req.file ? "/uploads/" + req.file.filename : "/Imagenes/default.png";

  const query = `
    INSERT INTO Recetas (id_usuario, id_estado, nombre_platillo, descripcion, ingredientes, instrucciones)
    VALUES (?, (SELECT id_estado FROM Estados WHERE nombre_estado = ?), ?, ?, ?, ?)
  `;

  db.query(
    query,
    [id_usuario, estado, titulo, descripcion, ingredientes, instrucciones],
    (err, result) => {
      if (err) {
        console.error("Error al crear receta:", err);
        return res.status(500).json({ message: "Error al crear receta", err });
      }

      const id_receta = result.insertId;

      db.query(
        "INSERT INTO Imagenes (id_receta, url_imagen) VALUES (?, ?)",
        [id_receta, urlImagen],
        (err2) => {
          if (err2) console.error("Error al guardar imagen:", err2);
        }
      );

      res.status(201).json({
        message: "La receta se ha publicado",
        id_receta,
        urlImagen,
      });
    }
  );
});

// Actualizar receta
app.put("/api/recetas/:id", upload.single("imagen"), (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, ingredientes, instrucciones, estado } = req.body;

  if (!titulo && !descripcion && !ingredientes && !instrucciones && !estado && !req.file) {
    return res.status(400).json({ message: "No hay cambios para actualizar" });
  }

  const updates = [];
  const values = [];

  if (titulo) { updates.push("nombre_platillo = ?"); values.push(titulo); }
  if (descripcion) { updates.push("descripcion = ?"); values.push(descripcion); }
  if (ingredientes) { updates.push("ingredientes = ?"); values.push(ingredientes); }
  if (instrucciones) { updates.push("instrucciones = ?"); values.push(instrucciones); }
  if (estado) { updates.push("id_estado = (SELECT id_estado FROM Estados WHERE nombre_estado = ?)"); values.push(estado); }

  values.push(id);
  const query = `UPDATE Recetas SET ${updates.join(", ")} WHERE id_receta = ?`;

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ message: "Error al actualizar receta", err });

    if (req.file) {
      const urlImagen = "/uploads/" + req.file.filename;
      db.query(
        "UPDATE Imagenes SET url_imagen = ? WHERE id_receta = ?",
        [urlImagen, id],
        (err2) => {
          if (err2) console.error("Error al actualizar imagen:", err2);
        }
      );
    }

    res.json({ message: "Se guardaron los cambios de la receta" });
  });
});

// Receta por ID
app.get("/api/recetas/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      r.id_receta,
      r.nombre_platillo AS titulo,
      r.descripcion,
      r.ingredientes,
      r.instrucciones,
      e.nombre_estado AS estado,
      i.url_imagen AS imagen
    FROM Recetas r
    JOIN Estados e ON r.id_estado = e.id_estado
    LEFT JOIN Imagenes i ON r.id_receta = i.id_receta
    WHERE r.id_receta = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error al obtener receta", err });
    if (results.length === 0) return res.status(404).json({ message: "Receta no encontrada" });
    res.json(results[0]);
  });
});

// Recetas de un usuario
app.get('/api/recetas/usuario/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      r.id_receta,
      r.nombre_platillo,
      r.descripcion,
      e.nombre_estado,
      i.url_imagen,
      AVG(c.calificacion) AS promedio_calificacion
    FROM Recetas r
    LEFT JOIN Estados e ON r.id_estado = e.id_estado
    LEFT JOIN Imagenes i ON r.id_receta = i.id_receta
    LEFT JOIN Calificaciones c ON r.id_receta = c.id_receta
    WHERE r.id_usuario = ?
    GROUP BY r.id_receta
    ORDER BY r.fecha_publicacion DESC;
  `;

  db.query(query, [id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener recetas del usuario", err });

    const recetas = results.map(r => ({
      id: r.id_receta,
      titulo: r.nombre_platillo,
      descripcion: r.descripcion,
      estado: r.nombre_estado || "Sin estado",
      imagen: r.url_imagen || "/Imagenes/default.png",
      promedioCalificacion: parseFloat(r.promedio_calificacion) || 0,
    }));

    res.json(recetas);
  });
});

app.delete("/api/recetas/:id", (req, res) => {
  const { id } = req.params;

  const queries = [
    { table: "Comentarios", column: "id_receta" },
    { table: "Calificaciones", column: "id_receta" },
    { table: "Imagenes", column: "id_receta" },
  ];

  const eliminarAsociados = (index = 0) => {
    if (index >= queries.length) {
      db.query("DELETE FROM Recetas WHERE id_receta = ?", [id], (err, result) => {
        if (err)
          return res.status(500).json({ message: "Error al eliminar receta", err });

        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Receta no encontrada" });

        return res.json({ message: "Receta eliminada correctamente" });
      });
      return;
    }

    const { table, column } = queries[index];
    db.query(`DELETE FROM ${table} WHERE ${column} = ?`, [id], (err) => {
      if (err) console.error(`Error al eliminar de ${table}:`, err);
      eliminarAsociados(index + 1);
    });
  };

  eliminarAsociados();
});

//----------------------------

// Busqueda
app.get('/api/recetas/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.status(400).json({ message: "Debe ingresar un término de búsqueda" });
  }

  const term = `%${q}%`;
  const query = `
    SELECT 
      r.id_receta, r.nombre_platillo, r.descripcion,
      e.nombre_estado, u.username AS autor, u.fotoPerfil AS autor_foto,
      i.url_imagen, AVG(c.calificacion) AS promedio_calificacion
    FROM Recetas r
    JOIN users u ON r.id_usuario = u.id
    LEFT JOIN Estados e ON r.id_estado = e.id_estado
    LEFT JOIN Imagenes i ON r.id_receta = i.id_receta
    LEFT JOIN Calificaciones c ON r.id_receta = c.id_receta
    WHERE r.nombre_platillo LIKE ? OR e.nombre_estado LIKE ? OR u.username LIKE ?
    GROUP BY r.id_receta
  `;

  db.query(query, [term, term, term], (err, results) => {
    if (err) return res.status(500).json({ message: "Error en la búsqueda", err });
    res.json(results);
  });
});

// Todas las recetas
app.get('/api/recetas', (req, res) => {
  const query = `
    SELECT 
      r.id_receta, r.nombre_platillo, r.descripcion, e.nombre_estado,
      u.username AS autor, u.fotoPerfil AS autor_foto,
      i.url_imagen, AVG(c.calificacion) AS promedio_calificacion
    FROM Recetas r
    JOIN users u ON r.id_usuario = u.id
    LEFT JOIN Estados e ON r.id_estado = e.id_estado
    LEFT JOIN Imagenes i ON r.id_receta = i.id_receta
    LEFT JOIN Calificaciones c ON r.id_receta = c.id_receta
    GROUP BY r.id_receta, e.nombre_estado, u.username, u.fotoPerfil, i.url_imagen
    ORDER BY r.fecha_publicacion DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Error al obtener recetas", err });
    res.json(results.map(r => ({
      id: r.id_receta,
      titulo: r.nombre_platillo,
      descripcion: r.descripcion,
      estado: r.nombre_estado || "Sin estado",
      autor: r.autor,
      autor_foto: r.autor_foto,
      imagen: r.url_imagen || "/Imagenes/default.png",
      promedioCalificacion: parseFloat(r.promedio_calificacion) || 0
    })));
  });
});

// Mejr calificada
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
      u.username AS autor,
      u.fotoPerfil AS autor_foto,
      AVG(c.calificacion) AS promedio_calificacion,
      COUNT(c.calificacion) AS total_calificaciones
    FROM Recetas r
    JOIN users u ON r.id_usuario = u.id
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
      return res.json(null);
    }

    const receta = results[0];
    res.json({
      id: receta.id_receta,
      titulo: receta.nombre_platillo,
      descripcion: receta.descripcion,
      estado: receta.nombre_estado,
      autor: receta.autor,                  
      autor_foto: receta.autor_foto,        
      imagen: receta.url_imagen || '/Imagenes/default.png',
      promedioCalificacion: receta.promedio_calificacion || 0,
      totalCalificaciones: receta.total_calificaciones || 0
    });
  });
});

// Rating promedio de un usuario 
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

// Receta más comentada
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

// Top 3 usuarios con más recetas
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

// ---------- RUTA RAÍZ ----------
app.get('/', (req, res) => {
	res.send('Servidor funcionando');
});

const PORT = 3000;
app.listen(PORT, () =>
	console.log(`Servidor escuchando en http://localhost:${PORT}`)
);