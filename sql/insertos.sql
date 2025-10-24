
-- INSERTAR USUARIOS
INSERT INTO users (nombres, apellidos, correo, username, password, fotoPerfil) VALUES 
('María', 'González López', 'maria.gonzalez@email.com', 'maria_chef', '$2b$10$abc123...', '/Imagenes/018 default.png'),
('Carlos', 'Rodríguez Pérez', 'carlos.rodriguez@email.com', 'carlos_cocina', '$2b$10$def456...', '/Imagenes/018 default.png'),
('Ana', 'Martínez Sánchez', 'ana.martinez@email.com', 'ana_sabores', '$2b$10$ghi789...', '/Imagenes/018 default.png'),
('Juan', 'Hernández García', 'juan.hernandez@email.com', 'juan_recetas', '$2b$10$jkl012...', '/Imagenes/018 default.png'),
('Laura', 'Díaz Mendoza', 'laura.diaz@email.com', 'laura_gourmet', '$2b$10$mno345...', '/Imagenes/018 default.png'),
('Pedro', 'Castillo Ruiz', 'pedro.castillo@email.com', 'pedro_cocinero', '$2b$10$pqr678...', '/Imagenes/018 default.png');

-- INSERTAR ESTADOS
INSERT INTO Estados (nombre_estado) VALUES 
('Aguascalientes'), ('Baja California'), ('Baja California Sur'), ('Campeche'), ('Chiapas'), ('Chihuahua'),
('Ciudad de México'), ('Coahuila'), ('Colima'), ('Durango'), ('Estado de México'), ('Guanajuato'), ('Guerrero'),
('Hidalgo'), ('Jalisco'), ('Michoacán'), ('Morelos'), ('Nayarit'), ('Nuevo León'), ('Oaxaca'), ('Puebla'),
('Querétaro'), ('Quintana Roo'), ('San Luis Potosí'), ('Sinaloa'), ('Sonora'), ('Tabasco'), ('Tamaulipas'),
('Tlaxcala'), ('Veracruz'), ('Yucatán'), ('Zacatecas');

-- INSERTAR RECETAS
INSERT INTO Recetas (id_usuario, id_estado, nombre_platillo, descripcion, ingredientes, instrucciones) VALUES 
(1, 7, 'Tacos al Pastor', 'Auténticos tacos al pastor con carne adobada, piña y cilantro', 'Carne de cerdo, chiles guajillo, achiote, piña, cebolla, cilantro, tortillas de maíz', '1. Marinar la carne por 4 horas en adobo\n2. Cocinar en trompo o plancha caliente\n3. Servir en tortillas con piña, cebolla y cilantro\n4. Acompañar con limón y salsa'),
(2, 15, 'Sopes Tradicionales', 'Deliciosos sopes con base de masa, frijoles refritos y toppings frescos', 'Masa de maíz, frijoles refritos, carne molida, lechuga, tomate, crema, queso fresco, aguacate', '1. Preparar la masa y formar discos con bordes\n2. Cocinar en comal hasta dorar\n3. Agregar frijoles refritos\n4. Cubrir con carne, lechuga, tomate, crema y queso'),
(3, 20, 'Mole Oaxaqueño', 'Mole tradicional de Oaxaca con pollo y arroz blanco', 'Pollo, chocolate de mesa, chiles mulato, pasilla, ancho, plátano macho, almendras, ajonjolí, arroz', '1. Cocer el pollo en agua con sal\n2. Tostar y moler los chiles con especias\n3. Preparar la salsa de mole cocinando por 2 horas\n4. Servir el pollo bañado en mole con arroz blanco'),
(4, 21, 'Pozole Rojo', 'Pozole tradicional con maíz cacahuazintle y carne de cerdo', 'Maíz pozolero, carne de cerdo, chiles guajillo, lechuga, rábano, cebolla, orégano, tostadas', '1. Cocer el maíz por 3 horas hasta que reviente\n2. Agregar la carne de cerdo y cocinar por 1 hora más\n3. Preparar la salsa de chiles guajillo\n4. Servir caliente con verduras frescas'),
(5, 25, 'Tacos de Pescado', 'Tacos de pescado empanizado estilo ensenada', 'Filete de pescado blanco, harina, cerveza, repollo morado, salsa mayonesa-chipotle, tortillas', '1. Cortar el pescado en tiras\n2. Preparar la masa con harina y cerveza\n3. Freír el pescado empanizado\n4. Servir en tortillas con repollo y salsa'),
(6, 19, 'Cabrito al Pastor', 'Cabrito estilo norteño asado lentamente', 'Pierna de cabrito, ajo, romero, tomillo, sal, pimienta, limón, cebolla, tortillas de harina', '1. Marinar el cabrito por 12 horas con especias\n2. Asar lentamente por 4 horas a fuego bajo\n3. Deshebrar la carne\n4. Servir con tortillas de harina, cebolla y limón'),
(1, 10, 'Discada Norteña', 'Mezcla de carnes típica del norte de México', 'Carne de res, carne de cerdo, chorizo, tocino, cebolla, chiles jalapeños, tomate, cerveza', '1. Cocinar cada carne por separado\n2. Mezclar todas las carnes en un disco\n3. Agregar verduras y especias\n4. Servir caliente con tortillas');

