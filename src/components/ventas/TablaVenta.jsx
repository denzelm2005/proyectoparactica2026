import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaVentas = ({ ventas, abrirEdicion, imprimirVenta }) => {
  return (
    <Table striped hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Empleado</th>
          <th>Pago</th>
          <th className="text-end">Total</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ventas.map((venta) => (
          <tr key={venta.id_venta}>
            <td>#{venta.id_venta}</td>
            <td>{new Date(venta.fecha_venta).toLocaleString('es-NI')}</td>
            <td>
              {venta.clientes?.nombre_cliente} {venta.clientes?.apellido_cliente}
            </td>
            <td>
              {venta.empleados?.nombre_empleado} {venta.empleados?.apellido_empleado}
            </td>
            <td>
              <span className="badge bg-info">{venta.metodo_pago}</span>
            </td>
            <td className="text-end fw-bold">C$ {parseFloat(venta.total || 0).toFixed(2)}</td>
            <td className="text-center">
              <Button 
                variant="outline-warning" 
                size="sm" 
                onClick={() => abrirEdicion(venta)}
                className="me-2"
                title="Editar Venta"
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => imprimirVenta(venta)}
                title="Imprimir Ticket"
              >
                <i className="bi bi-printer"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaVentas;