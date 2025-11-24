// Inicializar Supabase (pon tus credenciales reales)
const supabaseClient = supabase.createClient(
  "https://TU-PROJECT-URL.supabase.co",
  "TU-API-KEY"
);

// Cargar historial de compras
async function cargarHistorial() {
  const { data, error } = await supabaseClient
    .from('ventas')
    .select(`
      id,
      fecha,
      cantidad,
      producto: producto_id ( producto, precio ),
      vendedor: producto_id ( vendedor_id ( nombre, zona ) )
    `)
    .order('fecha', { ascending: false });

  if (error) {
    console.error("Error al cargar historial:", error);
    document.getElementById('listaVentas').innerHTML = "<p>Error al cargar historial.</p>";
    return;
  }

  mostrarHistorial(data);
}

// Renderizar tabla con las ventas
function mostrarHistorial(lista) {
  const contenedor = document.getElementById('listaVentas');
  contenedor.innerHTML = "";

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = "<p>No hay compras registradas.</p>";
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <tr>
      <th>Fecha</th>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio Unitario</th>
      <th>Proveedor</th>
      <th>Localidad</th>
    </tr>
  `;

  lista.forEach(item => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${new Date(item.fecha).toLocaleString()}</td>
      <td>${item.producto?.producto || "N/A"}</td>
      <td>${item.cantidad}</td>
      <td>$${item.producto?.precio || "N/A"}</td>
      <td>${item.vendedor?.vendedor_id?.nombre || "N/A"}</td>
      <td>${item.vendedor?.vendedor_id?.zona || "N/A"}</td>
    `;
    tabla.appendChild(fila);
  });

  contenedor.appendChild(tabla);
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', cargarHistorial);
