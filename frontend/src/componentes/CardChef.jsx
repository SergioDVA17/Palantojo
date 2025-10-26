import React from "react";
import { useNavigate } from "react-router-dom";

const CardChef = ({ chef, posicion }) => {
  const navigate = useNavigate();
  const etiquetas = ["🥇Chef del mes", "🥈Top Chef", "🥉Chef destacado"];
  const colores = ["chef-oro", "chef-plata", "chef-bronce"];

  const verPerfil = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  if (sessionUser?.id === chef.id)
    navigate(`/usuario/${sessionUser.username}`);
  else
    navigate(`/usuario/${chef.username}`);
  };

  return (
    <div className="card-chef">
      <div className={`chef-posicion ${colores[posicion - 1]}`}>{etiquetas[posicion - 1]}</div>
      <div className="chef-header">
        <img src={`http://localhost:3000${chef.fotoPerfil}`} alt={chef.username} className="chef-foto" />
        <div className="chef-info">
          <h4 className="chef-nombre">{chef.nombres} {chef.apellidos}</h4>
          <p 
                style={{ cursor: "pointer", textDecoration: "underline", color: "#da2627"}}
                onClick={() => navigate(`/usuario/${chef.username}`)}>
                @{chef.username}
          </p>
        </div>
      </div>
      <div className="chef-stats">
        <div className="chef-stat"><i className="bi bi-journal-text"></i><strong>{chef.total_recetas}</strong></div>
        <div className="chef-stat"><i className="bi bi-star-fill"></i><strong>{chef.rating_promedio.toFixed(1)}</strong></div>
        <div className="chef-stat"><i className="bi bi-chat-dots"></i><strong>{chef.total_comentarios_recibidos}</strong></div>
      </div>
      <hr></hr>
      <button className="btn-visitar-perfil" onClick={verPerfil}>
        Ver perfil
      </button>
    </div>
  );
};

export default CardChef;