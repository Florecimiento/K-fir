const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({

    image: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    }

}, {
    collection: "CatalogoProductos",
    timestamps: true
});

module.exports = mongoose.model("Producto", ProductoSchema);

