import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCliente from "../components/cliente/ModalRegistroCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaClientes from "../components/cliente/TablaClientes";
import TarjetaCliente from "../components/cliente/TarjetaCliente";
import ModalEdicionCliente from "../components/cliente/ModalEdicionCliente";
import ModalEliminacionCliente from "../components/cliente/ModalEliminacionCliente";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/Ordenamiento/Paginacion";

const Clientes = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    celular: "",
  });

  // --- Variables de estado ---
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [clienteEditar, setClienteEditar] = useState({
    id_cliente: "",
    nombre: "",
    apellido: "",
    celular: "",
  });

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(10);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // --- Métodos de carga y control ---
  const cargarClientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id_cliente", { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al cargar clientes.",
          tipo: "error",
        });
        return;
      }
      setClientes(data || []);
    } catch (err) {
      console.error("Excepción al cargar clientes:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al cargar clientes.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEdicion = (cliente) => {
    setClienteEditar({
      id_cliente: cliente.id_cliente,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      celular: cliente.celular,
    });
    setMostrarModalEdicion(true);
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setClienteEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
    establecerPaginaActual(1);
  };

  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminacion(true);
  };

  // --- Lógica de Paginación ---
  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // --- Hook de carga inicial ---
  useEffect(() => {
    cargarClientes();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const actualizarCliente = async () => {
    try {
      if (!clienteEditar.nombre.trim() || !clienteEditar.apellido.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar los campos obligatorios.", tipo: "advertencia" });
        return;
      }
      setMostrarModalEdicion(false);
      const { error } = await supabase
        .from("clientes")
        .update({
          nombre: clienteEditar.nombre,
          apellido: clienteEditar.apellido,
          celular: clienteEditar.celular,
        })
        .eq("id_cliente", clienteEditar.id_cliente);

      if (error) throw error;
      await cargarClientes();
      setToast({ mostrar: true, mensaje: `Cliente actualizado exitosamente.`, tipo: "exito" });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al actualizar cliente.", tipo: "error" });
    }
  };

  const eliminarCliente = async () => {
    if (!clienteAEliminar) return;
    try {
      setMostrarModalEliminacion(false);
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id_cliente", clienteAEliminar.id_cliente);

      if (error) throw error;
      await cargarClientes();
      setToast({ mostrar: true, mensaje: `Cliente eliminado exitosamente.`, tipo: "exito" });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar cliente.", tipo: "error" });
    }
  };

  const agregarCliente = async () => {
    try {
      if (!nuevoCliente.nombre.trim() || !nuevoCliente.apellido.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar los campos obligatorios.", tipo: "advertencia" });
        return;
      }
      const { error } = await supabase.from("clientes").insert([nuevoCliente]);
      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Cliente registrado exitosamente.", tipo: "exito" });
      setNuevoCliente({ nombre: "", apellido: "", celular: "" });
      setMostrarModal(false);
      await cargarClientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al registrar cliente.", tipo: "error" });
    }
  };

  // --- Hook para Filtrado en tiempo real ---
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = clientes.filter(
        (cli) =>
          cli.nombre.toLowerCase().includes(textoLower) ||
          cli.apellido.toLowerCase().includes(textoLower) ||
          (cli.celular && cli.celular.toLowerCase().includes(textoLower))
      );
      setClientesFiltrados(filtrados);
    }
  }, [textoBusqueda, clientes]);

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi bi-people-fill me-2"></i> Clientes
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Cliente</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, apellido o celular..."
          />
        </Col>
      </Row>

      {!cargando && textoBusqueda.trim() && clientesFiltrados.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron clientes que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      {cargando && (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando clientes...</p>
          </Col>
        </Row>
      )}

      {!cargando && clientesPaginados.length > 0 && (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaCliente
              clientes={clientesPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>

          <Col lg={12} className="d-none d-lg-block">
            <TablaClientes
              clientes={clientesPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {!cargando && clientesFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={clientesFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
      />

      <ModalEdicionCliente
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        clienteEditar={clienteEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCliente={actualizarCliente}
      />

      <ModalEliminacionCliente
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCliente={eliminarCliente}
        cliente={clienteAEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Clientes;