// CardRecetaPopular.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const CardRecetaPopular = ({ receta, onRecetaEliminada }) => {
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
    <div className="card-receta-popular mx-auto col-md-8">
      <div className="badge-popular">
        <i className="bi bi-fire"></i> MÁS POPULAR
      </div>

      <img
        src={`http://localhost:3000${receta.imagen}`}
        alt={receta.titulo}
        className="card-img-top"
      />

      <div className="card-body">
        <h3 className="card-title">{receta.titulo}</h3>

        <div className="descripcion-y-stats">
          <p className="card-text">
            {receta.descripcion || "Una receta deliciosa de PalAntojo."}
          </p>
          
          <div className="stats-popular-inline">
            <div className="stat-popular">
              <i className="bi bi-chat-dots-fill"></i>
              <span>{receta.total_comentarios}</span>
            </div>
            <div className="stat-popular">
              <i className="bi bi-star-fill"></i>
              <span>{receta.rating_promedio.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <small className="text-muted">Estado: {receta.estado || "Sin estado"}</small>

        <div className="autor-info-popular mt-3">
          <img
            src={`http://localhost:3000${receta.autor_foto}`}
            alt={receta.autor}
            className="autor-foto-popular"
          />
          <div>
            <strong
              style={{
                cursor: "pointer",
                textDecoration: "underline",
                color: "#da2627",
              }}
              onClick={() => navigate(`/usuario/${receta.autor}`)}
            >
              @{receta.autor}
            </strong>
          </div>
        </div>

        <hr />

        <div
          className={`botones-receta-popular ${
            esAutor ? "autor" : "no-autor"
          }`}
        >
          <button
            className="btn-detalles"
            onClick={() => navigate(`/VerDetalles/${receta.id}`)}
          >
            Ver más detalles
          </button>

          {esAutor && (
            <>
              <button
                className="btn-editarReceta"
                onClick={() => navigate(`/CrearEditarReceta/${receta.id}`)}
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

export default CardRecetaPopular;