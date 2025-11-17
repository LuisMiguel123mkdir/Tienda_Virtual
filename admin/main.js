// 1. Conexión a Supabase 

const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// ------------------- ADMINS -------------------

// Cargar lista de admins en el select
async function cargarAdmins() {
  const { data, error } = await supabaseClient.from('administrador').select('id, nombre');
  const select = document.getElementById('adminEliminar');
  select.innerHTML = "";

  if (error) {
    console.error("Error al cargar admins:", error);
    select.innerHTML = "<option value=''>Error al cargar</option>";
    return;
  }

  if (!data || data.length === 0) {
    select.innerHTML = "<option value=''>No hay administradores</option>";
    return;
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "Selecciona un administrador";
  select.appendChild(defaultOption);

  data.forEach(admin => {
    const option = document.createElement('option');
    option.value = admin.id;
    option.textContent = admin.nombre;
    select.appendChild(option);
  });
}

// ------------------- PRODUCTOS -------------------

async function mostrarProductosDeVendedor(vendedor_id) {
  const contenedor = document.getElementById('listaProductos');
  contenedor.innerHTML = '';

  const { data, error } = await supabaseClient
    .from('producto')
    .select(`
      producto,
      precio,
      cantidad,
      vendedor: vendedor_id (
        nombre,
        zona
      )
    `)
    .eq('vendedor_id', vendedor_id);

  if (error) {
    console.error('Error al cargar productos:', error);
    contenedor.innerHTML = '<p>Error al cargar productos.</p>';
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = '<p>Este vendedor no tiene productos.</p>';
    return;
  }

  const lista = document.createElement('ul');
  data.forEach(item => {
    const precioFormateado = Number(item.precio).toFixed(2);
    const li = document.createElement('li');
    li.textContent = `${item.producto} — $${precioFormateado} — Cantidad: ${item.cantidad} — Proveedor: ${item.vendedor?.nombre || "N/A"} — Localidad: ${item.vendedor?.zona || "N/A"}`;
    lista.appendChild(li);
  });
  contenedor.appendChild(lista);
}

async function agregarProducto({ producto, precio, cantidad, vendedor_id }) {
  const { error: errorDelete } = await supabaseClient
    .from('producto')
    .delete()
    .eq('vendedor_id', vendedor_id)
    .eq('producto', producto);

  if (errorDelete) {
    console.error('Error al borrar producto existente:', errorDelete);
  }

  const { error } = await supabaseClient
    .from('producto')
    .insert([{
      producto,
      precio,
      cantidad,
      vendedor_id,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error al agregar producto:', error);
    alert('Error al agregar producto');
  } else {
    alert('Producto agregado correctamente');
    mostrarProductosDeVendedor(vendedor_id);
  }
}

// ------------------- VENDEDORES -------------------

async function agregarVendedor({ nombre, contacto, zona }) {
  if (!nombre || !contacto || !zona) {
    alert('Completa nombre, contacto y zona.');
    return;
  }

  const { error } = await supabaseClient
    .from('vendedor')
    .insert([{ nombre, contacto, zona, created_at: new Date().toISOString() }]);

  if (error) {
    console.error('Error al agregar vendedor:', error);
    alert('Error al agregar vendedor');
  } else {
    alert('Vendedor agregado correctamente');
    cargarVendedoresEnSelect();
    cargarVendedoresParaEliminar();
    document.getElementById('formVendedor').reset();
  }
}

async function cargarVendedoresParaEliminar() {
  const select = document.getElementById('vendedorEliminar');
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona un vendedor</option>';

  const { data, error } = await supabaseClient.from('vendedor').select('id, nombre');

  if (error) {
    console.error('Error al cargar vendedores:', error);
    select.innerHTML = '<option value="">Error al cargar vendedores</option>';
    return;
  }

  if (!data || data.length === 0) {
    select.innerHTML = '<option value="">No hay vendedores disponibles</option>';
    return;
  }

  data.forEach(vendedor => {
    const option = document.createElement('option');
    option.value = vendedor.id;
    option.textContent = vendedor.nombre;
    select.appendChild(option);
  });
}

async function eliminarVendedor(vendedor_id) {
  if (!vendedor_id) {
    alert('Selecciona un vendedor válido.');
    return;
  }

  const { error: errorProductos } = await supabaseClient
    .from('producto')
    .delete()
    .eq('vendedor_id', vendedor_id);

  if (errorProductos) {
    console.error('Error al borrar productos del vendedor:', errorProductos);
  }

  const { error } = await supabaseClient.from('vendedor').delete().eq('id', vendedor_id);

  if (error) {
    console.error('Error al eliminar vendedor:', error);
    alert('Error al eliminar vendedor');
  } else {
    alert('Vendedor y productos eliminados correctamente');
    cargarVendedoresParaEliminar();
    cargarVendedoresEnSelect();
    document.getElementById('listaProductos').innerHTML = '';
  }
}

async function cargarVendedoresEnSelect() {
  const select = document.getElementById('vendedorProducto');
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona un vendedor</option>';

  const { data, error } = await supabaseClient.from('vendedor').select('id, nombre');

  if (error) {
    console.error('Error al cargar vendedores:', error);
    select.innerHTML = '<option value="">Error al cargar vendedores</option>';
    return;
  }

  if (!data || data.length === 0) {
    select.innerHTML = '<option value="">No hay vendedores disponibles</option>';
    return;
  }

  data.forEach(vendedor => {
    const option = document.createElement('option');
    option.value = vendedor.id;
    option.textContent = vendedor.nombre;
    select.appendChild(option);
  });
}

// ------------------- LISTENERS -------------------

document.addEventListener('DOMContentLoaded', () => {
  cargarAdmins();
  cargarVendedoresEnSelect();
  cargarVendedoresParaEliminar();

  document.getElementById('vendedorProducto')?.addEventListener('change', function () {
    const vendedor_id = this.value;
    const contenedor = document.getElementById('listaProductos');
    if (!vendedor_id) {
      if (contenedor) contenedor.innerHTML = '';
      return;
    }
    mostrarProductosDeVendedor(vendedor_id);
  });

  document.getElementById('formVendedor')?.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreVendedor')?.value?.trim();
    const contacto = document.getElementById('contactoVendedor')?.value?.trim();
    const zona = document.getElementById('zonaVendedor')?.value?.trim();
    agregarVendedor({ nombre, contacto, zona });
  });

  document.getElementById('formProducto')?.addEventListener('submit', e => {
    e.preventDefault();
    const producto = document.getElementById('nombreProducto')?.value?.trim();
    const precio = parseFloat(document.getElementById('precioProducto')?.value);
    const cantidad = parseInt(document.getElementById('cantidadProducto')?.value, 10);
    const vendedor_id = document.getElementById('vendedorProducto')?.value;

    if (!producto || isNaN(precio) || isNaN(cantidad) || !vendedor_id) {
      alert('Completa producto, precio, cantidad y vendedor.');
      return;
    }

    agregarProducto({ producto, precio, cantidad, vendedor_id });
    document.getElementById('formProducto').reset();
  });

  document.getElementById('formEliminarVendedor')?.addEventListener('submit', e => {
    e.preventDefault();
    const vendedor_id = document.getElementById('vendedorEliminar')?.value;
    eliminarVendedor(vendedor_id);
  });

  document.getElementById('formAdmin')?.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreAdmin')?.value?.trim();
    const contrasena = document.getElementById('contrasenaAdmin')?.value?.trim();

