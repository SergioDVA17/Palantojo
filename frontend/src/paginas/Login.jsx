import React, { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/Login.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Por favor llena todos los campos",
        confirmButtonColor: "#da2627",
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/login", { usuario, password });

      if (res.status === 200) {
        const user = res.data.user;
        sessionStorage.setItem("user", JSON.stringify(user));

        Swal.fire({
          icon: "success",
          title: "Inicio de sesión correcto",
          text: "Redirigiendo...",
          timer: 1500,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.href = "/PaginaPrincipal"; 
        }, 1500);
      }
    } catch (error) {
      console.error("Error en login:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo iniciar sesión. Verifica tus datos.",
        confirmButtonColor: "#da2627",
      });
    }
  };

  return (
  <div className="login-page">
    <div className="container"> 
      <h1>
        <Link to="/" style={{ color: "#da2627", textDecoration: "none", fontWeight: "bold" }}>
          PalAntojo
        </Link>
      </h1>
      <h2 className="text-center mb-4">Iniciar sesión</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre de usuario o correo electrónico"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
          <i className="bi bi-person-fill"></i>
        </div>

        <div className="form-group">
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i className="bi bi-lock-fill"></i>
        </div>

        <button className="btn-login" type="submit">
          Ingresar
        </button>
      </form>

      <hr />

      <div className="link-registro text-center">
        <p>
          <a href="/Registro">Crea tu cuenta</a>
        </p>
      </div>
    </div>
     <footer>© 2025, PalAntojo</footer>
  </div>
  );
};

export default Login;