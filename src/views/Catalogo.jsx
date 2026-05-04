import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import {supabase}  from "../database/supabaseconfig";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // 1. Cargar datos desde Supabase
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resProductos, resCategorias] = await Promise.all([
        supabase.from("productos").select().order("nombre_producto", { ascending: true }),
        supabase.from("categorias").select("id_categoria, nombre_categoria").order("nombre_categoria")
      ]);

      if (resProductos.error) throw resProductos.error;
      if (resCategorias.error) throw resCategorias.error;

      setProductos(resProductos.data);
      setCategorias(resCategorias.data);
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
      setError("No se pudieron cargar los productos. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 2. Lógica de filtrado
  const productosFiltrados = useMemo(() => {
    let filtrados = productos;

    if (categoriaSeleccionada !== "todas") {
      filtrados = filtrados.filter(
        (p) => p.categoria_producto === parseInt(categoriaSeleccionada)
      );
    }

    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter((p) => {
        const nombre = (p.nombre_producto || "").toLowerCase();
        const desc = (p.descripcion_producto || "").toLowerCase();
        const precio = (p.precio_venta || "").toString();
        return nombre.includes(textoLower) || desc.includes(textoLower) || precio.includes(textoLower);
      });
    }
    return filtrados;
  }, [productos, categoriaSeleccionada, textoBusqueda]);

  // 3. Handlers
  const manejarCambioCategoria = (e) => setCategoriaSeleccionada(e.target.value);
  const manejarCambioBusqueda = (e) => setTextoBusqueda(e.target.value);

  const obtenerNombreCategoria = (idCat) => {
    const cat = categorias.find((c) => c.id_categoria === idCat);
    return cat ? cat.nombre_categoria : "Sin categoría";
  };

  return (
    <Container className="mt-3 px-3">
      <Row className="text-center mb-4">
        <Col>
          <h2 className="fw-bold">Catálogo</h2>
          <p className="lead text-muted">Nuestros productos de belleza</p>
        </Col>
      </Row>

      <Row className="mb-4 align-items-end g-3">
        <Col md={4} lg={3}>
          <Form.Group controlId="filtroCategoria">
            <Form.Label className="small fw-bold">Categoría</Form.Label>
            <Form.Select 
              value={categoriaSeleccionada} 
              onChange={manejarCambioCategoria}
              className="shadow-sm"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={8} lg={6}>
          <Form.Group controlId="busquedaProducto">
            <Form.Label className="small fw-bold">Buscar</Form.Label>
            <CuadroBusquedas 
              textoBusqueda={textoBusqueda} 
              manejarCambioBusqueda={manejarCambioBusqueda} 
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Estados de carga y error */}
      {cargando && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Cargando productos...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!cargando && productosFiltrados.length === 0 && (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No se encontraron productos que coincidan con tu búsqueda.
        </Alert>
      )}

      {/* Cuadrícula de productos */}
      {!cargando && productosFiltrados.length > 0 && (
        <Row className="g-4">
          {productosFiltrados.map((prod) => (
            <Col xs={12} sm={6} md={4} lg={3} key={prod.id_producto}>
              <TarjetaCatalogo
                producto={prod}
                categoriaNombre={obtenerNombreCategoria(prod.categoria_producto)}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Catalogo;