-- INSERTAR IMÁGENES
INSERT INTO Imagenes (id_receta, url_imagen) VALUES 
(1, '/Imagenes/017 Tacos.jpg'),
(2, '/Imagenes/016 Sopes.jpg'),
(3, '/Imagenes/014 Mole con arroz.jpg'),
(4, '/Imagenes/015 Pozole.jpg'),
(5, '/Imagenes/017 Tacos.jpg'),
(6, '/Imagenes/017 Tacos.jpg'),
(7, '/Imagenes/016 Sopes.jpg');

-- INSERTAR CALIFICACIONES
INSERT INTO Calificaciones (id_receta, id_usuario, calificacion) VALUES 
(1, 2, 5), (1, 3, 4), (1, 4, 5), (1, 5, 4), (1, 6, 5),
(2, 1, 5), (2, 3, 4), (2, 4, 5), (2, 5, 5), (2, 6, 4),
(3, 1, 4), (3, 2, 5), (3, 4, 4), (3, 5, 5), (3, 6, 4),
(4, 1, 5), (4, 2, 4), (4, 3, 5), (4, 5, 4), (4, 6, 5),
(5, 1, 4), (5, 2, 5), (5, 3, 4), (5, 4, 5), (5, 6, 5),
(6, 1, 5), (6, 2, 5), (6, 3, 4), (6, 4, 5), (6, 5, 4),
(7, 2, 4), (7, 3, 5), (7, 4, 4), (7, 5, 5), (7, 6, 4);

-- INSERTAR COMENTARIOS
INSERT INTO Comentarios (id_receta, id_usuario, comentario) VALUES 
(1, 2, '¡Los mejores tacos al pastor que he probado! La combinación con piña es perfecta.'),
(1, 4, 'La carne quedó muy jugosa y el adobo tiene un sabor espectacular.'),
(2, 1, 'Los sopes tienen la textura perfecta, crujientes por fuera y suaves por dentro.'),
(2, 5, 'Ideal para una cena familiar, a todos les encantaron los toppings frescos.'),
(3, 2, 'El mole tiene la consistencia ideal y el balance entre dulce y picante es perfecto.'),
(3, 6, 'Una receta auténtica que me transportó directamente a Oaxaca.'),
(4, 3, 'El pozole quedó excelente, el maíz estaba en su punto perfecto.'),
(4, 5, 'Perfecto para días fríos, el caldo es muy reconfortante.'),
(5, 1, 'Los tacos de pescado quedaron crujientes por fuera y jugosos por dentro.'),
(5, 4, 'La salsa mayonesa-chipotle es el complemento perfecto.'),
(6, 2, 'El cabrito muy tierno y bien sazonado, se deshacía en la boca.'),
(6, 3, 'La cocción lenta hace toda la diferencia, vale la pena la espera.'),
(7, 4, 'La discada perfecta para una reunión con amigos, todos pidieron la receta.'),
(7, 5, 'La combinación de carnes es excelente, cada bocado es una explosión de sabor.');

-- INSERTAR RECETAS GUARDADAS
INSERT INTO Recetas_Guardadas (id_usuario, id_receta) VALUES 
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 6), (2, 7),
(3, 1), (3, 4), (3, 5), (3, 6),
(4, 2), (4, 5), (4, 6), (4, 7),
(5, 1), (5, 2), (5, 3), (5, 4),
(6, 1), (6, 3), (6, 4), (6, 7);

-- VERIFICAR INSERCIONES
SELECT 'Usuarios insertados: ' AS 'Resultado', COUNT(*) AS Cantidad FROM users
UNION ALL SELECT 'Estados insertados: ', COUNT(*) FROM Estados
UNION ALL SELECT 'Recetas insertadas: ', COUNT(*) FROM Recetas
UNION ALL SELECT 'Imágenes insertadas: ', COUNT(*) FROM Imagenes
UNION ALL SELECT 'Calificaciones insertadas: ', COUNT(*) FROM Calificaciones
UNION ALL SELECT 'Comentarios insertados: ', COUNT(*) FROM Comentarios
UNION ALL SELECT 'Recetas guardadas: ', COUNT(*) FROM Recetas_Guardadas;