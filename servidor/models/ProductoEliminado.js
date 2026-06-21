const mongoose = require("mongoose");

const ProductoEliminadoSchema = new mongoose.Schema({
    image: String,
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    fechaEliminacion: {
        type: Date,
        default: Date.now
    }
},
{
    collection: "ProductosEliminados"
});

module.exports =
mongoose.model(
    "ProductoEliminado",
    ProductoEliminadoSchema
);