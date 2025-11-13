// 1. Conexión a Supabase 

const supabaseUrl = 'https://hgcvjrdyarydylvsiucq.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnY3ZqcmR5YXJ5ZHlsdnNpdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjE3NTUsImV4cCI6MjA3ODUzNzc1NX0.B7zFRd4TKEMmo-eBLjJT-G9yhzVl7iSMrvDLGXHcMTs'; 
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Función para cargar productos 

async function cargarProductos() { 
  const { data, error } = await supabase 
    .from('products') 
    .select('id, name, description, price') 
    .eq('active', true); 
  
  if (error) { 
    console.error('Error al cargar productos:', error); return; 
  }
  
  const contenedor = document.getElementById('productos'); 
  contenedor.innerHTML = ''; 
  data.forEach(producto => { 
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = ` 
    <h3>${producto.name}</h3> 
    <p>${producto.description}</p>
    <strong>Precio: $${producto.price}</strong> `;
    contenedor.appendChild(div);
  });
} 

// 3. Función para cargar proveedores en el select

async function cargarProveedores() {
  const { data, error } = await supabase .from('vendors') 
    .select('id, store_name') 
    .eq('active', true); 
  
  if (error) {
    console.error('Error al cargar proveedores:', error);
    return; 
  }
  console.log('Proveedores cargados:', data);
  const select = document.getElementById('proveedor');
  select.innerHTML = '<option value="">Selecciona un vendedor</option>';
  
  data.forEach(vendor => {
    const option = document.createElement('option');
    option.value = vendor.id;
    option.textContent = vendor.store_name;
    select.appendChild(option); });
} 

// 4. Función para agregar producto

async function agregarProducto({ name, description, price, stock, vendor_id }) {
  const { data, error } = await supabase 
    .from('products') 
    .insert([ { name, description, price, stock, vendor_id, active: true, created_at: new Date().toISOString() } ]); 
  
  if (error) { 
    console.error('Error al agregar producto:', error);
    alert('Error al agregar producto'); 
  } else { console.log('Producto agregado:', data);
          alert('Producto agregado correctamente');
         } 
}

// 5. Función para agregar proveedor 

async function agregarProveedor({ store_name, description, zones, user_id }) {
  const { data, error } = await supabase 
    .from('vendors') 
    .insert([ { store_name, description, zones, user_id, active: true, created_at: new Date().toISOString() } ]);
  
  if (error) { 
    console.error('Error al agregar proveedor:', error);
    alert('Error al agregar proveedor'); 
  } else { 
    console.log('Proveedor agregado:', data);
    alert('Proveedor agregado correctamente'); 
  } 
} 

// 6. Listeners de formularios 

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




