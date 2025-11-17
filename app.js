// Conexión a Supabase
const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

let productosGlobal = []; // almacenará todos los productos

// Función para cargar productos con vendedor y localidad
async function cargarProductos() {
  const { data, error } = await supabase
    .from('producto')
    .select(`
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

// Función para mostrar productos en pantalla
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
    tabla.appendChild(fila);
  });

  contenedor.appendChild(tabla);
}

// Función para ordenar productos según selección
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

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos(); // carga inicial
  document.getElementById('ordenarPor').addEventListener('change', ordenarProductos);
});
