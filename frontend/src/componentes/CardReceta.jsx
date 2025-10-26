import React from "react";
import { Link, useNavigate } from "react-router-dom";

const CardReceta = ({ receta, mostrarAutor = false, esPropia = false }) => {
  const navigate = useNavigate();

  return (
    <div className="card card-receta shadow-sm">
      <img
        src={receta.imagen || "/Imagenes/default.png"}
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
          <hr></hr>
        </div>

        <div className="botones-receta">
          {esPropia ? (
            <>
              <button
                className="btn-editarReceta"
                onClick={() => navigate(`/CrearEditarReceta/${receta.id}`)}
              >Editar</button>
              <button className="btn-eliminarReceta">Eliminar</button>
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