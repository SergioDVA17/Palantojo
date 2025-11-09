import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../componentes/Navbar";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/CrearEditarReceta.css";

const CrearEditarReceta = () => {
  const navigate = useNavigate();
  const { recetaId } = useParams(); // Para edición, viene de la URL
  const [sessionUser, setSessionUser] = useState(null);
  const [receta, setReceta] = useState({
    titulo: "",
    estado: "",
    descripcion: "",
    ingredientes: "",
    instrucciones: "",
    imagen: null,
  });
  const [preview, setPreview] = useState(null);
  const [estados, setEstados] = useState([]);
  const isEditing = !!recetaId;

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (!storedUser) navigate("/"); 
    else setSessionUser(storedUser);
  }, [navigate]);

  useEffect(() => {
  axios.get("http://localhost:3000/api/estados")
    .then(({ data }) => setEstados(data))
    .catch(err => console.error("Error al cargar estados:", err));
  }, []);

  // ======= CARGAR RECETA SI ES PARA EDITAR =======
  useEffect(() => {
    if (isEditing) {
      axios
        .get(`http://localhost:3000/api/recetas/${recetaId}`)
        .then(({ data }) => {
          setReceta({
            titulo: data.titulo || "",
            estado: data.estado || "",
            descripcion: data.descripcion || "",
            ingredientes: data.ingredientes || "",
            instrucciones: data.instrucciones || "",
            imagen: null,
          });
          if (data.imagen) setPreview(`http://localhost:3000${data.imagen}`);
        })
        .catch((err) => console.error("Error al cargar receta:", err));
    }
  }, [isEditing, recetaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceta((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      setReceta((prev) => ({ ...prev, imagen: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ======= PUBLICAR / EDITAR =======
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receta.titulo || !receta.estado || !receta.descripcion || !receta.ingredientes || !receta.instrucciones) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor llena todos los campos requeridos",
        icon: "warning",
        confirmButtonColor: "#da2627",
      });
      return;
    }

    const formData = new FormData();
    formData.append("id_usuario", sessionUser.id); 
    formData.append("titulo", receta.titulo);
    formData.append("estado", receta.estado);
    formData.append("descripcion", receta.descripcion);
    formData.append("ingredientes", receta.ingredientes);
    formData.append("instrucciones", receta.instrucciones);
    if (receta.imagen) formData.append("imagen", receta.imagen);

    const actionText = isEditing ? "editar" : "publicar";

    Swal.fire({
      title: `¿Deseas ${actionText} la receta?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#da2627",
      cancelButtonColor: "#626a71",
      confirmButtonText: "Sí",
      cancelButtonText: "Revisar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (isEditing) {
            await axios.put(`http://localhost:3000/api/recetas/${recetaId}`, formData);
          } else {
            await axios.post("http://localhost:3000/api/recetas", formData);
          }
          Swal.fire({
            title: `Receta ${isEditing ? "editada" : "publicada"}`,
            icon: "success",
            confirmButtonColor: "#da2627",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => navigate("/usuario/" + sessionUser.username));
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Error",
            text: "No se pudo guardar la receta",
            icon: "error",
            confirmButtonColor: "#da2627",
          });
        }
      }
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Cancelar?",
      text: "Los cambios no guardados se perderán",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#da2627",
      cancelButtonColor: "#626a71",
      confirmButtonText: "Sí",
      cancelButtonText: "Seguir editando",
    }).then((result) => {
      if (result.isConfirmed) navigate(-1);
    });
  };

  if (!sessionUser) return null;

  return (
    <div className="page-wrapper">
      <Navbar user={sessionUser} onSearchChange={(q) => navigate(`/PaginaPrincipal?q=${encodeURIComponent(q)}`)} />
      <main className="container mt-4">
        <div className="main-container">
          <h2 className="text-center section-title" style={{ fontWeight: "bold", fontSize: "30px"}}>{isEditing ? "Editar receta" : "Nueva receta"}</h2>

          {/* Imagen */}
          <div className="image-upload" onClick={() => document.getElementById("fileInput").click()}>
            {preview ? (
              <img src={preview} alt="preview" className="previewR" style={{ maxHeight: "200px", marginBottom: "10px" }} />
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up upload-icon"></i>
                <p>Haz clic para seleccionar una foto del platillo</p>
              </>
            )}
            <input type="file" id="fileInput" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="section-title">Nombre del platillo:</label>
              <input type="text" className="form-control" name="titulo" value={receta.titulo} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="section-title">Selecciona estado de origen:</label>
              <select className="form-control" name="estado" value={receta.estado} onChange={handleChange} required>
                <option value="">Selecciona un estado...</option>
                {estados.map((e) => (
                  <option key={e.nombre_estado} value={e.nombre_estado}>
                    {e.nombre_estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="section-title">Descripción:</label>
              <textarea className="form-control" name="descripcion" rows="3" value={receta.descripcion} onChange={handleChange} required></textarea>
            </div>

            <div className="form-group">
              <label className="section-title">Ingredientes:</label>
              <textarea className="form-control" name="ingredientes" rows="5" value={receta.ingredientes} onChange={handleChange} required></textarea>
            </div>

            <div className="form-group">
              <label className="section-title">Instrucciones:</label>
              <textarea className="form-control" name="instrucciones" rows="7" value={receta.instrucciones} onChange={handleChange} required></textarea>
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn-action btn-publish-action">{isEditing ? "Guardar cambios" : "Publicar"}</button>
              <button type="button" className="btn-action btn-cancel ml-2" onClick={handleCancel}>Cancelar</button>
            </div>
          </form>
        </div>
      </main>
      <footer className="text-center mt-4">
      <hr />
          © 2025, PalAntojo
      </footer>
    </div>
  );
};

export default CrearEditarReceta;