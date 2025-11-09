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
        const res = await axios.get(`http://localhost:3000/api/recetas/${id}`);
        setReceta(res.data);
      } catch (err) {
        console.error("Error al obtener receta:", err);
      }
    };
    fetchReceta();
  }, [id]);  

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

  const handleGuardarReceta = async () => {
      if (guardada) return;

      try {
        await axios.post(`http://localhost:3000/api/recetas/${id}/guardar`, {
          id_usuario: sessionUser.id,
        });
        setGuardada(true);
        Swal.fire({
          title: "¡Receta guardada!",
          icon: "success",
          timer: 2000,
          confirmButtonColor: "#da2627",
        });
      } catch (err) {
        console.error("Error al guardar receta:", err);
        Swal.fire("Error", "No se pudo guardar la receta", "error");
      }
  };   
  
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
        contenido: comentarioTexto,
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
  
  if (!receta) return <div>Cargando...</div>;

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
            <img src={receta.imagen} alt="Platillo" className="receta-img" />
            <div className="receta-detalles">
              <h3>{receta.titulo}</h3>
              <p>
                <strong>Receta publicada por: </strong>
                <span
                  className="autor-link"
                  onClick={() => navigate(`/perfil/${receta.id_usuario}`)}
                >
                  {receta.autor}
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

              <p><strong>Instruciones:</strong></p>
              <ol>
                {receta.instrucciones?.split("\n").map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>

              {!esPropia && (
                <button
                  className={`btn-guardar-receta ${guardada ? "guardada" : ""}`}
                  onClick={handleGuardarReceta}
                >
                  {guardada ? (
                    <>
                      <i className="bi bi-bookmark-check-fill" title="Guardar receta"></i>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-bookmark"></i>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="opinion-card">
          <h4>Calificar:</h4>
          <RatingStars rating={receta.promedioCalificacion} onRate={handleRate} />

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