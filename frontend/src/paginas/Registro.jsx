import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Registro.css";

const Registro = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    username: "",
    password: "",
  });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFotoPerfil(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const validacionNombre = (texto) =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/.test(texto.trim());
  const validacionCorreo = (correo) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
  const validacionUsername = (username) =>
    /^[A-Za-z0-9._-]{3,}$/.test(username.trim());
  const validacionPass = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombres, apellidos, correo, username, password } = formData;

    if (!nombres || !validacionNombre(nombres))
      return Swal.fire("Nombre inválido", "Ingresa un nombre válido", "warning");

    if (!apellidos || !validacionNombre(apellidos))
      return Swal.fire("Apellido inválido", "Ingresa un apellido válido", "warning");

    if (!correo || !validacionCorreo(correo))
      return Swal.fire(
        "Correo inválido",
        "Ingresa un correo electrónico válido (ejemplo: nombre@dominio.com)",
        "warning"
      );

    if (!username || !validacionUsername(username))
      return Swal.fire(
        "Nombre de usuario inválido",
        "Debe tener mínimo 3 caracteres y sin espacios",
        "warning"
      );

    if (!password || !validacionPass(password))
      return Swal.fire(
        "Contraseña inválida",
        "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
        "warning"
      );

    if (!fotoPerfil)
      return Swal.fire("Falta foto de perfil", "Selecciona una imagen", "warning");

    const data = new FormData();
    data.append("nombres", nombres);
    data.append("apellidos", apellidos);
    data.append("correo", correo);
    data.append("username", username);
    data.append("password", password);
    data.append("fotoPerfil", fotoPerfil);

    try {
      const res = await axios.post("http://localhost:3000/register", data);
      if (res.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Redirigiendo al inicio de sesión...",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo registrar. Intenta más tarde.",
        confirmButtonColor: "#da2627",
      });
    }
  };

  return (
    <div className="registro-page">
      <h1>
        <Link to="/" style={{ color: "#da2627", textDecoration: "none" }}>
          PalAntojo
        </Link>
      </h1>

      <div className="container">
        <form className="border p-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre(s)*"
              value={formData.nombres}
              onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Apellido*"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico*"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre de usuario*"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña*"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Foto de perfil:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Preview" className="preview" />
              </div>
            )}
          </div>

          <button type="submit" className="btn-registro">
            Crear cuenta
          </button>

          <div className="login">
            <p>
              ¿Ya tienes cuenta?{" "}
              <Link to="/" className="link-login">
                Iniciar sesión <i className="bi bi-arrow-right-short"></i>
              </Link>
            </p>
          </div>
        </form>

        <div className="imagen">
          <img src="/Logo.png" alt="Logo" />
        </div>
      </div>

      <footer>© 2025, PalAntojo</footer>
    </div>
  );
};

export default Registro;
