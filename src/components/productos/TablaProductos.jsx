import React, { useState, useEffect } from "react";
import { Table, Spinner, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaProductos = ({
  productos,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se asume que si productos no es null, ya terminó el proceso de carga inicial
    if (productos) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [productos]);

  return (
    <>
      {loading ? (
        <div className="text-center">
          <h4>Cargando productos...</h4>
          <Spinner animation="border" variant="primary" role="status" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center">
          <h4>No hay productos registrados.</h4>
        </div>
      ) : (
        <Table striped borderless hover responsive size="sm" className="align-middle">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th className="d-none d-md-table-cell">Categoría</th>
              <th>Precio</th>
              <th className="d-none d-lg-table-cell">Descripción</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto}>
                <td>
                  <Image
                    src={producto.url_imagen}
                    alt={producto.nombre_producto}
                    rounded
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </td>
                <td>{producto.nombre_producto}</td>
                <td className="d-none d-md-table-cell">
                  {/* Aquí se asume que el objeto producto trae el nombre de la categoría o el ID */}
                  {producto.categorias?.nombre_categoria || producto.categoria_producto}
                </td>
                <td>${parseFloat(producto.precio_venta).toFixed(2)}</td>
                <td className="d-none d-lg-table-cell">
                  {producto.descripcion_producto || "Sin descripción"}
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(producto)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEliminacion(producto)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaProductos;