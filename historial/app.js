// Inicializar Supabase (pon tus credenciales reales)
// 1. Conexión a Supabase 
const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

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
