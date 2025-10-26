import React from "react";
import { useNavigate } from "react-router-dom";

const CardUser = ({ usuario, myId }) => {
  const navigate = useNavigate();
  const isMyProfile = usuario.id === myId;

  const verPerfil = () => {
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  if (sessionUser?.id === usuario.id)
    navigate(`/usuario/${sessionUser.username}`);
  else
    navigate(`/usuario/${usuario.username}`);
  };

  return (
    <div className="card card-user text-center shadow-sm p-3">
      <img
        src={`http://localhost:3000${usuario.fotoPerfil}` || "/Imagenes/default.png"}
        className="img-fluid rounded-circle mx-auto"
        style={{ width: 120, height: 120, objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title mb-0">{usuario.nombres} {usuario.apellidos}</h5>
        <p className="text-muted">@{usuario.username}</p>
        <button className="verPerfilBtn" onClick={verPerfil}>
          Ver perfil
        </button>
      </div>
    </div>
  );
};

export default CardUser;