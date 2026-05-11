import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroEmpleado = ({
  mostrarModal,
  setMostrarModal,
  nuevoEmpleado,
  manejoCambioInput,
  agregarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarEmpleado();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoEmpleado.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoEmpleado.apellido}
              onChange={manejoCambioInput}
              placeholder="Ingresa el apellido"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>PIN de Acceso</Form.Label>
            <Form.Control
              type="password"
              name="pin_acceso"
              value={nuevoEmpleado.pin_acceso}
              onChange={manejoCambioInput}
              placeholder="Ingresa el PIN"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cargo / Tipo</Form.Label>
            <Form.Control
              type="text"
              name="tipo_empleado"
              value={nuevoEmpleado.tipo_empleado}
              onChange={manejoCambioInput}
              placeholder="Ej: Administrador, Cajero..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={
            nuevoEmpleado.nombre.trim() === "" ||
            nuevoEmpleado.pin_acceso.trim() === "" ||
            deshabilitado
          }
        >
          {deshabilitado ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroEmpleado;