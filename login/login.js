const supabaseUrl = 'https://wnwlqvhqnumualecxnuh.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2xxdmhxbnVtdWFsZWN4bnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM0NTcsImV4cCI6MjA3ODYxOTQ1N30.-fPjOVaAGvVGfCUSVMtu9yLuxxJL02oMQ-qtxpP8CtE'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const contrasena = document.getElementById('contrasena').value;

  const { data, error } = await supabase
    .from('administrador')
    .select('id, nombre, contrasena')
    .eq('nombre', nombre)
    .eq('contrasena', contrasena) // ⚠️ por ahora texto plano
    .single();

  if (error || !data) {
    document.getElementById('mensaje').textContent = 'Usuario o contraseña incorrectos';
    return;
  }

  // Guardar sesión en localStorage
localStorage.setItem('isAdmin', 'true');

// Redirigir al panel admin
window.location.href = 'https://luismiguel123mkdir.github.io/Tienda_Virtual/admin/index.html';

});

