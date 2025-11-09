import React, { useEffect, useState } from "react";
import Navbar from "../componentes/Navbar";
import RatingStars from "../componentes/RatingStars";
import Comment from "../componentes/Comentario";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/VerDetalles.css";

const VerDetalles = () => {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(null);
  const { id } = useParams();
  const [receta, setReceta] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [miCalificacion, setMiCalificacion] = useState(0);
  const [guardada, setGuardada] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setSessionUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    const fetchReceta = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/recetas/${id}`, {
          params: { idUsuario: sessionUser?.id || null },
        });
        setReceta(res.data);
        if (res.data.miCalificacion) setMiCalificacion(res.data.miCalificacion);
      } catch (err) {
        console.error("Error al obtener receta:", err);
      }
    };

    if (sessionUser) fetchReceta();
  }, [id, sessionUser]);

  useEffect(() => {
    if (!sessionUser) return;

    const verificarGuardada = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/recetas/${id}/guardada/${sessionUser.id}`
        );
        setGuardada(data.guardada === true);
      } catch (err) {
        console.error("Error al verificar receta guardada:", err);
        setGuardada(false);
      }
    };

    verificarGuardada();
  }, [sessionUser, id]);

  const handleGuardarReceta = async () => {
    if (!sessionUser) return;

    try {
      setGuardada((prev) => !prev);

      if (guardada) {
        await axios.delete(`http://localhost:3000/api/recetas/${id}/guardar`, {
          data: { id_usuario: sessionUser.id },
        });
        Swal.fire({
          title: "Se borró de recetas guardadas",
          icon: "info",
          timer: 2000,
          confirmButtonColor: "#da2627",
        });
      } else {
        await axios.post(`http://localhost:3000/api/recetas/${id}/guardar`, {
          id_usuario: sessionUser.id,
        });
        Swal.fire({
          title: "¡Receta guardada!",
          icon: "success",
          timer: 2000,
          confirmButtonColor: "#da2627",
        });
      }
    } catch (err) {
      console.error("Error al guardar/eliminar receta:", err);
      setGuardada((prev) => !prev);
      Swal.fire("Error", "No se pudo procesar la acción", "error");
    }
  };

  const handleEliminarReceta = async () => {
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
          await axios.delete(`http://localhost:3000/api/recetas/${receta.id_receta || id}`);
          Swal.fire({
            title: "Receta eliminada",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          navigate("/PaginaPrincipal");
        } catch (err) {
          console.error("Error al eliminar receta:", err);
          Swal.fire("Error", "No se pudo eliminar la receta", "error");
        }
      }
    });
  };

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/recetas/${id}/comentarios`);
        setComentarios(res.data);
      } catch (err) {
        console.error("Error al obtener comentarios:", err);
      }
    };
    fetchComentarios();
  }, [id]);

  const handleRate = async (valor) => {
    if (!sessionUser || receta?.id_usuario === sessionUser.id) return;
    setMiCalificacion(valor);
    try {
      await axios.post(`http://localhost:3000/api/recetas/${id}/calificacion`, {
        id_usuario: sessionUser.id,
        calificacion: valor,
      });
    } catch (err) {
      console.error("Error al calificar:", err);
    }
  };

  const handleComentar = async () => {
    if (!comentarioTexto.trim()) {
      Swal.fire("Comentario vacío", "Escribe algo antes de publicar", "warning");
      return;
    }

    try {
      await axios.post(`http://localhost:3000/api/recetas/${id}/comentarios`, {
        id_usuario: sessionUser.id,
        comentario: comentarioTexto,
      });

      setComentarios([
        ...comentarios,
        { usuario: sessionUser.username, foto: sessionUser.fotoPerfil, contenido: comentarioTexto },
      ]);
      setComentarioTexto("");
      Swal.fire("Comentario publicado", "", "success");
    } catch (err) {
      console.error("Error al comentar:", err);
      Swal.fire("Error", "No se pudo publicar el comentario", "error");
    }
  };

  if (!receta) {
    return (
      <div className="ver-detalles-body">
        <Navbar user={sessionUser} />
        <div className="text-center mt-5">Cargando receta...</div>
      </div>
    );
  }

  const esPropia = sessionUser && receta.id_usuario === sessionUser.id;

  return (
    <div className="ver-detalles-body">
      <Navbar
        user={sessionUser}
        onSearchChange={(q) => navigate(`/PaginaPrincipal?q=${encodeURIComponent(q)}`)}
      />

      <div className="container mt-5">
        <div className="receta-card">
          <div className="receta-info">
            <img
              src={`http://localhost:3000${receta.imagen}`}
              alt="Platillo"
              className="receta-img"
            />
            <div className="receta-detalles">
              <h3 style={{ fontWeight: "bold" }}>{receta.titulo}</h3>

              <p>
                <strong>Publicada por: </strong>
                <span
                  className="autor-link"
                  onClick={() => navigate(`/usuario/${receta.autor}`)}
                >
                  @{receta.autor}
                </span>
              </p>

              <p><strong>Estado:</strong> {receta.estado}</p>
              <p><strong>Descripción:</strong> {receta.descripcion}</p>

              <p><strong>Ingredientes:</strong></p>
              <ul>
                {receta.ingredientes?.split("\n").map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>

              <p><strong>Instrucciones:</strong></p>
              <ol>
                {receta.instrucciones?.split("\n").map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>

              {esPropia ? (
                <div className="botones-autor mt-3">
                  <button
                    className="btn-editarReceta" id="btn-Edit"
                    onClick={() => navigate(`/CrearEditarReceta/${receta.id_receta || id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-eliminarReceta" id="btn-Elim"
                    onClick={handleEliminarReceta}
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <button
                  className={`btn-guardar-receta ${guardada ? "guardada" : ""}`}
                  onClick={handleGuardarReceta}
                >
                  {guardada ? (
                    <i className="bi bi-bookmark-check-fill" title="Guardada"></i>
                  ) : (
                    <i className="bi bi-bookmark"></i>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="opinion-card">
          {esPropia ? (
            <div className="calific">
            <h4>
              Calificación promedio:{" "}
              <strong id="calific">{parseFloat(receta.promedioCalificacion || 0).toFixed(1)}</strong> <i id="calific" className="bi bi-star-fill"></i>
            </h4>
            </div>
          ) : (
            <>
              <h4>Calificar:</h4>
              <RatingStars
                rating={miCalificacion !== null ? miCalificacion : receta.promedioCalificacion}
                onRate={!esPropia ? handleRate : undefined}
              />
            </>
          )}

          {!esPropia && (
            <>
              <textarea
                className="form-control mt-2"
                placeholder="Añadir comentario..."
                value={comentarioTexto}
                onChange={(e) => setComentarioTexto(e.target.value)}
              />
              <button className="btn-comentar" onClick={handleComentar}>
                Comentar
              </button>
            </>
          )}

          <h4 className="mt-4">Opiniones</h4>
          <hr />
          {comentarios.length > 0 ? (
            comentarios.map((c, i) => (
              <Comment key={i} usuario={c.usuario} foto={c.foto} contenido={c.contenido} />
            ))
          ) : (
            <p className="text-muted">Aún no hay comentarios.</p>
          )}
        </div>

        <footer className="text-center mt-4">
          <hr />© 2025, PalAntojo
        </footer>
      </div>
    </div>
  );
};

export default VerDetalles;