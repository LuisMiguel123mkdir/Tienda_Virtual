// 1. Conexión a Supabase 

const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Función para agregar vendedor
async function agregarVendedor({ nombre, contacto, zona }) {
  const { data, error } = await supabase
    .from('vendedor')
    .insert([
      {
        nombre,
        contacto,
        zona,
        created_at: new Date().toISOString()
      }
    ]);

  // Cargar vendedores en el desplegable
async function cargarVendedoresEnSelect() {
  const select = document.getElementById('vendedorProducto');
  if (!select) {
    console.error('Elemento <select id="vendedorProducto"> no encontrado en el DOM');
    return;
  }

  select.innerHTML = '<option value="">Selecciona un vendedor</option>';
  select.disabled = false;

  const { data, error } = await supabase
    .from('vendedor')
    .select('id, nombre');

  console.log('Respuesta completa de Supabase:', { data, error });

  if (error) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Error al cargar vendedores';
    select.appendChild(option);
    return;
  }

  if (!data || data.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No hay vendedores disponibles';
    select.appendChild(option);
    return;
  }

  data.forEach(vendedor => {
    const option = document.createElement('option');
    option.value = vendedor.id;
    option.textContent = vendedor.nombre;
    select.appendChild(option);
  });
}

// Agregar producto
async function agregarProducto({ producto, precio, vendedor_id }) {
  const { data, error } = await supabase
    .from('producto')
    .insert([
      {
        producto,
        precio,
        vendedor_id,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error al agregar producto:', error);
    alert('Error al agregar producto');
  } else {
    console.log('Producto agregado:', data);
    alert('Producto agregado correctamente');
  }
}

// Listener del formulario
document.addEventListener('DOMContentLoaded', () => {
  cargarVendedoresEnSelect();

  document.getElementById('formProducto').addEventListener('submit', function (e) {
    e.preventDefault();
    const producto = document.getElementById('nombreProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const vendedor_id = document.getElementById('vendedorProducto').value;

    if (!vendedor_id) {
      alert('Selecciona un vendedor válido');
      return;
    }

    agregarProducto({ producto, precio, vendedor_id });
  });
});
  

  if (error) {
    console.error('Error al agregar vendedor:', error);
    alert('Error al agregar vendedor');
  } else {
    console.log('Vendedor agregado:', data);
    alert('Vendedor agregado correctamente');
  }
}

// Listener del formulario
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formVendedor').addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreVendedor').value;
    const contacto = document.getElementById('contactoVendedor').value;
    const zona = document.getElementById('zonaVendedor').value;

    agregarVendedor({ nombre, contacto, zona });
  });
});

console.log('Respuesta completa de Supabase:', { data, error });


