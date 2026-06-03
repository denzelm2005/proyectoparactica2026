import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/Ordenamiento/Paginacion";
import TablaVentas from "../components/ventas/TablaVenta";
import TarjetaVenta from "../components/ventas/TarjetaVenta";
import FormularioVenta from "../components/ventas/FormularioVenta";

const Ventas = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ventaAEditar, setVentaAEditar] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [detalles, setDetalles] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(8);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // Cargar datos de Supabase
  const cargarDatosAuxiliares = async () => {
    try {
      const [c, e, p] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("empleados").select("*"),
        supabase.from("productos").select("*")
      ]);
      setClientes(c.data || []);
      setEmpleados(e.data || []);
      setProductos(p.data || []);
    } catch (err) {
      console.error("Error cargando auxiliares:", err);
    }
  };

  const cargarVentas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          *,
          clientes (nombre_cliente, apellido_cliente),
          empleados (nombre_empleado, apellido_empleado),
          detalles_ventas (*, productos (nombre_producto))
        `)
        .order("fecha_venta", { ascending: false });

      if (error) {
        console.error("Error al cargar ventas:", error);
        setToast({ mostrar: true, mensaje: "Error al cargar ventas", tipo: "error" });
        return;
      }
      setVentas(data || []);
    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error inesperado al cargar ventas", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
    cargarDatosAuxiliares();
  }, []);

  // Precargar el formulario en caso de edición
  useEffect(() => {
    if (ventaAEditar) {
      const cliente = clientes.find(c => c.id_cliente === ventaAEditar.id_cliente);
      const empleado = empleados.find(e => e.id_empleado === ventaAEditar.id_empleado);

      setClienteSeleccionado(cliente || null);
      setEmpleadoSeleccionado(empleado || null);
      setMetodoPago(ventaAEditar.metodo_pago || "efectivo");

      if (ventaAEditar.detalles_ventas?.length > 0) {
        const detallesFormateados = ventaAEditar.detalles_ventas.map(d => ({
          id_producto: d.id_producto,
          nombre_producto: d.productos?.nombre_producto || "Producto",
          precio: d.precio_unitario,
          cantidad: d.cantidad
        }));
        setDetalles(detallesFormateados);
      } else {
        setDetalles([]);
      }
    }
  }, [ventaAEditar, clientes, empleados]);

  useEffect(() => {
    const total = detalles.reduce((sum, det) => sum + (det.cantidad * det.precio), 0);
    setTotalGeneral(total);
  }, [detalles]);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtradas = ventas.filter(v =>
        `${v.clientes?.nombre_cliente || ''} ${v.clientes?.apellido_cliente || ''}`.toLowerCase().includes(textoLower) ||
        v.empleados?.nombre_empleado?.toLowerCase().includes(textoLower)
      );
      setVentasFiltradas(filtradas);
    }
  }, [textoBusqueda, ventas]);

  const abrirNuevaVenta = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  const abrirEdicion = (venta) => {
    setVentaAEditar(venta);
    setMostrarFormulario(true);
  };

  const resetFormulario = () => {
    setClienteSeleccionado(null);
    setEmpleadoSeleccionado(null);
    setMetodoPago("efectivo");
    setDetalles([]);
    setVentaAEditar(null);
  };

  const agregarDetalle = (producto, cantidad) => {
    if (!producto || !cantidad) return;
    setDetalles(prev => {
      const existe = prev.find(d => d.id_producto === producto.id_producto);
      if (existe) {
        return prev.map(d =>
          d.id_producto === producto.id_producto ? { ...d, cantidad: d.cantidad + cantidad } : d
        );
      }
      return [...prev, {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio: producto.precio_venta,
        cantidad
      }];
    });
  };

  const eliminarDetalle = (id_producto) => {
    setDetalles(prev => prev.filter(d => d.id_producto !== id_producto));
  };

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setDetalles(prev => prev.map(d =>
      d.id_producto === id_producto ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  const guardarVenta = async () => {
    if (!clienteSeleccionado || !empleadoSeleccionado || detalles.length === 0) {
      setToast({ mostrar: true, mensaje: "Faltan datos obligatorios", tipo: "advertencia" });
      return;
    }

    try {
      if (ventaAEditar) {
        await supabase.from("ventas").update({
          id_cliente: clienteSeleccionado.id_cliente,
          id_empleado: empleadoSeleccionado.id_empleado,
          metodo_pago: metodoPago,
          total: totalGeneral
        }).eq("id_venta", ventaAEditar.id_venta);

        await supabase.from("detalles_ventas").delete().eq("id_venta", ventaAEditar.id_venta);

        const detallesInsert = detalles.map(d => ({
          id_venta: ventaAEditar.id_venta,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio,
          subtotal: d.cantidad * d.precio
        }));

        await supabase.from("detalles_ventas").insert(detallesInsert);
        setToast({ mostrar: true, mensaje: "Venta actualizada exitosamente", tipo: "exito" });
      } else {
        const nicaNow = () => new Date().toLocaleString("sv", { timeZone: "America/Managua" }).replace(" ", "T");

        const { data: ventaData } = await supabase
          .from("ventas")
          .insert([{
            id_cliente: clienteSeleccionado.id_cliente,
            id_empleado: empleadoSeleccionado.id_empleado,
            fecha_venta: nicaNow(),
            metodo_pago: metodoPago,
            total: totalGeneral
          }])
          .select()
          .single();

        const detallesInsert = detalles.map(d => ({
          id_venta: ventaData.id_venta,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio,
          subtotal: d.cantidad * d.precio
        }));

        await supabase.from("detalles_ventas").insert(detallesInsert);
        setToast({ mostrar: true, mensaje: "Venta registrada exitosamente", tipo: "exito" });
      }

      resetFormulario();
      setMostrarFormulario(false);
      await cargarVentas();

    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error al guardar la venta", tipo: "error" });
    }
  };

  const manejarBusqueda = (e) => setTextoBusqueda(e.target.value);

  // === FUNCIÓN DE IMPRESIÓN CON EMPLEADO INCLUIDO ===
  const handlePrint = (venta) => {
    const nombreCliente = `${venta.clientes?.nombre_cliente || ""} ${venta.clientes?.apellido_cliente || ""}`.trim() || "Cliente General";
    const nombreEmpleado = `${venta.empleados?.nombre_empleado || ""} ${venta.empleados?.apellido_empleado || ""}`.trim() || "Cajero General";
    
    const fecha = venta.fecha_venta
      ? new Date(venta.fecha_venta).toLocaleString("es-NI", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    const listaDetalles = venta.detalles_ventas || [];
    const totalNeto = parseFloat(venta.total || 0);
    const iva = totalNeto * 0.15; 
    const numeroVenta = venta.id_venta || "-";

    const esAndroid = /Android/i.test(navigator.userAgent);

    if (esAndroid) {
      // MODO CELULAR: Se añade el empleado en formato de texto plano
      let detalleTexto = "DETALLES DE VENTA:\n";
      detalleTexto += "CANT.         PRECIO           SUB.\n";
      detalleTexto += "-----------------------------------\n";

      listaDetalles.forEach((item) => {
        if (item.id_producto) {
          const nombreProducto = item.productos?.nombre_producto || "Producto";
          const cantidad = item.cantidad || 0;
          const precio = parseFloat(item.precio_unitario || 0).toFixed(2);
          const subtotalLinea = parseFloat(item.subtotal || (cantidad * item.precio_unitario)).toFixed(2);

          detalleTexto += `${nombreProducto}\n`;
          const strCantidad = String(cantidad).padStart(5, " ");
          const strPrecio = ("C$" + precio).padStart(15, " ");
          const strSubtotal = ("C$" + subtotalLinea).padStart(15, " ");
          detalleTexto += `${strCantidad}${strPrecio}${strSubtotal}\n`;
        }
      });

      detalleTexto += "-----------------------------------";

      const textoTicket = `
