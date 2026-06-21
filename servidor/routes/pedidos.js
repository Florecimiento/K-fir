const express = require("express");
const router = express.Router();

const Pedido =
require("../models/Pedido");


// GUARDAR PEDIDO

router.post("/", async(req,res)=>{

    try{

        const pedido =
        new Pedido({

            cliente:
            req.body.cliente,

            origen:
            req.body.origen,

            productos:
            req.body.productos,

            total:
            req.body.total,

            color:
            req.body.color || "#ff9800"

        });

        const resultado =
        await pedido.save();

        res.status(201).json({

            ok:true,
            mensaje:
            "Pedido guardado",

            pedido:
            resultado

        });

    }
    catch(error){

        res.status(500).json({

            ok:false,
            mensaje:
            error.message

        });

    }

});


// LISTAR PEDIDOS

router.get("/", async(req,res)=>{

    try{

        const pedidos =
        await Pedido.find()
        .sort({fecha:1});

        res.json(pedidos);

    }
    catch(error){

        res.status(500).json({

            ok:false,
            mensaje:
            error.message

        });

    }

});


// CAMBIAR ESTADO

router.put("/:id", async(req,res)=>{

    try{

        const pedido =
        await Pedido.findByIdAndUpdate(

            req.params.id,

            {
                estado:req.body.estado
            },

            {
                new:true
            }

        );

        res.json({

            ok:true,
            pedido

        });

    }
    catch(error){

        res.status(500).json({

            ok:false,
            mensaje:
            error.message

        });

    }

});

module.exports = router;