const supabaseUrl = 'https://TU-PROJECT.supabase.co';
const supabaseKey = 'TU-API-KEY';
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
  window.location.href = 'admin/index.html';
});

