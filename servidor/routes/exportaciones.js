const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

// CORRECCIÓN AQUÍ: Importación correcta para las versiones modernas de 'docx'
const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    HeadingLevel // Útil si usas títulos nativos
} = require("docx");

const Producto = require("../models/Producto");

//---------------------------------------------------------
// 1. EXPORTAR PDF (Ya funcionaba, se mantiene igual)
//---------------------------------------------------------
router.get("/exportar-pdf", async (req, res) => {
    try {
        const productos = await Producto.find();
        const doc = new PDFDocument({
            size: "A4",
            margin: 40
        });
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=CatalogoProductos.pdf");
        doc.pipe(res);

        // ENCABEZADO
        const logoPath = path.join(__dirname, "../../img/logo.png");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 20, { width: 80 });
        }
        
        doc.fontSize(24).fillColor("#2E7D32").text("Catálogo de Productos", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("black").text("Productos disponibles en inventario", { align: "center" });
        doc.moveDown(2);

        for (const producto of productos) {
            if (doc.y > 650) {
                doc.addPage();
            }
            const inicioY = doc.y;

            // Marco
            doc.roundedRect(40, inicioY, 510, 130, 10).stroke("#CCCCCC");

            // IMAGEN
            try {
                if (producto.image) {
                    const response = await axios({
                        method: "GET",
                        url: producto.image,
                        responseType: "arraybuffer"
                    });
                    const buffer = Buffer.from(response.data, "binary");
                    doc.image(buffer, 50, inicioY + 10, { width: 100, height: 100 });
                }
            } catch (error) {
                doc.fontSize(10).fillColor("red").text("Sin imagen", 75, inicioY + 50);
            }

            // DATOS
            doc.fillColor("#1B5E20").fontSize(16).text(producto.name, 170, inicioY + 10);
            doc.fillColor("black").fontSize(10).text(producto.description, 170, inicioY + 35, { width: 340 });
            doc.fontSize(12).fillColor("#1565C0").text(`Precio: $${producto.price} MXN`, 170, inicioY + 80);
            doc.fillColor("#E65100").text(`Disponibles: ${producto.quantity}`, 350, inicioY + 80);
            doc.moveDown(8);
        }

        doc.moveDown();
        doc.fontSize(10).fillColor("gray").text("Documento generado automáticamente con la información actualizada de MongoDB", { align: "center" });
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: error.message });
    }
});

//---------------------------------------------------------
// 2. EXPORTAR EXCEL (Corregido y optimizado)
//---------------------------------------------------------
router.get("/exportar-excel", async (req, res) => {
    try {
        const productos = await Producto.find();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Catálogo");

        worksheet.columns = [
            { header: "Producto", key: "name", width: 30 },
            { header: "Descripción", key: "description", width: 50 },
            { header: "Precio", key: "price", width: 15 },
            { header: "Cantidad", key: "quantity", width: 15 }
        ];

        // Diseño básico opcional para los encabezados de Excel
        worksheet.getRow(1).font = { bold: true };

        productos.forEach(prod => {
            worksheet.addRow({
                name: prod.name,
                description: prod.description,
                price: prod.price,
                quantity: prod.quantity
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=CatalogoProductos.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
});

//---------------------------------------------------------
// 3. EXPORTAR WORD (Corregido el error de TableRow)
//---------------------------------------------------------
router.get("/exportar-word", async (req, res) => {
    try {
        const productos = await Producto.find();

        const filas = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph("Producto")] }),
                    new TableCell({ children: [new Paragraph("Descripción")] }),
                    new TableCell({ children: [new Paragraph("Precio")] }),
                    new TableCell({ children: [new Paragraph("Cantidad")] })
                ]
            })
        ];

        productos.forEach(prod => {
            filas.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(prod.name || "")] }),
                        new TableCell({ children: [new Paragraph(prod.description || "")] }),
                        new TableCell({ children: [new Paragraph(`$${prod.price}`)] }),
                        new TableCell({ children: [new Paragraph(String(prod.quantity || 0))] })
                    ]
                })
            );
        });

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: "CATÁLOGO DE PRODUCTOS KÉFIR",
                        heading: HeadingLevel.HEADING_1, // Uso correcto de headings en docx moderno
                    }),
                    new Paragraph({ text: "" }), // Espacio en blanco simulado
                    new Table({
                        rows: filas
                    })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", "attachment; filename=CatalogoProductos.docx");
        res.send(buffer);

    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message });
    }
});

module.exports = router;