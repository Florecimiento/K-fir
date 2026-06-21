const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({

    cliente:{
        type:String,
        required:true
    },

    origen:{
        type:String,
        enum:["APP","TELEFONO"],
        default:"APP"
    },

    productos:[

        {
            productoId:String,
            nombre:String,
            imagen:String,
            precio:Number,
            cantidad:Number
        }

    ],

    total:{
        type:Number,
        required:true
    },

    estado:{
        type:String,
        enum:[
            "PENDIENTE",
            "PREPARANDO",
            "LISTO",
            "ENTREGADO"
        ],
        default:"PENDIENTE"
    },

    color:{
        type:String,
        default:"#ff9800"
    },

    fecha:{
        type:Date,
        default:Date.now
    }

});

module.exports =
mongoose.model(
    "Pedido",
    PedidoSchema,
    "Pedidos"
);