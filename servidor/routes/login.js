/////////////////
//    BACK .- Login
/////////////////
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const Roles = require("../models/Roles");

// 👇 ID del rol por defecto (cliente)
const defaultRoleId = "692917eaafe24a0ca883efb9";

// LOGIN
router.post("/", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // 1) Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });
    console.log("🔍 Usuario encontrado:", usuario);

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado." });

    // 2) Comparar contraseñas
    const contraseñaValida = bcrypt.compareSync(contrasena, usuario.contrasena);
    if (!contraseñaValida)
      return res.status(401).json({ error: "Contraseña incorrecta." });

    // 3) Asignar rol por defecto si no tiene
    if (!usuario.roleId) {
      usuario.roleId = defaultRoleId;
      await usuario.save();
    }

    // 4) Obtener rol
    const role = await Roles.findById(usuario.roleId);
console.log("🔍 Role encontrado:", role);

    if (!role)
      return res.status(500).json({ error: "El rol asignado no existe." });

    // 5) Respuesta correcta con redirección
    if (role.nombre === "superadmin") {
     return res.json({
        nombre: usuario.nombre,
        rol: role.nombre,   // 👉 SE AGREGA ESTO
        redirect: role.nombre === "superadmin"
    ? "/catalogo.html"
    : "/menuPrincipal.html"
    });
    }

    return res.json({
      nombre: usuario.nombre,
      redirect: "/menuPrincipal.html"
    });

  } catch (error) {
    console.error("❌ Error en Login:", error);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
});

module.exports = router;
