import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import "bootstrap/dist/css/bootstrap.min.css";
//import "bootstrap-icons/font/bootstrap-icons.css";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import PaginaPrincipal from "./paginas/PaginaPrincipal";
import PerfilUsuario from "./paginas/PerfilUsuario";
import EditarPerfil from "./paginas/EditarPerfil";
import VerDetalles from "./paginas/VerDetalles";
import CrearEditarReceta from "./paginas/CrearEditarReceta";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/PaginaPrincipal" element={<PaginaPrincipal />} />
        <Route path="/usuario/:username" element={<PerfilUsuario />} />
        <Route path="/EditarPerfil" element={<EditarPerfil />} />
        <Route path="/VerDetalles/:id" element={<VerDetalles />} />
        <Route path="/CrearEditarReceta/:recetaId?" element={<CrearEditarReceta />} />
      </Routes>
    </Router>
  );
}

export default App;