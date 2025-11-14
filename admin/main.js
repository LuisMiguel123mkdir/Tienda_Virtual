// 1. Conexión a Supabase 

const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Cargar lista de admins en el select
    async function cargarAdmins() {
      const { data, error } = await supabase.from('administrador').select('id, nombre');
      if (!error && data) {
        const select = document.getElementById('adminEliminar');
        select.innerHTML = "";
        data.forEach(admin => {
          const option = document.createElement('option');
          option.value = admin.id;
          option.textContent = admin.nombre;
          select.appendChild(option);
        });
      }
    }
// Guardar o modificar admin
    document.getElementById('formAdmin').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombreAdmin').value.trim();
      const contrasena = document.getElementById('contrasenaAdmin').value.trim();

      if (contrasena === "") {
        document.getElementById('mensajeAdmin').textContent = "La contraseña no puede estar en blanco.";
        return;
      }

      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('administrador')
        .select('id')
        .eq('nombre', nombre)
        .single();

      if (existente) {
        // Actualizar contraseña
        const { error } = await supabase
          .from('administrador')
          .update({ contrasena })
          .eq('id', existente.id);

        document.getElementById('mensajeAdmin').textContent = error ? "Error al modificar." : "Contraseña actualizada.";
      } else {
        // Insertar nuevo admin
        const { error } = await supabase
          .from('administrador')
          .insert([{ nombre, contrasena }]);

        document.getElementById('mensajeAdmin').textContent = error ? "Error al agregar." : "Administrador agregado.";
      }

      cargarAdmins();
    });

    // Eliminar admin
    document.getElementById('formEliminarAdmin').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('adminEliminar').value;

      const { error } = await supabase.from('administrador').delete().eq('id', id);

      document.getElementById('mensajeEliminar').textContent = error ? "Error al eliminar." : "Administrador eliminado.";
      cargarAdmins();
    });

    // Inicializar
    cargarAdmins();

// Mostrar productos de un vendedor seleccionado
async function mostrarProductosDeVendedor(vendedor_id) {
  const contenedor = document.getElementById('listaProductos');
  contenedor.innerHTML = '';

  const { data, error } = await supabase
    .from('producto')
    .select('producto, precio')
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
    const li = document.createElement('li');
    li.textContent = `${item.producto} — $${item.precio}`;
    lista.appendChild(li);
  });
  contenedor.appendChild(lista);
}

// Agregar producto (con reemplazo si ya existe)
async function agregarProducto({ producto, precio, vendedor_id }) {
// Borrar producto existente con el mismo nombre para ese vendedor
  const { error: errorDelete } = await supabase
    .from('producto')
    .delete()
    .eq('vendedor_id', vendedor_id)
    .eq('producto', producto);

  if (errorDelete) {
    console.error('Error al borrar producto existente:', errorDelete);
  }

  // Insertar el nuevo producto
  const { data, error } = await supabase
    .from('producto')
    .insert([{ producto, precio, vendedor_id, created_at: new Date().toISOString() }]);

  if (error) {
    console.error('Error al agregar producto:', error);
    alert('Error al agregar producto');
  } else {
    console.log('Producto agregado:', data);
    alert('Producto agregado correctamente');
    mostrarProductosDeVendedor(vendedor_id); // refresca la lista en pantalla
  }
}

// Agregar vendedor
async function agregarVendedor({ nombre, contacto, zona }) {
  const { data, error } = await supabase
    .from('vendedor')
    .insert([{ nombre, contacto, zona, created_at: new Date().toISOString() }]);

  if (error) {
    console.error('Error al agregar vendedor:', error);
    alert('Error al agregar vendedor');
  } else {
    console.log('Vendedor agregado:', data);
    alert('Vendedor agregado correctamente');
    cargarVendedoresEnSelect();
    cargarVendedoresParaEliminar();
  }
}

// Cargar vendedores en el desplegable de eliminación
async function cargarVendedoresParaEliminar() {
  const select = document.getElementById('vendedorEliminar');
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona un vendedor</option>';

  const { data, error } = await supabase.from('vendedor').select('id, nombre');

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

// Eliminar vendedor (y sus productos)
async function eliminarVendedor(vendedor_id) {
  // primero borrar productos asociados
  await supabase.from('producto').delete().eq('vendedor_id', vendedor_id);

  // luego borrar vendedor
  const { error } = await supabase.from('vendedor').delete().eq('id', vendedor_id);

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

// Cargar vendedores en el desplegable de productos
async function cargarVendedoresEnSelect() {
  const select = document.getElementById('vendedorProducto');
  if (!select) return;

  select.innerHTML = '<option value="">Selecciona un vendedor</option>';

  const { data, error } = await supabase.from('vendedor').select('id, nombre');

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

// Listeners del DOM
document.addEventListener('DOMContentLoaded', () => {
  cargarVendedoresEnSelect();
  cargarVendedoresParaEliminar();

  // Mostrar productos al seleccionar un vendedor
  document.getElementById('vendedorProducto').addEventListener('change', function () {
    const vendedor_id = this.value;
    if (vendedor_id) {
      mostrarProductosDeVendedor(vendedor_id);
    } else {
      document.getElementById('listaProductos').innerHTML = '';
    }
  });

  // Formulario de agregar vendedor
  document.getElementById('formVendedor').addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreVendedor').value;
    const contacto = document.getElementById('contactoVendedor').value;
    const zona = document.getElementById('zonaVendedor').value;
    agregarVendedor({ nombre, contacto, zona });
  });

  // Formulario de agregar producto
  document.getElementById('formProducto').addEventListener('submit', e => {
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

  // Formulario de eliminar vendedor
  document.getElementById('formEliminarVendedor').addEventListener('submit', e => {
    e.preventDefault();
    const vendedor_id = document.getElementById('vendedorEliminar').value;

    if (!vendedor_id) {
      alert('Selecciona un vendedor válido');
      return;
    }
    eliminarVendedor(vendedor_id);
  });
});


