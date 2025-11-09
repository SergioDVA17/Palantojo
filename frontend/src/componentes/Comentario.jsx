import React from "react";
import { useNavigate } from "react-router-dom";

const Comment = ({ usuario, foto, contenido }) => {
  const navigate = useNavigate();

  return (
    <div className="comentario">
      <img
        src={foto ? `http://localhost:3000${foto}` : "/Imagenes/default.png"}
        alt={usuario}
        className="comentario-img"
      />
      <div className="comentario-info">
        <span
          className="comentario-usuario"
          onClick={() => navigate(`/usuario/${usuario}`)}
          style={{ cursor: "pointer", color: "#da2627", fontWeight: "bold" }}
        >
          @{usuario}
        </span>
        <p>{contenido}</p>
      </div>
    </div>
  );
};

export default Comment;