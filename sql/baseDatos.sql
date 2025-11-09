CREATE DATABASE IF NOT EXISTS Palan_DB;
USE Palan_DB;

-- Tabla de usuarios (corregida para coincidir con el código)
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fotoPerfil VARCHAR(255) DEFAULT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY (correo),
    UNIQUE KEY (username)
);

-- Estados/Categorías 
CREATE TABLE Estados (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(100) NOT NULL UNIQUE
);

-- Recetas 
CREATE TABLE Recetas (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_estado INT NOT NULL,
    nombre_platillo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    ingredientes TEXT NOT NULL,
    instrucciones TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_estado) REFERENCES Estados(id_estado) ON DELETE CASCADE
);

CREATE TABLE Imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE
);

CREATE TABLE Calificaciones (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    id_usuario INT NOT NULL,
    calificacion TINYINT CHECK (calificacion BETWEEN 1 AND 5),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (id_receta, id_usuario) -- un usuario solo califica una vez cada receta
);

CREATE TABLE Comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    id_usuario INT NOT NULL,
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE Recetas_Guardadas (
    id_guardado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receta INT NOT NULL,
    fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_receta) REFERENCES Recetas(id_receta) ON DELETE CASCADE,
    UNIQUE (id_usuario, id_receta) -- no duplicar guardados
);

ALTER TABLE Recetas ADD COLUMN promedio_calificacion DECIMAL(3,2) DEFAULT 0;
ALTER TABLE Calificaciones MODIFY calificacion FLOAT;

SHOW TABLES;
DROP database palan_db;

SELECT * FROM users;
SELECT * FROM Recetas_Guardadas;
SELECT * FROM Recetas;
SELECT * FROM Estados;
SELECT * FROM Imagenes;
SELECT * FROM Calificaciones;
SELECT * FROM Comentarios;

-- INSERTAR ESTADOS
INSERT INTO Estados (nombre_estado) VALUES 
('Aguascalientes'), ('Baja California'), ('Baja California Sur'), ('Campeche'), ('Chiapas'), ('Chihuahua'),
('Ciudad de México'), ('Coahuila'), ('Colima'), ('Durango'), ('Estado de México'), ('Guanajuato'), ('Guerrero'),
('Hidalgo'), ('Jalisco'), ('Michoacán'), ('Morelos'), ('Nayarit'), ('Nuevo León'), ('Oaxaca'), ('Puebla'),
('Querétaro'), ('Quintana Roo'), ('San Luis Potosí'), ('Sinaloa'), ('Sonora'), ('Tabasco'), ('Tamaulipas'),
('Tlaxcala'), ('Veracruz'), ('Yucatán'), ('Zacatecas');