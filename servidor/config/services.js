const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("Conectando a MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");
    
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
}

function initServices(app, PORT) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  });
}

module.exports = { initServices };