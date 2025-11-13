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
- frontend: contiene las páginas, componentes y css del proyecto.
- node_modules: contiene todos los archivos de Node.js
- sql: tiene la Base de Datos.
- uploads: para las imagenes subidas por los usuarios. 

**Requisitos previos**   
- Node.js instalado  
- MySQL Workbench  

## Instrucciones  
### 1. Clonar el repositorio o descargar el ZIP desde Github.  
```
git clone https://github.com/tuusuario/palantojo.git  
```
### 2. Usar el script de la BD que viene en la carpeta "sql" en MySQL Workbech.  

### 3. Iniciar el frontend y backend desde la terminal.   
*Se recomienda abrir 2 terminales para tener una mejor organización.  
```
npm install  
node server.js  
```
```
cd frontend  
npm install  
npm run dev  
```  
### 5. Abre el navegador para ver la página al acceder a:
```  
http://localhost:5173/  
```  
**REVISION**  
- agregar en los endpoints descripcion y cambiar los parametros a body  
