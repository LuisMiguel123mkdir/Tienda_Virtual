// 1. Conexión a Supabase
const supabaseUrl = 'https://hgcvjrdyarydylvsiucq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // tu clave completa aquí
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Cargar productos
async function cargarProductos() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price')
    .eq('active', true);

  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  if (error) {
    console.error('Error al cargar productos:', error);
    contenedor.innerHTML = '<p>Error al cargar productos.</p>';
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = '<p>No hay productos disponibles.</p>';
    return;
  }

  data.forEach(producto => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <h3>${producto.name}</h3>
      <p>${producto.description}</p>
      <strong>Precio: $${producto.price}</strong>
    `;
    contenedor.appendChild(div);
  });
}

// 3. Cargar proveedores
async function cargarProveedores() {
  const { data, error } = await supabase
    .from('vendors')
    .select('id, store_name')
    .eq('active', true);

  const select = document.getElementById('proveedor');
  select.innerHTML = '<option value="">Selecciona un vendedor</option>';

  if (error) {
    console.error('Error al cargar proveedores:', error);
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Error al cargar proveedores';
    select.appendChild(option);
    return;
  }

  if (!data || data.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No hay proveedores disponibles';
    select.appendChild(option);
    return;
  }

  console.log('Proveedores cargados:', data);

  data.forEach(vendor => {
    const option = document.createElement('option');
    option.value = vendor.id;
    option.textContent = vendor.store_name;
    select.appendChild(option);
  });
}

// 4. Agregar producto
async function agregarProducto({ name, description, price, stock, vendor_id }) {
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name,
        description,
        price,
        stock,
        vendor_id,
        active: true,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error al agregar producto:', error);
    alert('Error al agregar producto');
  } else {
    console.log('Producto agregado:', data);
    alert('Producto agregado correctamente');
    cargarProductos();
  }
}

// 5. Agregar proveedor
async function agregarProveedor({ store_name, description, zones, user_id }) {
  const { data, error } = await supabase
    .from('vendors')
    .insert([
      {
        store_name,
        description,
        zones,
        user_id,
        active: true,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error al agregar proveedor:', error);
    alert('Error al agregar proveedor');
  } else {
    console.log('Proveedor agregado:', data);
    alert('Proveedor agregado correctamente');
    cargarProveedores(); // recarga el desplegable
  }
}

// 6. Listeners y carga inicial
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formProducto').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('nombre').value;
    const description = document.getElementById('descripcion').value;
    const price = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const vendor_id = document.getElementById('proveedor').value;

    agregarProducto({ name, description, price, stock, vendor_id });
  });

  document.getElementById('formProveedor').addEventListener('submit', function (e) {
    e.preventDefault();
    const store_name = document.getElementById('nombreTienda').value;
    const description = document.getElementById('descripcionTienda').value;
    const zonasTexto = document.getElementById('zonasTienda').value;
    const zones = zonasTexto.split(',').map(z => z.trim());
    const user_id = document.getElementById('usuarioID').value;

    agregarProveedor({ store_name, description, zones, user_id });
  });

  cargarProductos();
  cargarProveedores();
});
