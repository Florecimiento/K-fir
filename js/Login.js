///////////////////////////////////////////
// FRONT – LOGIN 
///////////////////////////////////////////
console.log("API =", API);
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('email').value;
  const contrasena = document.getElementById('password').value;

  try {
    const response = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
    correo,
    contrasena
  })
});

    const data = await response.json();

 if (response.ok) {
  localStorage.setItem("userRole", data.rol); // 👉 IMPORTANTE
  alert(`✅ Bienvenido ${data.nombre}`);
  window.location.href = data.redirect;
}
 else {
      alert(`⚠️ ${data.error}`);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("❌ No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.");
  }
});


