const mongoose = require("mongoose");

const RolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  descripcion: {
    type: String
  }
});

module.exports = mongoose.model("Roles", RolSchema);