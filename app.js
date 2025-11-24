// Conexión a Supabase
const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});


let productosGlobal = [];

// Comprar producto
async function comprarProducto(producto) {
  const cantidad = parseInt(document.getElementById('cantidadCompra').value, 10);
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }
  if (cantidad > producto.cantidad) {
    alert("No hay suficiente stock");
    return;
  }

  // 1. Insertar reporte en tabla "ventas"
  const { error: errorReporte } = await supabaseClient
    .from('ventas')
    .insert([{
      producto_id: producto.id,
      cantidad,
      fecha: new Date().toISOString()
    }]);

  if (errorReporte) {
    console.error("Error al generar reporte:", errorReporte);
    alert("Error al registrar la compra");
    return;
  }

  // 2. Actualizar stock o eliminar producto
  const nuevoStock = producto.cantidad - cantidad;
  if (nuevoStock > 0) {
    const { error } = await supabaseClient
      .from('producto')
      .update({ cantidad: nuevoStock })
      .eq('id', producto.id);
    if (error) {
      console.error("Error al actualizar stock:", error);
      alert("Error al actualizar stock");
      return;
    }
  } else {
    const { error } = await supabaseClient
      .from('producto')
      .delete()
      .eq('id', producto.id);
    if (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto");
      return;
    }
  }

  // 3. Confirmación y refresco
  alert("Compra realizada con éxito");
  cerrarModal();
  cargarProductos(); // refrescar lista
}

// Cargar productos
async function cargarProductos() {
  const { data, error } = await supabaseClient
    .from('producto')
    .select(`
      id,
      producto,
      precio,
      cantidad,
      vendedor: vendedor_id (
        nombre,
        zona
      )
    `);

  if (error) {
    console.error("Error al cargar productos:", error);
    document.getElementById('listaProductos').innerHTML = "<p>Error al cargar productos.</p>";
    return;
  }

  productosGlobal = data;
  mostrarProductos(productosGlobal);
}

// Mostrar productos en tabla
function mostrarProductos(lista) {
  const contenedor = document.getElementById('listaProductos');
  contenedor.innerHTML = "";

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <tr>
      <th>Producto</th>
      <th>Precio</th>
      <th>Cantidad</th>
      <th>Proveedor</th>
      <th>Localidad</th>
    </tr>
  `;

  lista.forEach(item => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${item.producto}</td>
      <td>$${item.precio}</td>
      <td>${item.cantidad}</td>
      <td>${item.vendedor?.nombre || "N/A"}</td>
      <td>${item.vendedor?.zona || "N/A"}</td>
    `;
    // Al hacer clic en la fila → abrir modal
    fila.addEventListener('click', () => abrirModal(item));
    tabla.appendChild(fila);
  });

  contenedor.appendChild(tabla);
}

// Ordenar productos
function ordenarProductos() {
  const criterio = document.getElementById('ordenarPor').value;
  let listaOrdenada = [...productosGlobal];

  switch (criterio) {
    case "producto-asc":
      listaOrdenada.sort((a, b) => a.producto.localeCompare(b.producto));
      break;
    case "producto-desc":
      listaOrdenada.sort((a, b) => b.producto.localeCompare(a.producto));
      break;
    case "precio-asc":
      listaOrdenada.sort((a, b) => a.precio - b.precio);
      break;
    case "precio-desc":
      listaOrdenada.sort((a, b) => b.precio - a.precio);
      break;
    case "vendedor-asc":
      listaOrdenada.sort((a, b) => (a.vendedor?.nombre || "").localeCompare(b.vendedor?.nombre || ""));
      break;
    case "vendedor-desc":
      listaOrdenada.sort((a, b) => (b.vendedor?.nombre || "").localeCompare(a.vendedor?.nombre || ""));
      break;
    case "localidad-asc":
      listaOrdenada.sort((a, b) => (a.vendedor?.zona || "").localeCompare(b.vendedor?.zona || ""));
      break;
    case "localidad-desc":
      listaOrdenada.sort((a, b) => (b.vendedor?.zona || "").localeCompare(a.vendedor?.zona || ""));
      break;
  }

  mostrarProductos(listaOrdenada);
}

// Modal
function abrirModal(producto) {
  document.getElementById('modalCompra').style.display = 'block';
  document.getElementById('productoSeleccionado').textContent =
    `${producto.producto} (Disponible: ${producto.cantidad})`;
  document.getElementById('btnComprar').onclick = () => comprarProducto(producto);
}

function cerrarModal() {
  document.getElementById('modalCompra').style.display = 'none';
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  document.getElementById('ordenarPor').addEventListener('change', ordenarProductos);
});
