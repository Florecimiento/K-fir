console.log("Carpeta actual:", __dirname);
require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
app.use(cors({origin: "*"}));
//app.use(cors());
app.use(express.json());
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, ".."))); 
app.use("/css", express.static(path.join(__dirname, "../css")));
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/img", express.static(path.join(__dirname, "../img")));
// Modelos
const Usuario = require("./models/Usuario");
const Producto = require("./models/Roles");
const Catalogo = require("./models/Producto");
// Conectar servicios
const { initServices } = require("./config/services");
const PORT = process.env.PORT || 3000;

app.get("/api/test", (req,res)=>{

   res.json({
      ok:true,
      mensaje:"Servidor funcionando"
   });

});


// Rutas API
app.use("/api/registro", require("./routes/registro"));
app.use("/api/login", require("./routes/login"));
app.use("/api/productos", require("./routes/productos"));
app.use("/api/exportaciones", require("./routes/exportaciones"));
app.use("/api/pedidos",require("./routes/pedidos"));


console.log("🟦 server.js cargado correctamente");
initServices(app, PORT);
// Ruta index
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});
