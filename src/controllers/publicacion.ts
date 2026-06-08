import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import type { Request, Response } from "express";
import type { publicacion } from "../utils/types.js";
import { subirACaudinary } from "../utils/cloudinary.js";

export class publicacionController {
    static async getPublicacionById(req: Request, res: Response) {
        const { id } = req.params

        const idNumero: number = Number(id)
        if (isNaN(idNumero))
            throw new Error("ID invalido")

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion)
            throw new Error("Publicacion no encontrada")
        return res.json(publicacion)
    }

    static async getPublicacionByIdView(req: Request, res: Response) {
        const { id } = req.params

        const idNumero: number = Number(id)
        if (isNaN(idNumero))
            throw new Error("ID invalido")

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion)
            throw new Error("Publicacion no encontrada")

        const imagen = await imagenModel.getById(publicacion.id)
        if (!imagen)
            throw new Error("Imagen no encontrada")


        return res.render('publicacion', { publicacion, imagen })
    }

    static async crearPublicacionView(req: Request, res: Response) {
        return res.render('nueva-publicacion')
    }

    static async crearPublicacion(req: Request, res: Response) {
        const { nickUsuario, titulo, descripcion } = req.body
        const editable: boolean = req.body.editable === 'on'

        const resultado = await publicacionModel.create(nickUsuario, titulo, descripcion, editable)

        if (!resultado)
            throw new Error("Error al crear publicacion")

        const idPublicacion: number = resultado[0]!.id

        const img = req?.file
        if (!img)
            throw new Error("Imagen no encontrada")

        const bufferImg = img.buffer

        const result = await subirACaudinary(bufferImg)

        const imagenesPublicacion = await imagenModel.create(idPublicacion, result.secure_url, true, 0, '')

        return res.json(resultado)
    }
}