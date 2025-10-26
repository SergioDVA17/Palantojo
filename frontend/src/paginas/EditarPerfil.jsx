import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import Navbar from "../componentes/Navbar";
import "../styles/EditarPerfil.css";

const EditarPerfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (!storedUser) {
      navigate("/InicioSesion");
      return;
    }
    setUser(storedUser);
    setNombres(storedUser.nombres || "");
    setApellidos(storedUser.apellidos || "");
    setCorreo(storedUser.correo || "");
    setUsername(storedUser.username || "");
  }, []);   
  
  const showAlert = (message, icon = "info", timer = 2000) => {
    Swal.fire({
      text: message,
      icon,
      timer,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      width: "300px",
    });
  };

  const validacionNombre = (texto) =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(texto.trim());
  const validacionCorreo = (correo) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  const validacionUsername = (username) =>
    /^[A-Za-z0-9._-]{3,}$/.test(username.trim());
  const validacionPass = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  
  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!nombres || !validacionNombre(nombres)) return showAlert("Nombre inválido", "warning");
    if (!apellidos || !validacionNombre(apellidos)) return showAlert("Apellido inválido", "warning");
    if (!correo || !validacionCorreo(correo)) return showAlert("Correo inválido", "warning");
    if (!username || !validacionUsername(username)) return showAlert("Nombre de usuario inválido", "warning");
    if (password && !validacionPass(password))
      return showAlert("Contraseña inválida. Debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número", "warning");

    const formData = new FormData();
    formData.append("id", user.id);
    formData.append("nombres", nombres);
    formData.append("apellidos", apellidos);
    formData.append("correo", correo);
    formData.append("username", username);
    if (password) formData.append("password", password);
    if (profileFile) formData.append("profile_image", profileFile);

    try {
      const { data } = await axios.post("http://localhost:3000/update-profile", formData);
      showAlert(data.message, data.success ? "success" : "error", 2500);

      if (data.success) {
        const updatedUser = { ...user, nombres, apellidos, correo, username };
        if (data.newFotoPerfil) updatedUser.fotoPerfil = data.newFotoPerfil;
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setTimeout(() => navigate("/usuario/" + username), 1500);
      }
    } catch (err) {
      console.error(err);
      showAlert("Hubo un problema con la conexión al servidor", "error", 2500);
    }
  }; 

  const handleEliminarCuenta = async () => {
    const confirmar = await Swal.fire({
      title: "¿Desea eliminar su cuenta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#da2627",
      cancelButtonColor: "#626a71",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }); 
    
    if (confirmar.isConfirmed) {
      try {
        const { data } = await axios.delete(`http://localhost:3000/api/delete-user/${user.id}`);
        Swal.fire({
          icon: "success",
          title: "Cuenta eliminada",
          text: data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        sessionStorage.clear();
        setTimeout(() => navigate("/"), 1500);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Error en la conexión con el servidor", "error");
      }
    }
  };

    if (!user) return null;

    return (
    <div className="editar-perfil-body">
      <Navbar user={user} onSearchChange={(q) => navigate(`/PaginaPrincipal?q=${encodeURIComponent(q)}`)} />

      <main className="container mt-4">
        <div className="perfil-card text-center">
          <button className="btn-eliminar" onClick={handleEliminarCuenta}>Eliminar cuenta</button>

          <img
            src={preview || (user.fotoPerfil ? `http://localhost:3000${user.fotoPerfil}` : "/Imagenes/default.png")}
            alt="Foto de perfil"
            className="foto-de-perfil"
          />

          <hr />

          <form onSubmit={handleGuardar} className="editar-perfil-form">
            <div className="form-group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files[0];
                    setProfileFile(file);
                    if (file) setPreview(URL.createObjectURL(file));
                    else setPreview("");
                }}/>
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre(s)"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Apellido(s)"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de usuario"
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-guardar">Guardar cambios</button>
            <button type="button" className="btn-cancelar" onClick={() => navigate("/usuario/" + username)}>Cancelar</button>
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

export default EditarPerfil;