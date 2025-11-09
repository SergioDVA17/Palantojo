import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../componentes/Navbar";
import CardRecetaPopular from "../componentes/CardRecetaPopular";
import CardChef from "../componentes/CardChef";
import CardUser from "../componentes/CardUser";
import "../styles/PaginaPrincipal.css";
import { useLocation, useNavigate } from "react-router-dom";

const PaginaPrincipal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [busqueda, setBusqueda] = useState([]);
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
    if (q) buscarUsuarios(q);
    else {
      setBusqueda([]);
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

    const buscarUsuarios = async (q) => {
    setQuery(q);
    if (!q || q.trim() === "") {
      setBusqueda([]);
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:3000/api/search/users?q=${q}`);
      setBusqueda(data);
    } catch (err) {
      console.error("Error en búsqueda:", err);
      setBusqueda([]);
    }
  };

  return (
    <div className="pagina-principal">

      <Navbar user={user} // NAVBAR Y LA BUSQUEDA
      onSearchChange={(value) => {
        setQuery(value);

        if (value.trim() === "") {
          setBusqueda([]);
        } else {
          buscarUsuarios(value);
        }
      }}/>

      <main className="container mt-4">
        {!query || query.trim() === "" ? (
          <div id="seccionPrincipal">
            <section className="mb-5">
              <div className="seccion-titulo-principal">
                <h2 className="titulo-seccion-principal">LO MÁS POPULAR</h2>
                <p className="text-muted">La receta favorita de la comunidad en PalAntojo</p>
                <hr></hr>
               {recetaPopular ? (
                <CardRecetaPopular receta={recetaPopular} />
              ) : (
                <p className="text-center text-muted">Buscando la receta más popular...</p>
              )}
              
              </div>
            </section>

            <section className="mb-5">
              <div className="seccion-titulo-principal">
                <h2 className="titulo-seccion-principal">TOP CHEFS</h2>
                <p className="text-muted">Los usuarios más activos en PalAntojo</p>
                <hr></hr>

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
          <div id="seccionBusqueda">
            <h4 className="titulo">Resultados para "{query}"</h4>
            <div className="row">
              {busqueda.length > 0 ? (
                busqueda.map((u) => (
                  <div key={u.id} className="col-md-3 mb-3">
                    <CardUser usuario={u} myId={user?.id} />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">No se encontraron resultados.</p>
              )}
            </div>
          </div>
        )}
      </main>
      <footer><hr></hr>© 2025, PalAntojo</footer>
    </div>
  );
};

export default PaginaPrincipal;