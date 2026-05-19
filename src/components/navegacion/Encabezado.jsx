import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import logo from "../../assets/logo.png";
import { supabase } from "../../database/supabaseconfig";
// Importar el hook de autenticación
import { useAuth } from "../../context/AuthContext";

const Encabezado = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Para detectar la ruta actual

  // Desestructurar la lógica para verificar permisos, cierre de sesión y usuario autenticado
  const { tienePermiso, logout, usuario } = useAuth();

  const manejarToggle = () => setMostrarMenu(!mostrarMenu);

  const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

  // Actualizar la función cerrarSesion usando la función logout del contexto
  const cerrarSesion = async () => {
    try {
      await logout();
      setMostrarMenu(false);
      navigate("/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err.message);
    }
  };

  // Detectar rutas especiales
  const esLogin = location.pathname === "/login";
  const esCatalogo =
    location.pathname === "/catalogo" &&
    localStorage.getItem("usuario-supabase") === null;

  // Contenido del menú
  let contenidoMenu;

  if (esLogin) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">
        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "color-texto-marca" : "text-black"}
        >
          <i className="bi-person-fill-lock me-2"></i>
          Iniciar sesión
        </Nav.Link>
      </Nav>
    );
  } else if (esCatalogo) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">
        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "color-texto-marca" : "text-black"}
        >
          <i className="bi-images me-2"></i>
          <strong>Catálogo</strong>
        </Nav.Link>
      </Nav>
    );
  } else {
    contenidoMenu = (
      <>
        <Nav className="ms-auto pe-2">
          {/* Validar y envolver las opciones de navegación empleando tienePermiso */}
          {tienePermiso("ver_inicio") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-house-fill me-2"></i> : null}
              <strong>Inicio</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_categorias") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/categorias")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-bookmark-fill me-2"></i> : null}
              <strong>Categorías</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_productos") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/productos")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
              <strong>Productos</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_clientes") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/cliente")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
              <strong>Clientes</strong>
            </Nav.Link>
          )}

          {tienePermiso("ver_empleados") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/empleado")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
              <strong>Empleados</strong>
            </Nav.Link>
          )}

          {/* Opción para ir al catálogo público desde admin */}
          {tienePermiso("ver_catalogo") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/catalogo")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-images me-2"></i> : null}
              <strong>Catálogo</strong>
            </Nav.Link>
          )}

          {/* Opción para ir al permisos público desde admin */}
          {tienePermiso("ver_permisos") && (
            <Nav.Link
              onClick={() => manejarNavegacion("/permisos")}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              {mostrarMenu ? <i className="bi-images me-2"></i> : null}
              <strong>Permisos</strong>
            </Nav.Link>
          )}

          <hr />

          {/* Ícono cerrar sesión en barra superior */}
          {!mostrarMenu && (
            <Nav.Link
              onClick={cerrarSesion}
              className={mostrarMenu ? "color-texto-marca" : "text-black"}
            >
              <i className="bi-box-arrow-right me-2"></i>
            </Nav.Link>
          )}

          <hr />
        </Nav>

        {/* Información de usuario y botón cerrar sesión */}
        {mostrarMenu && (
          <div className="mt-3 p-3 rounded bg-light text-dark">
            <p className="mb-2">
              <i className="bi-envelope-fill me-2"></i>
              {localStorage.getItem("usuario-supabase")?.toLowerCase() || "Usuario"}
            </p>

            <button
              className="btn btn-outline-danger mt-3 w-100"
              onClick={cerrarSesion}
            >
              <i className="bi-box-arrow-right me-2"></i>
              Cerrar sesión
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <Navbar expand="md" fixed="top" className="color-navbar shadow-lg" variant="dark">
      <Container>
        <Navbar.Brand
          onClick={() => manejarNavegacion(esCatalogo ? "/catalogo" : "/")}
          className="text-black fw-bold d-flex align-items-center"
          style={{ cursor: "pointer" }}
        >
          <img
            alt=""
            src={logo}
            width="45"
            height="45"
            className="d-inline-block me-2"
          />
          <strong>
            <h4 className="mb-0">Discosa</h4>
          </strong>
        </Navbar.Brand>

        {/* Botón del menú */}
        {!esLogin && (
          <Navbar.Toggle
            aria-controls="menu-offcanvas"
            onClick={manejarToggle}
          />
        )}

        {/* Menú lateral */}
        <Navbar.Offcanvas
          id="menu-offcanvas"
          placement="end"
          show={mostrarMenu}
          onHide={() => setMostrarMenu(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menú Discosa</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            {contenidoMenu}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;