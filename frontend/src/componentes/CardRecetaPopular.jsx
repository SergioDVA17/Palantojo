import React from "react";
import { useNavigate } from "react-router-dom";

const CardRecetaPopular = ({ receta }) => {
  const navigate = useNavigate();

  return (
  <div className="card-receta-popular mx-auto col-md-8">
      <div className="badge-popular">
        <i className="bi bi-fire"></i> MÁS POPULAR
      </div>
      <img src={receta.imagen} alt={receta.titulo} className="card-img-top" />
      <div className="card-body">
        <h3 className="card-title">{receta.titulo}</h3>
        <p className="card-text">{receta.descripcion || "Una receta deliciosa de PalAntojo."}</p>

        <div className="receta-info-popular">
          <div className="autor-info-popular">
            <img src={`http://localhost:3000${receta.autor_foto}`} alt={receta.autor} className="autor-foto-popular" />
            <div>
              <strong 
                style={{ cursor: "pointer", textDecoration: "underline", color: "#da2627"}}
                onClick={() => navigate(`/usuario/${receta.autor}`)}>
                @{receta.autor}
              </strong>
              <br />
              <small className="text-muted">{receta.estado || "Sin estado"}</small>
            </div>
          </div>

          <div className="stats-popular">
            <div className="stat-popular">
              <i className="bi bi-chat-dots-fill"></i>
              <div>
                <strong>{receta.total_comentarios}</strong>
                <small> comentarios</small>
              </div>
            </div>
            <div className="stat-popular">
              <i className="bi bi-star-fill"></i>
              <div>
                <strong>{receta.rating_promedio.toFixed(1)}</strong>
              </div>
            </div>
          </div>
        </div>
        <hr></hr>
        <button
          className="btn-ver-detalles"
          onClick={() => navigate(`/VerDetalles/${receta.id}`)}
        >
          Ver más detalles
        </button>
      </div>
    </div>
  );
}; 

export default CardRecetaPopular;