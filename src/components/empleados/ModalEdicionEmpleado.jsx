import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const ModalEdicionEmpleado = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  empleadoEditar,
  manejoCambioInputEdicion,
  actualizarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarEmpleado();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={empleadoEditar.nombre}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el nombre"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={empleadoEditar.apellido}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el apellido"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>PIN de Acceso</Form.Label>
            <Form.Control
              type="text"
              name="pin_acceso"
              value={empleadoEditar.pin_acceso}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el PIN"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cargo / Tipo</Form.Label>
            <Form.Control
              type="text"
              name="tipo_empleado"
              value={empleadoEditar.tipo_empleado}
              onChange={manejoCambioInputEdicion}
              placeholder="Ej: Administrador, Cajero..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={
            empleadoEditar.nombre.trim() === "" || 
            empleadoEditar.pin_acceso.trim() === "" || 
            deshabilitado
          }
        >
          {deshabilitado ? "Actualizando..." : "Actualizar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionEmpleado;