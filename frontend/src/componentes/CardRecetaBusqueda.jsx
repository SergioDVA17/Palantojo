import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const CardRecetaBusqueda = ({ receta, onRecetaEliminada }) => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const esAutor = user?.username === receta.autor;

  const handleEliminar = async () => {
    Swal.fire({
      title: "¿Eliminar receta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#da2627",
      cancelButtonColor: "#626a71",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/recetas/${receta.id_receta}`);
          Swal.fire({
            title: "Receta eliminada",
            icon: "success",
            confirmButtonColor: "#da2627",
            timer: 2000,
            showConfirmButton: false,
          });
          if (onRecetaEliminada) onRecetaEliminada(receta.id_receta);
        } catch (err) {
          console.error("Error al eliminar receta:", err);
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar la receta",
            icon: "error",
            confirmButtonColor: "#da2627",
          });
        }
      }
    });
  };
    
    return (
    <div className="card-receta-busqueda">
        {/* Imagen */}
        <img
        src={`http://localhost:3000${receta.url_imagen || receta.imagen}`}
        alt={receta.nombre_platillo || receta.titulo}
        className="card-img-top"
        />

        {/* Contenido */}
        <div className="card-body">
        <h4 className="card-titulo">{receta.nombre_platillo || receta.titulo}</h4>

        <p className="card-descripcion">
            {receta.descripcion || "Una receta deliciosa de PalAntojo."}
        </p>

        <small className="text-muted d-block mb-2">
            Estado: {receta.nombre_estado || receta.estado || "Sin estado"}
        </small>

        <div className="card-stats">
            <div className="stat-item">
            <i className="bi bi-star-fill"></i>
            <span>{parseFloat(receta.promedio_calificacion || 0).toFixed(1)}</span>
            </div>
        </div>

        <div className="autor-info-busqueda">
            <img
            src={`http://localhost:3000${receta.autor_foto}`}
            alt={receta.autor}
            className="autor-foto-busqueda"
            />
            <span
            className="autor-nombre"
            onClick={() => navigate(`/usuario/${receta.autor}`)}
            >
            @{receta.autor}
            </span>
        </div>

        <hr />

        <div
            className={`botones-receta-busqueda ${
            esAutor ? "autor" : "no-autor"
            }`}
        >
            <button
            className="btn-detalles"
            onClick={() => navigate(`/VerDetalles/${receta.id_receta}`)}
            >
            Ver más
            </button>

            {esAutor && (
            <>
                <button
                className="btn-editarReceta"
                onClick={() => navigate(`/CrearEditarReceta/${receta.id_receta}`)}
                >
                Editar
                </button>
                <button className="btn-eliminarReceta" onClick={handleEliminar}>
                Eliminar
                </button>
            </>
            )}
        </div>
        </div>
    </div>
    );
};

export default CardRecetaBusqueda;