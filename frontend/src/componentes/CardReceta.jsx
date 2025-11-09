import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const CardReceta = ({ receta, mostrarAutor = false, esPropia = false, onRecetaEliminada }) => {
  const navigate = useNavigate();

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
          await axios.delete(`http://localhost:3000/api/recetas/${receta.id}`);
          Swal.fire({
            title: "Receta eliminada",
            icon: "success",
            confirmButtonColor: "#da2627",
            timer: 2000,
            showConfirmButton: false,
          });
          if (onRecetaEliminada) onRecetaEliminada(receta.id);
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
    <div className="card card-receta shadow-sm">
      <img
        src={`http://localhost:3000${receta.imagen}` || "/Imagenes/default.png"}
        alt={receta.titulo}
        className="card-img-top"
      />

      <div className="card-body">
        <div>
          <h5 className="card-title fw-bold">{receta.titulo}</h5>
          <p className="card-text text-muted">
            <small>{receta.descripcion}</small>
          </p>

          {mostrarAutor && !esPropia && receta.autor && (
            <small className="text-muted">
              Publicada por{" "}
              <span
                className="enlace-autor"
                onClick={() => navigate(`/usuario/${receta.autor}`)}
              >
                @{receta.autor}
              </span>
            </small>
          )}
        </div>
          
        <div className="botones-receta">
          {esPropia ? (
            <>
              <button
                className="btn-editarReceta"
                onClick={() => navigate(`/CrearEditarReceta/${receta.id}`)}
              >
                Editar
              </button>
              <button
                className="btn-eliminarReceta"
                onClick={handleEliminar}
              >
                Eliminar
              </button>
            </>
          ) : (
            <button
              className="btn-detalles"
              onClick={() => navigate(`/VerDetalles/${receta.id}`)}
            >
              Ver más detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardReceta;