// 1. Conexión a Supabase 

const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// ------------------- ADMINS -------------------

// Cargar lista de admins en el select
async function cargarAdmins() {
  const { data, error } = await supabaseClient.from('administrador').select('id, nombre');
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
  const { data: existente } = await supabaseClient
    .from('administrador')
    .select('id')
    .eq('nombre', nombre)
    .maybeSingle();

  if (existente) {
    // Actualizar contraseña
    const { error } = await supabaseClient
      .from('administrador')
      .update({ contrasena })
      .eq('id', existente.id);

    document.getElementById('mensajeAdmin').textContent = error ? "Error al modificar." : "Contraseña actualizada.";
  } else {
    // Insertar nuevo admin
    const { error } = await supabaseClient
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

  const { error } = await supabaseClient.from('administrador').delete().eq('id', id);

  document.getElementById('mensajeEliminar').textContent = error ? "Error al eliminar." : "Administrador eliminado.";
  cargarAdmins();
});

// ------------------- PRODUCTOS -------------------

async function mostrarProductosDeVendedor(vendedor_id) {
  const contenedor = document.getElementById('listaProductos');
  contenedor.innerHTML = '';

  // Traemos productos y la relación con vendedor (nombre y zona)
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
    const li = document.createElement('li');
    li.textContent = `${item.producto} — $${item.precio} — Cantidad: ${item.cantidad} — Proveedor: ${item.vendedor?.nombre || "N/A"} — Localidad: ${item.vendedor?.zona || "N/A"}`;
    lista.appendChild(li);
  });
  contenedor.appendChild(lista);
}

// Agregar producto (con reemplazo si ya existe)
async function agregarProducto({ producto, precio, cantidad, vendedor_id }) {
  // Borrar producto existente con el mismo nombre para ese vendedor
  await supabaseClient
    .from('producto')
    .delete()
    .eq('vendedor_id', vendedor_id)
    .eq('producto', producto);

  // Insertar el nuevo producto (sin localidad, porque viene del vendedor)
  const { data, error } = await supabaseClient
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
  await supabaseClient.from('producto').delete().eq('vendedor_id', vendedor_id);
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
  // Cargar datos iniciales
  cargarAdmins();
  cargarVendedoresEnSelect();
  cargarVendedoresParaEliminar();

  // Mostrar productos al seleccionar un vendedor en el formulario de productos
  const selectVendedorProducto = document.getElementById('vendedorProducto');
  if (selectVendedorProducto) {
    selectVendedorProducto.addEventListener('change', function () {
      const vendedor_id = this.value;
      const contenedor = document.getElementById('listaProductos');
      if (!vendedor_id) {
        if (contenedor) contenedor.innerHTML = '';
        return;
      }
      mostrarProductosDeVendedor(vendedor_id);
    });
  }

  // Formulario: agregar vendedor
  const formVendedor = document.getElementById('formVendedor');
  if (formVendedor) {
    formVendedor.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = document.getElementById('nombreVendedor')?.value?.trim();
      const contacto = document.getElementById('contactoVendedor')?.value?.trim();
      const zona = document.getElementById('zonaVendedor')?.value?.trim();

      if (!nombre || !contacto || !zona) {
        alert('Completa nombre, contacto y zona.');
        return;
      }
      agregarVendedor({ nombre, contacto, zona });
    });
  }

  // Formulario: agregar producto (con cantidad y localidad)
  const formProducto = document.getElementById('formProducto');
  if (formProducto) {
    formProducto.addEventListener('submit', e => {
      e.preventDefault();
      const producto = document.getElementById('nombreProducto')?.value?.trim();
      const precioStr = document.getElementById('precioProducto')?.value;
      const cantidadStr = document.getElementById('cantidadProducto')?.value;
      const localidad = document.getElementById('localidadProducto')?.value?.trim();
      const vendedor_id = document.getElementById('vendedorProducto')?.value;

      const precio = parseFloat(precioStr);
      const cantidad = parseInt(cantidadStr, 10);

      if (!producto || isNaN(precio) || isNaN(cantidad) || !localidad || !vendedor_id) {
        alert('Completa producto, precio, cantidad, localidad y vendedor.');
        return;
      }

      agregarProducto({ producto, precio, cantidad, vendedor_id, localidad });
    });
  }

  // Formulario: eliminar vendedor (y sus productos)
  const formEliminarVendedor = document.getElementById('formEliminarVendedor');
  if (formEliminarVendedor) {
    formEliminarVendedor.addEventListener('submit', e => {
      e.preventDefault();
      const vendedor_id = document.getElementById('vendedorEliminar')?.value;
      if (!vendedor_id) {
        alert('Selecciona un vendedor válido.');
        return;
      }
      eliminarVendedor(vendedor_id);
    });
  }

  // Formulario: crear/actualizar administrador
  const formAdmin = document.getElementById('formAdmin');
  if (formAdmin) {
    formAdmin.addEventListener('submit', async e => {
      e.preventDefault();
      const nombre = document.getElementById('nombreAdmin')?.value?.trim();
      const contrasena = document.getElementById('contrasenaAdmin')?.value?.trim();
      const mensaje = document.getElementById('mensajeAdmin');

      if (!nombre || !contrasena) {
        if (mensaje) mensaje.textContent = 'Nombre y contraseña son obligatorios.';
        return;
      }

      // Reutiliza la lógica existente de guardar/modificar admin
      const { data: existente, error: qErr } = await supabaseClient
        .from('administrador')
        .select('id')
        .eq('nombre', nombre)
        .maybeSingle();

      if (qErr) {
        if (mensaje) mensaje.textContent = 'Error al verificar el administrador.';
        return;
      }

      if (existente) {
        const { error } = await supabaseClient
          .from('administrador')
          .update({ contrasena })
          .eq('id', existente.id);
        if (mensaje) mensaje.textContent = error ? 'Error al modificar.' : 'Contraseña actualizada.';
      } else {
        const { error } = await supabaseClient
          .from('administrador')
          .insert([{ nombre, contrasena }]);
        if (mensaje) mensaje.textContent = error ? 'Error al agregar.' : 'Administrador agregado.';
      }

      cargarAdmins();
    });
  }

  // Formulario: eliminar administrador
  const formEliminarAdmin = document.getElementById('formEliminarAdmin');
  if (formEliminarAdmin) {
    formEliminarAdmin.addEventListener('submit', async e => {
      e.preventDefault();
      const id = document.getElementById('adminEliminar')?.value;
      const mensaje = document.getElementById('mensajeEliminar');

      if (!id) {
        if (mensaje) mensaje.textContent = 'Selecciona un administrador.';
        return;
      }

      const { error } = await supabaseClient.from('administrador').delete().eq('id', id);
      if (mensaje) mensaje.textContent = error ? 'Error al eliminar.' : 'Administrador eliminado.';
      cargarAdmins();
    });
  }
});


