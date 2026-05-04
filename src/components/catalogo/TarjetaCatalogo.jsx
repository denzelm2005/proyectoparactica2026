import React, { useState } from "react";
import { Card, Badge, Modal, Button } from "react-bootstrap";

const TarjetaCatalogo = ({ producto, categoriaNombre }) => {
  const [mostrarModal, setMostrarModal] = useState(false);

  // Lógica para truncar texto de descripción
  const descripcion = producto.descripcion_producto || "";
  const previsualizacionTexto = descripcion.length > 56
    ? descripcion.substring(0, 50) + "..."
    : descripcion;
  const tieneMasTexto = descripcion.length > 50;

  return (
    <>
      <Card
        className="h-100 border-0 shadow-lg overflow-hidden position-relative cursor-pointer"
        style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
        role="button"
        tabIndex={0}
        onClick={() => setMostrarModal(true)}
        onKeyDown={(e) => e.key === "Enter" && setMostrarModal(true)}
        aria-labelledby={`producto-${producto.id_producto}-title`}
      >
        {/* Imagen del Producto */}
        <div className="position-relative overflow-hidden" style={{ height: "200px" }}>
          <Card.Img
            variant="top"
            src={producto.url_imagen}
            alt={producto.nombre_producto}
            style={{ objectFit: "cover", height: "100%", width: "100%", transition: "transform 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title
            id={`producto-${producto.id_producto}-title`}
            className="h6 fw-bold text-dark mb-2"
          >
            {producto.nombre_producto}
          </Card.Title>

          <Card.Text className="text-muted small flex-grow-1">
            {previsualizacionTexto}
            {tieneMasTexto && (
              <span className="text-primary fw-medium ms-1">Leer más</span>
            )}
          </Card.Text>

          <div className="mt-2">
            <Badge bg="secondary" pill>
              {categoriaNombre || "Sin categoría"}
            </Badge>
          </div>

          <div className="mt-auto pt-2">
            <h4 className="text-success fw-bold mb-0">
              C$ {parseFloat(producto.precio_venta).toFixed(2)}
            </h4>
          </div>
        </Card.Body>
      </Card>

      {/* Modal de Detalles */}
      <Modal 
        show={mostrarModal} 
        onHide={() => setMostrarModal(false)} 
        size="lg" 
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h4 fw-bold">
            {producto.nombre_producto}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row">
            <div className="col-md-5 mb-3 mb-md-0">
              <img
                src={producto.url_imagen}
                alt={producto.nombre_producto}
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "300px", objectFit: "contain", width: "100%" }}
              />
            </div>
            <div className="col-md-7">
              <div className="d-flex align-items-center mb-3">
                <Badge bg="secondary" pill className="me-2">
                  {categoriaNombre || "Sin categoría"}
                </Badge>
                <h3 className="text-success fw-bold mb-0 ms-auto">
                  C$ {parseFloat(producto.precio_venta).toFixed(2)}
                </h3>
              </div>
              <h6 className="fw-bold text-secondary text-uppercase small mb-2">
                Descripción
              </h6>
              <p className="text-muted mb-0" style={{ lineHeight: "1.6" }}>
                {descripcion || "Sin descripción disponible."}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TarjetaCatalogo;