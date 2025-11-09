import React, { useEffect, useState } from "react";
import Navbar from "../componentes/Navbar";
import RatingStars from "../componentes/RatingStars";
import Comment from "../componentes/Comentario";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/VerDetalles.css";

const VerDetalles = () => {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(null);
  const { id } = useParams(); 
  const [receta, setReceta] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [miCalificacion, setMiCalificacion] = useState(0);

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
        console.error(err);
      }
    };
    fetchReceta();
  }, [id]);

  const handleGuardarReceta = () => {
    Swal.fire({
      title: "¿Guardar receta?",
      text: "Esta receta se agregará a tus recetas guardadas",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#da2627",
      cancelButtonColor: "#626a71",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Guardada!",
          text: "La receta ha sido agregada a tus favoritos",
          icon: "success",
          confirmButtonColor: "#da2627",
          timer: 2000
        });
      }
    });
  };

  const handleComentar = () => {
    if (!comentarioTexto.trim()) {
      Swal.fire({
        title: "Comentario vacío",
        text: "Escribe algo antes de publicar",
        icon: "warning",
        confirmButtonColor: "#da2627"
      });
      return;
    }

    Swal.fire({
      title: "¿Publicar comentario?",
      text: "Tu comentario será visible para todos los usuarios",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#da2627",
      cancelButtonColor: "#626a71",
      confirmButtonText: "Sí, publicar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        setComentarios([...comentarios, { usuario: "Tú", foto: "/Imagenes/default.png", contenido: comentarioTexto }]);
        setComentarioTexto("");
        Swal.fire({
          title: "¡Comentario publicado!",
          icon: "success",
          confirmButtonColor: "#da2627",
          timer: 2000
        });
      }
    });
  };

  if (!receta) return <div>Cargando...</div>;

  return (
  <div className="ver-detalles-body">
    <Navbar user={sessionUser} onSearchChange={(q) => navigate(`/PaginaPrincipal?q=${encodeURIComponent(q)}`)} />
    <div className="container mt-5">
        <div className="receta-card">
          <div className="receta-info">
            <img src={receta.imagen} alt="#" className="receta-img" />
            <div className="receta-detalles">
              <h3>{receta.titulo}</h3>
              <p><strong>Receta publicada por:</strong> {receta.autor}</p>
              <p><strong>Estado:</strong> {receta.estado}</p>
              <p><strong>Descripción:</strong> {receta.descripcion}</p>
              <h5>Ingredientes</h5>
              <ul>
                <li>Carne</li>
                <li>Tortillas</li>
                <li>Salsa</li>
              </ul>
              <h5>Instrucciones</h5>
              <ol>
                <li>Cocer la carne</li>
                <li>Calentar tortillas</li>
              </ol>
              <button className="btn-guardar-receta" onClick={handleGuardarReceta}>Guardar receta</button>
            </div>
          </div>
        </div>

        <div className="opinion-card">
          <h4>Calificar:</h4>
          <RatingStars 
            rating={receta.promedioCalificacion} 
            onRate={(valor) => setMiCalificacion(valor)} 
          />
          <textarea
            className="form-control mt-2"
            placeholder="Añadir comentario..."
            value={comentarioTexto}
            onChange={(e) => setComentarioTexto(e.target.value)}
          />
          <button className="btn-comentar" onClick={handleComentar}>Comentar</button>

          <h4 className="mt-4">Opiniones</h4>
          <hr />
          {comentarios.map((c, i) => (
            <Comment key={i} usuario={c.usuario} foto={c.foto} contenido={c.contenido} />
          ))}
        </div>
        <footer className="text-center mt-4">
          <hr />
          © 2025, PalAntojo
        </footer>
      </div>
    </div>
  );
};

export default VerDetalles;