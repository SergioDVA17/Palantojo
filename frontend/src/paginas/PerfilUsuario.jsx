// PERFIL AJENO O PROPIO
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../componentes/Navbar";
import CardReceta from "../componentes/CardReceta";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/PerfilUsuario.css";

const PerfilUsuario = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [guardadas, setGuardadas] = useState([]);
  const [recetaDestacada, setRecetaDestacada] = useState(null);

  // ===== ESTRELLAS =====       
  const getStarColor = (index, rating) => {
    if (!rating || rating === 0) return "text-secondary";
    const full = Math.floor(rating);
    if (index < full) {
      if (rating <= 2) return "text-primary";
      if (rating <= 3.5) return "text-purple";
      return "text-warning";
    } else if (index < rating) {
      if (rating <= 2) return "text-primary";
      if (rating <= 3.5) return "text-purple";
      return "text-warning";
    }
    return "text-secondary";
  };

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setSessionUser(storedUser);
    cargarUsuario(username);
  }, [username]);

  const cargarUsuario = async (username) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/users/by-username/${username}`);
      const { data: ratingData } = await axios.get(`http://localhost:3000/api/user/${data.id}/rating`);
      setUser({
        ...data,
        rating_promedio: ratingData.rating_promedio,
        total_recetas: ratingData.total_recetas,
        total_calificaciones: ratingData.total_calificaciones,
      });
      document.title = `PalAntojo / @${data.username}`;

      const { data: topRecipe } = await axios.get(`http://localhost:3000/api/user/${data.id}/top-recipe`);
      setRecetaDestacada(topRecipe);

      setRecetas([
        { id: 1, titulo: "Sopes", descripcion: "Deliciosos sopes", imagen: "/Imagenes/Sopes.jpg" },
        { id: 2, titulo: "Tacos", descripcion: "Tacos al pastor", imagen: "/Imagenes/Tacos.jpg" },
      ]);
      setGuardadas([
        { id: 3, titulo: "Mole con arroz", descripcion: "Delicioso mole", imagen: "/Imagenes/MoleConArroz.jpg", autor: "Luisa" },
      ]);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Hubo un error...",
        text: "No se pudo cargar el usuario",
      });
    }
  };

  if (!user) return null;

  const esPropio = sessionUser?.id === user.id;

  return (
    <div className="perfil-usuario-body">
      <Navbar user={sessionUser} onSearchChange={(q) => navigate(`/PaginaPrincipal?q=${encodeURIComponent(q)}`)} />

      <main className="container perfil-contenido">
        <div className="perfil-header">
          <div className="perfil-info">
            <img
              src={`http://localhost:3000${user.fotoPerfil}` || "/Imagenes/default.png"}
              alt="Foto de perfil"
              className="foto-de-perfil"
            />
            <h4>{user.nombres} {user.apellidos}</h4>
            <p className="username">@{user.username}</p>
            <p className="correo">{user.correo}</p>

            {user.rating_promedio !== undefined && (
              <div className="user-rating mt-2">
                <div className="rating-stars mb-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    if (i + 1 <= Math.floor(user.rating_promedio)) {
                      return <i key={i} className={`bi bi-star-fill ${getStarColor(i, user.rating_promedio)}`}></i>;
                    } else if (i < user.rating_promedio) {
                      return <i key={i} className={`bi bi-star-half ${getStarColor(i, user.rating_promedio)}`}></i>;
                    } else {
                      return <i key={i} className="bi bi-star text-secondary"></i>;
                    }
                  })}
                </div>
                <div className="rating-info">
                  <span className="rating-value">{user.rating_promedio?.toFixed(1) || "0.0"}</span>
                  <small className="text-muted"> ({user.total_calificaciones || 0})</small>
                </div>
                <small className="text-muted d-block">{user.total_recetas || 0} recetas</small>
              </div>
            )}

            {esPropio && (
              <button className="btn-editar" onClick={() => navigate("/EditarPerfil")}>
                Editar perfil
              </button>
            )}
          </div>

          {recetaDestacada ? (
            <div className="receta-destacada">
              <h4 className="titulo-seccion">
                <i className="bi bi-star-fill" style={{ color: "gold" }}></i> Receta destacada
              </h4>
              <CardReceta
                receta={recetaDestacada}
                mostrarAutor={false}
                esPropia={esPropio}
              />
            </div>
          ) : (
            <div className="receta-destacada text-center">
              <h4 className="titulo-seccion">
                <i className="bi bi-star" style={{ color: "gray" }}></i> Receta destacada
              </h4>
              <p className="text-muted">Aún no tienes una receta destacada.</p>
            </div>
          )}
        </div>

        <h3 className="titulo-seccion">Recetas publicadas</h3>
        <hr />
        <div className="recetas-grid">
          {recetas.map((r) => (
            <CardReceta key={r.id} receta={r} mostrarAutor esPropia={esPropio} />
          ))}
        </div>

        <h3 className="titulo-seccion">Recetas guardadas</h3>
        <hr />
        <div className="recetas-grid">
          {guardadas.map((r) => (
            <CardReceta key={r.id} receta={r} mostrarAutor />
          ))}
        </div>
      </main>

      <footer className="text-center mt-4">
        <hr />
        © 2025, PalAntojo
      </footer>
    </div>
  );
};

export default PerfilUsuario;