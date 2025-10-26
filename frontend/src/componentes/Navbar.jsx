import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PaginaPrincipal.css";

const Navbar = ({ user, onSearchChange }) => {
  const navigate = useNavigate();
  console.log("Navbar user:", user);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/"); // PARA CERRAR SESIÓN -> LOGIN
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const value = e.target.search.value.trim();
    onSearchChange(value); // Notificar a PaginaPrincipal
    if (value) {
      navigate(`/PaginaPrincipal?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <a href="/PaginaPrincipal" title="PalAntojo">
            <img src="/Logo.png" alt="Logo" className="logo" />
          </a>

          {user && (
            <div className="d-flex align-items-center user-info">
            <div onClick={() => navigate(`/usuario/${user.username}`)}>
                <img
                  src={`http://localhost:3000${user.fotoPerfil}` || "/Imagenes/default.png"}
                  alt="Foto de perfil"
                  id="fotoNavbar"
                  className="logo"
                />
              </div>
              <span 
                className="username" 
                id="nombreNavbar"
                style={{ cursor: "pointer", color: "white" }}
                onClick={() => navigate(`/usuario/${user.username}`)}>
                @{user.username}
              </span>
            </div>
          )}
        </div>

        <div className="search-bar">
         <form
            className="d-flex align-items-center position-relative"
            id="searchForm"
            onSubmit={handleSearchSubmit}
         >  
         <input
            id="searchInput"
          name="search"
          className="form-control"
          type="search"
          placeholder="Buscar..."
          onChange={(e) => onSearchChange(e.target.value)} // LIMPIA LA BUSQUEDA
         />  
         <button
            className="btn btn-search"
            type="submit"
            style={{ marginLeft: '-35px', background: 'transparent', border: 'none' }}
            >
            <i className="bi bi-search" id="buscar"></i>
         </button>
         </form>
        </div>

        <div className="d-flex align-items-center icon-group">
          <a href="/CrearEditarReceta" className="btn-publish" title="Publicar receta">
            <i className="bi bi-plus-circle-fill" id="publicar"></i>
          </a>

          <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
            <i className="bi bi-box-arrow-right" id="logout"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;