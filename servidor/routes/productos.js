const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");


// GUARDAR PRODUCTO
router.post("/alta", async (req, res) => {

    try {
        const producto = new Producto({
            image: req.body.image,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity
        });
        const resultado = await producto.save();
        res.status(201).json({
            ok: true,
            mensaje: "Producto guardado correctamente",
            producto: resultado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            mensaje: error.message
        });
    }
});

// EDITAR PRODUCTOS
router.put("/:id", async(req,res)=>{

   console.log("================================");
    console.log("PUT RECIBIDO");
    console.log("ID:", req.params.id);
    console.log("BODY:", req.body);

    try{
        const producto =
        await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );
        res.json({
            ok:true,
            mensaje:"Producto actualizado",
            producto
        });
    }
    catch(error){
        res.status(500).json({
            ok:false,
            mensaje:error.message
        });
    }
});

// BORRAR PRODUCTO
const ProductoEliminado =
require("../models/ProductoEliminado");
router.delete("/:id", async (req,res)=>{
    try{
        const producto =
        await Producto.findById(
            req.params.id
        );
        if(!producto){
            return res.status(404).json({
                ok:false,
                mensaje:
                "Producto no encontrado"
            });
        }
        const respaldo =
        new ProductoEliminado({
            image:
            producto.image,
            name:
            producto.name,
            description:
            producto.description,
            price:
            producto.price,
            quantity:
            producto.quantity
        });
        await respaldo.save();
        await Producto.findByIdAndDelete(
            req.params.id
        );
        res.json({
            ok:true,
            mensaje:
            "Producto enviado a ProductosEliminados"
        });
    }
    catch(error){
        res.status(500).json({
            ok:false,
            mensaje:error.message
        });
    }
});


// LISTAR PRODUCTOS
router.get("/", async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: error.message
        });
    }
});

module.exports = router;
