/////////////////
//    BACK .- Registro de usuario
/////////////////
const Usuario = require("../models/Usuario"); // define la estructura del modelado de datos
const express = require("express"); //acceder al servidor, manejo de rutas 
const router = express.Router();  // agrupar y organizar rutas y middleware de forma independiente
const bcrypt = require("bcryptjs");

router.post("/", async (req, res) => {  //Una función de flecha asíncrona que se ejecuta cuando llega una petición POST a esa ruta. Objeto de solicitud (datos del cliente).
  try {
    const { nombre, correo, telefono, contrasena } = req.body; //body. Un objeto que contiene parámetros de texto del cuerpo de la solicitud analizada, cuyo valor predeterminado es {}

    if (!nombre || !correo || !telefono || !contrasena) {
      return res.status(400).json({ error: "Campos faltantes" });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuarioExistente = await Usuario.findOne({ correo: correoNormalizado });
    if (usuarioExistente) {
      return res.status(403).json({ error: "El correo ya existe" });
    }

    const salt = bcrypt.genSaltSync(10);
    const contraseñaEncriptada = bcrypt.hashSync(contrasena, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      correo: correoNormalizado,
      telefono,
      contrasena: contraseñaEncriptada,
      roleId: req.body.roleId  // 👈 IMPORTANTE
    });

    await nuevoUsuario.save();

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: { nombre, correo: correoNormalizado, telefono }
    });

  } catch (error) {
    console.error("🔥 ERROR 500 en backend:", error);
    res.status(500).json({ error: "Error del servidor", detalle: error.message });
  }
});

module.exports = router; 
