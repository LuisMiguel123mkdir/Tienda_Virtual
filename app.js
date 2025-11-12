// Reemplaza con tus claves reales
const supabaseUrl = 'https://hgcvjrdyarydylvsiucq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnY3ZqcmR5YXJ5ZHlsdnNpdWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjE3NTUsImV4cCI6MjA3ODUzNzc1NX0.B7zFRd4TKEMmo-eBLjJT-G9yhzVl7iSMrvDLGXHcMTs';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ✅ Cargar productos desde la tabla 'products'
async function cargarProductos() {
  const { data, error } = await supabase
    .from('products') // ← esta línea faltaba
    .select('id, name, description, price')
    .eq('active', true);

  if (error) {
    console.error('Error al cargar productos:', error);
    return;
  }

  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

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

cargarProductos();

// ✅ Agregar producto a la tabla 'products'
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
  }
}
