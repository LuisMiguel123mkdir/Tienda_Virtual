// 1. Conexión a Supabase 

const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// 2. Función para agregar vendedor
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

  if (error) {
    console.error('Error al agregar vendedor:', error);
    alert('Error al agregar vendedor');
  } else {
    console.log('Vendedor agregado:', data);
    alert('Vendedor agregado correctamente');
    cargarVendedoresEnSelect(); // recarga el desplegable
  }
}

//3. Función para cargar vendedores en el desplegable de eliminación
async function cargarVendedoresParaEliminar() {
  const select = document.getElementById('vendedorEliminar');
  if (!select) {
    console.error('Elemento <select id="vendedorEliminar"> no encontrado en el DOM');
    return;
  }

  select.innerHTML = '<option value="">Selecciona un vendedor</option>';

  const { data, error } = await supabase
    .from('vendedor')
    .select('id, nombre');

  console.log('Respuesta de Supabase (eliminar):', { data, error });

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

//4. Función para eliminar vendedor
async function eliminarVendedor(vendedor_id) {
  const { error } = await supabase
    .from('vendedor')
    .delete()
    .eq('id', vendedor_id);

  if (error) {
    console.error('Error al eliminar vendedor:', error);
    alert('Error al eliminar vendedor');
  } else {
    alert('Vendedor eliminado correctamente');
    cargarVendedoresParaEliminar(); // recarga la lista
    cargarVendedoresEnSelect();     // también recarga el desplegable de productos
  }
}

// 5. Función para cargar vendedores en el desplegable
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

// 6. Función para agregar producto
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

// 7. Listeners del DOM
document.addEventListener('DOMContentLoaded', () => {
  cargarVendedoresEnSelect();

  document.getElementById('formVendedor').addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreVendedor').value;
    const contacto = document.getElementById('contactoVendedor').value;
    const zona = document.getElementById('zonaVendedor').value;

    agregarVendedor({ nombre, contacto, zona });
  });

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

// Listener del formulario de eliminación
document.addEventListener('DOMContentLoaded', () => {
  cargarVendedoresParaEliminar();

  document.getElementById('formEliminarVendedor').addEventListener('submit', function (e) {
    e.preventDefault();
    const vendedor_id = document.getElementById('vendedorEliminar').value;

    if (!vendedor_id) {
      alert('Selecciona un vendedor válido');
      return;
    }

    eliminarVendedor(vendedor_id);
  });
});




