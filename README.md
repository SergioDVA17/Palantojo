# PalAntojo
**Integrantes del equipo:**  
★ Alvarado Garza Alberto Jesús   1847862  
★ Garcia Vera Ana Sared          1845639  
★ Villa Arreguin Sergio Daniel   1968677  
★ Vivas Treviño Tiffany Vanessa  1858478  


**Descripcion de la aplicacion:**  
- Es una página web tipo blog en la que los usuarios podrán compartir recetas de sus platillos mexicanos favoritos.  
* Los usuarios pueden publicar recetas, así como ver las de otros usuarios para replicar el platillo, si gusta puede calificar y/o dejar un comentario de dicho platillo en la página.  
* El usuario puede guardar recetas de su interés y las podrá visualizar en su perfil. También se podrán visualizar las recetas que ha publicado, a su vez podrá editarlas o eliminarlas.  

**Descripción de las carpetas contenidas:**  
- node_modules: contiene todos los archivos de Node.js  
- public: contiene lo relacionado a las páginas y su diseño, cada una con su propia carpeta.  
- uploads: para las imagenes subidas por los usuarios  


**Instrucciones de ejecución**  
## Requisitos previos  
- Node.js instalado  
- MySQL Workbench  

## Instrucciones
1. Clonar el repositorio o descargar el ZIP desde Github.  
[git clone https://github.com/tuusuario/palantojo.git  
cd palantojo]  
2. Instalar las dependencias.  
[npm install]  
3. Crear la Base de Datos en MySQL Workbech  
[CREATE DATABASE Palan_DB]  
luego ejecuta el script Palan_DB.sql para crear las tablas necesarias.   
4. Iniciar el servidor desde la consola:  
[node server.js]  
5. Abrir el navegador y accede a: http://localhost:3000/InicioSesion/InicioSesion.html  