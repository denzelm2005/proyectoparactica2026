import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroEmpleado from "../components/empleados/ModalRegistroEmpleado";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaEmpleados from "../components/empleados/TablaEmpleados";
import TarjetaEmpleado from "../components/empleados/TarjetaEmpleado";
import ModalEdicionEmpleado from "../components/empleados/ModalEdicionEmpleado";
import ModalEliminacionEmpleado from "../components/empleados/ModalEliminacionEmpleado";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/Ordenamiento/Paginacion";

const Empleados = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    pin_acceso: "",
    tipo_empleado: "",
  });

  // --- Variables de estado ---
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState({
    id_empleado: "",
    nombre: "",
    apellido: "",
    pin_acceso: "",
    tipo_empleado: "",
  });

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(10);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // --- Métodos de carga y control ---
  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .order("id_empleado", { ascending: true });

      if (error) {
        console.error("Error al cargar empleados:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cargar empleados.",
          tipo: "error",
        });
        return;
      }
      setEmpleados(data || []);
    } catch (err) {
      console.error("Excepción al cargar empleados:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar empleados.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEdicion = (empleado) => {
    setEmpleadoEditar({
      id_empleado: empleado.id_empleado,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      pin_acceso: empleado.pin_acceso,
      tipo_empleado: empleado.tipo_empleado,
    });
    setMostrarModalEdicion(true);
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setEmpleadoEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
    establecerPaginaActual(1); 
  };

  const abrirModalEliminacion = (empleado) => {
    setEmpleadoAEliminar(empleado);
    setMostrarModalEliminacion(true);
  };

  // --- Lógica de Paginación ---
  const empleadosPaginados = empleadosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // --- Hook de carga inicial ---
  useEffect(() => {
    cargarEmpleados();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const actualizarEmpleado = async () => {
    try {
      if (!empleadoEditar.nombre.trim() || !empleadoEditar.pin_acceso.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar los campos obligatorios.", tipo: "advertencia" });
        return;
      }
      setMostrarModalEdicion(false);
      const { error } = await supabase
        .from("empleados")
        .update({
          nombre: empleadoEditar.nombre,
          apellido: empleadoEditar.apellido,
          pin_acceso: empleadoEditar.pin_acceso,
          tipo_empleado: empleadoEditar.tipo_empleado,
        })
        .eq("id_empleado", empleadoEditar.id_empleado);

      if (error) throw error;
      await cargarEmpleados();
      setToast({ mostrar: true, mensaje: `Empleado actualizado exitosamente.`, tipo: "exito" });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al actualizar empleado.", tipo: "error" });
    }
  };

  const eliminarEmpleado = async () => {
    if (!empleadoAEliminar) return;
    try {
      setMostrarModalEliminacion(false);
      const { error } = await supabase
        .from("empleados")
        .delete()
        .eq("id_empleado", empleadoAEliminar.id_empleado);

      if (error) throw error;
      await cargarEmpleados();
      setToast({ mostrar: true, mensaje: `Empleado eliminado exitosamente.`, tipo: "exito" });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar empleado.", tipo: "error" });
    }
  };

  const agregarEmpleado = async () => {
    try {
      if (!nuevoEmpleado.nombre.trim() || !nuevoEmpleado.pin_acceso.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar los campos obligatorios.", tipo: "advertencia" });
        return;
      }
      const { error } = await supabase.from("empleados").insert([nuevoEmpleado]);
      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Empleado registrado exitosamente.", tipo: "exito" });
      setNuevoEmpleado({ nombre: "", apellido: "", pin_acceso: "", tipo_empleado: "" });
      setMostrarModal(false);
      await cargarEmpleados();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al registrar empleado.", tipo: "error" });
    }
  };

  // --- Hook para Filtrado en tiempo real ---
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setEmpleadosFiltrados(empleados);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = empleados.filter(
        (emp) =>
          emp.nombre.toLowerCase().includes(textoLower) ||
          emp.apellido.toLowerCase().includes(textoLower) ||
          (emp.tipo_empleado && emp.tipo_empleado.toLowerCase().includes(textoLower))
      );
      setEmpleadosFiltrados(filtrados);
    }
  }, [textoBusqueda, empleados]);

  return (
    <Container className="mt-3">
      {/* Título y botón Nuevo Empleado */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi bi-person-badge-fill me-2"></i> Empleados
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Empleado</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Cuadro de búsqueda */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, apellido o cargo..."
          />
        </Col>
      </Row>

      {/* Mensaje de no coincidencias */}
      {!cargando && textoBusqueda.trim() && empleadosFiltrados.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron empleados que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      {/* Bloques de carga */}
      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando empleados...</p>
          </Col>
        </Row>
      )}

      {/* Visualización Responsiva Paginada */}
      {!cargando && empleadosPaginados.length > 0 && (
        <Row>
          {/* VISTA TARJETAS: Móvil/Tablet */}
          <Col xs={12} className="d-lg-none">
            <TarjetaEmpleado
              empleados={empleadosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>

          {/* VISTA TABLA: Escritorio */}
          <Col lg={12} className="d-none d-lg-block">
            <TablaEmpleados
              empleados={empleadosPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {/* Paginación */}
      {!cargando && empleadosFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={empleadosFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      {/* Modales */}
      <ModalRegistroEmpleado
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoEmpleado={nuevoEmpleado}
        manejoCambioInput={manejoCambioInput}
        agregarEmpleado={agregarEmpleado}
      />

      <ModalEdicionEmpleado
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        empleadoEditar={empleadoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarEmpleado={actualizarEmpleado}
      />

      <ModalEliminacionEmpleado
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarEmpleado={eliminarEmpleado}
        empleado={empleadoAEliminar}
      />

      {/* Notificación */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Empleados;