const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  telefono: String,
  contrasena: String,
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roles"
  }
});

module.exports = mongoose.model("Usuario", UsuarioSchema);