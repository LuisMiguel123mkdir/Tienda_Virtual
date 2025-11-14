// Conexión a Supabase
const supabaseUrl = 'https://TU-PROJECT.supabase.co';
const supabaseKey = 'TU-API-KEY';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const contrasena = document.getElementById('contrasena').value;

  // Buscar administrador en la BD
  const { data, error } = await supabase
    .from('administrador')
    .select('id, nombre, contrasena')
    .eq('nombre', nombre)
    .single();

  if (error || !data) {
    document.getElementById('mensaje').textContent = 'Usuario no encontrado';
    return;
  }

  // ⚠️ Aquí se compara directamente la contraseña (texto plano)
  // Lo ideal es usar bcrypt y guardar hashes en la BD
  if (data.contrasena === contrasena) {
    // Redirigir al panel admin
    window.location.href = 'admin/index.html';
  } else {
    document.getElementById('mensaje').textContent = 'Contraseña incorrecta';
  }
});
