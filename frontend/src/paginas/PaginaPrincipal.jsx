// src/paginas/PaginaPrincipal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../componentes/Navbar";
import CardRecetaPopular from "../componentes/CardRecetaPopular";
import CardChef from "../componentes/CardChef";
import CardUser from "../componentes/CardUser";
import CardRecetaBusqueda from "../componentes/CardRecetaBusqueda";
import "../styles/PaginaPrincipal.css";
import { useLocation, useNavigate } from "react-router-dom";

const PaginaPrincipal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [busquedaUsuarios, setBusquedaUsuarios] = useState([]);
  const [busquedaRecetas, setBusquedaRecetas] = useState([]);
  const [user, setUser] = useState(null);
  const [recetaPopular, setRecetaPopular] = useState(null);
  const [chefs, setChefs] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setUser(storedUser);

    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) buscarTodo(q);
    else {
      setBusquedaUsuarios([]);
      setBusquedaRecetas([]);
      cargarRecetaMasComentada();
      cargarTopChefs();
    }
  }, [location.search]);

  const cargarRecetaMasComentada = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/reportes/receta-mas-comentada");
      setRecetaPopular(data);
    } catch (error) {
      console.error("Error al obtener la receta popular:", error);
    }
  };

  const cargarTopChefs = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/reportes/top-usuarios-recetas");
      setChefs(data);
    } catch (error) {
      console.error("Error al obtener top chefs:", error);
    }
  };

  const buscarTodo = async (q) => {
    setQuery(q);
    if (!q || q.trim() === "") {
      setBusquedaUsuarios([]);
      setBusquedaRecetas([]);
      return;
    }

    try {
      const [usuariosRes, recetasRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/search/users?q=${q}`),
        axios.get(`http://localhost:3000/api/recetas/search?q=${q}`)
      ]);

      setBusquedaUsuarios(usuariosRes.data);
      setBusquedaRecetas(recetasRes.data);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      setBusquedaUsuarios([]);
      setBusquedaRecetas([]);
    }
  };

  const handleRecetaEliminada = async (idReceta) => {
    if (recetaPopular && recetaPopular.id === idReceta) {
      setRecetaPopular(null);
      await cargarRecetaMasComentada();
    }
    await cargarTopChefs();
  };

  return (
    <div className="pagina-principal">
      <Navbar
        user={user}
        onSearchChange={(value) => {
          setQuery(value);
          if (value.trim() === "") {
            setBusquedaUsuarios([]);
            setBusquedaRecetas([]);
          } else {
            buscarTodo(value);
          }
        }}
      />

      <main className="container mt-4">
        {!query || query.trim() === "" ? (
          <div id="seccionPrincipal">
            {/* --- SECCIÓN POPULAR --- */}
            <section className="mb-5">
              <div className="seccion-titulo-principal">
                <h2 className="titulo-seccion-principal">LO MÁS POPULAR</h2>
                <p className="text-muted">La receta más comentada de la comunidad en PalAntojo</p>
                <hr />
                {recetaPopular ? (
                  <CardRecetaPopular
                    receta={recetaPopular}
                    onRecetaEliminada={handleRecetaEliminada}
                  />
                ) : (
                  <p className="text-center text-muted">Buscando la receta más popular...</p>
                )}
              </div>
            </section>

            {/* --- SECCIÓN TOP CHEFS --- */}
            <section className="mb-5">
              <div className="seccion-titulo-principal">
                <h2 className="titulo-seccion-principal">TOP CHEFS</h2>
                <p className="text-muted">Los usuarios con más recetas en PalAntojo</p>
                <hr />
                <div className="row">
                  {chefs.map((chef, i) => (
                    <div key={chef.id} className="col-md-4 mb-4">
                      <CardChef chef={chef} posicion={i + 1} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          // --- RESULTADOS DE BÚSQUEDA ---
          <div id="seccionBusqueda">
            <h4 className="titulo">Resultados para "{query}"</h4>

            {/* BUSQUEDA DE USUARIOS */}
            <div className="mb-4">
              <h5><i className="bi bi-person-circle"></i> Usuarios</h5>
              <div className="row">
                {busquedaUsuarios.length > 0 ? (
                  busquedaUsuarios.map((u) => (
                    <div key={u.id} className="col-md-3 mb-3">
                      <CardUser usuario={u} myId={user?.id} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No se encontraron usuarios.</p>
                )}
              </div>
            </div>

            {/* BUSQUEDA DE RECETAS */}
            <div className="mb-4">
              <h5><i class="bi bi-fork-knife"></i> Recetas</h5>
              <div className="row">
                {busquedaRecetas.length > 0 ? (
                  busquedaRecetas.map((r) => (
                  <div key={r.id_receta || r.id} className="col-md-4 mb-3">
                    <CardRecetaBusqueda
                      receta={r}
                      onRecetaEliminada={(idEliminada) =>
                        setBusquedaRecetas((prev) => prev.filter((rec) => rec.id_receta !== idEliminada))
                      }
                    />
                  </div>
                ))) : (
                  <p className="text-muted">No se encontraron recetas.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer>
        <hr />
        © 2025, PalAntojo
      </footer>
    </div>
  );
};

export default PaginaPrincipal;