import React from "react";

const Comment = ({ usuario, foto, contenido }) => (
  <div className="comentario">
    <img src={foto || "/Imagenes/default.png"} alt="Foto de usuario" className="comentario-img" />
    <div className="comentario-texto">
      <p className="comentario-usuario">
        <strong>{usuario}</strong>
      </p>
      <p className="comentario-contenido">{contenido}</p>
    </div>
  </div>
);

export default Comment;