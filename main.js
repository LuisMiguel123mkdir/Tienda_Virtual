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