PEKEPLAY - Ticket de Venta #${numeroVenta}
===================================
Cliente: ${nombreCliente.substring(0, 25)}
Atendido: ${nombreEmpleado.substring(0, 25)}
Fecha: ${fecha}
===================================
${detalleTexto}
IVA:    ${("C$" + iva.toFixed(2)).padStart(27, " ")}
TOTAL:  ${("C$" + totalNeto.toFixed(2)).padStart(27, " ")}
Método: ${venta.metodo_pago || "Efectivo"}
Estado: ${venta.estado === false ? "Anulada" : "Registrada"}
===================================
      ¡Gracias por su compra!
`.trim();

      window.location.href = `rawbt:${encodeURIComponent(textoTicket)}`;

    } else {
      // MODO PC: Se añade la fila de empleado en la cabecera fluida del ticket original
      const tituloOriginal = document.title;
      document.title = `Ticket_No_${numeroVenta}`;

      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      let filasProductosHTML = "";
      listaDetalles.forEach((item) => {
        if (item.id_producto) {
          const nombreProducto = item.productos?.nombre_producto || "Producto";
          const cantidad = item.cantidad || 0;
          const precio = parseFloat(item.precio_unitario || 0).toFixed(2);
          const subtotalLinea = parseFloat(item.subtotal || (cantidad * item.precio_unitario)).toFixed(2);

          filasProductosHTML += `
            <tr>
              <td colspan="4" style="padding-top: 8px; font-weight: bold;">${nombreProducto.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="width: 15%; text-align: left; padding-bottom: 5px;">${cantidad}</td>
              <td style="width: 45%; text-align: right; padding-bottom: 5px;">C$ ${precio}</td>
              <td style="width: 40%; text-align: right; padding-bottom: 5px;">C$ ${subtotalLinea}</td>
            </tr>
          `;
        }
      });

      if (listaDetalles.length === 0) {
        filasProductosHTML += `<tr><td colspan="3" style="text-align: center; padding: 10px 0;">SIN PRODUCTOS REGISTRADOS</td></tr>`;
      }

      const htmlTicketFluido = `
        <html>
          <head>
            <title>Ticket #${numeroVenta}</title>
            <style>
              @page { size: auto; margin: 4mm; }
              body {
                font-family: 'Courier New', Courier, monospace;
                margin: 0;
                padding: 0;
                color: #000;
                font-size: 11pt;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              
              .linea-simple { border-top: 1px dashed #000; margin: 8px 0; }
              .linea-doble { border-top: 2px dashed #000; margin: 8px 0; }
              .linea-iguales { border-top: 2px solid #000; margin: 8px 0; }

              .seccion-datos {
                width: 100%;
                margin-bottom: 8px;
              }
              .fila-datos {
                width: 100%;
                clear: both;
                overflow: hidden;
                margin-bottom: 4px;
              }
              .izq { float: left; }
              .der { float: right; }

              table {
                width: 100%;
                border-collapse: collapse;
              }
              th {
                border-bottom: 1px dashed #000;
                padding-bottom: 5px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="text-center" style="font-weight: bold; font-size: 13pt;">PEKEPLAY</div>
            <div class="text-center">TICKET DE VENTA #${numeroVenta}</div>
            
            <div class="linea-doble"></div>
            
            <div class="seccion-datos">
              <div class="fila-datos"><span class="izq">CLIENTE:</span> <span class="der">${nombreCliente.toUpperCase()}</span></div>
              <div class="fila-datos"><span class="izq">ATENDIDO POR:</span> <span class="der">${nombreEmpleado.toUpperCase()}</span></div>
              <div class="fila-datos"><span class="izq">FECHA:</span> <span class="der">${fecha}</span></div>
            </div>
            
            <div class="linea-doble"></div>
            <div style="font-weight: bold; margin-bottom: 5px;">DETALLES DE VENTA:</div>

            <table>
              <thead>
                <tr>
                  <th style="text-align: left; width: 15%;">CANT.</th>
                  <th style="text-align: right; width: 45%;">PRECIO</th>
                  <th style="text-align: right; width: 40%;">SUB.</th>
                </tr>
              </thead>
              <tbody>
                ${filasProductosHTML}
              </tbody>
            </table>

            <div class="linea-simple"></div>

            <div class="seccion-datos">
              <div class="fila-datos"><span class="izq">METODO PAGO:</span> <span class="der">${venta.metodo_pago.toUpperCase()}</span></div>
              <div class="fila-datos"><span class="izq">ESTADO:</span> <span class="der">${venta.estado === false ? "ANULADA" : "REGISTRADA"}</span></div>
              <div class="fila-datos" style="margin-top: 8px;"><span class="izq">IVA (15%):</span> <span class="der">C$ ${iva.toFixed(2)}</span></div>
              <div class="fila-datos" style="font-weight: bold; font-size: 12pt;"><span class="izq">TOTAL:</span> <span class="der">C$ ${totalNeto.toFixed(2)}</span></div>
            </div>

            <div class="linea-iguales"></div>
            
            <div class="text-center" style="margin-top: 15px; font-weight: bold;">
              ¡GRACIAS POR SU COMPRA!
            </div>
          </body>
        </html>
      `;

      iframe.contentDocument.write(htmlTicketFluido);
      iframe.contentDocument.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        document.title = tituloOriginal;
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={8} lg={8}>
          <h3 className="mb-0">
            <i className="bi bi-receipt-cutoff me-2"></i> Ventas
          </h3>
        </Col>
        <Col xs={4} lg={4} className="text-end">
          <Button onClick={abrirNuevaVenta} size="md">
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Venta</span>
          </Button>
        </Col>
      </Row>
      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por cliente o empleado..."
          />
        </Col>
      </Row>

      {cargando ? (
        <Row className="text-center my-5">
          <Spinner animation="border" variant="success" size="lg" />
          <p className="mt-3 text-muted">Cargando ventas...</p>
        </Row>
      ) : (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaVenta 
              ventas={ventasPaginadas} 
              abrirEdicion={abrirEdicion} 
              imprimirVenta={handlePrint} 
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaVentas 
              ventas={ventasPaginadas} 
              abrirEdicion={abrirEdicion} 
              imprimirVenta={handlePrint} 
            />
          </Col>
        </Row>
      )}

      {ventasFiltradas.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={ventasFiltradas.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <FormularioVenta
        mostrar={mostrarFormulario}
        setMostrar={setMostrarFormulario}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        clienteSeleccionado={clienteSeleccionado}
        setClienteSeleccionado={setClienteSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        setEmpleadoSeleccionado={setEmpleadoSeleccionado}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        detalles={detalles}
        totalGeneral={totalGeneral}
        agregarDetalle={agregarDetalle}
        eliminarDetalle={eliminarDetalle}
        actualizarCantidad={actualizarCantidad}
        guardarVenta={guardarVenta}
        ventaAEditar={ventaAEditar}
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

export default Ventas;