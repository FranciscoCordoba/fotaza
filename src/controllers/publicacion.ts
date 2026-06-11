import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
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

        const imagenes = await imagenModel.getByPublicacionId(publicacion.id)
        const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)

        return res.render('publicacion', { publicacion, imagenes, etiquetas })
    }

    static async crearPublicacionView(req: Request, res: Response) {
        return res.render('nueva-publicacion')
    }

    static async crearPublicacion(req: Request, res: Response) {
        const { nickUsuario, titulo, descripcion, etiquetas } = req.body

        const resultado = await publicacionModel.create(nickUsuario, titulo, descripcion)

        if (!resultado)
            throw new Error("Error al crear publicacion")

        const idPublicacion: number = resultado[0]!.id

        const files = req.files as Express.Multer.File[]
        if (!files || files.length === 0)
            throw new Error("Debe subir al menos una imagen")

        const uploadPromises = files.map(async (file) => {
            const result = (await subirACaudinary(file.buffer)) as any
            return result.secure_url
        })
        const urls = await Promise.all(uploadPromises)

        const saveImagePromises = urls.map(url => imagenModel.create(idPublicacion, url))
        await Promise.all(saveImagePromises)

        if (etiquetas && typeof etiquetas === 'string') {
            const listaEtiquetas = etiquetas
                .split(/\s+/)
                .filter(tag => tag.startsWith('#'))
                .map(tag => tag.slice(1).trim())
                .filter(tag => tag.length > 0)

            if (listaEtiquetas.length > 0) {
                const saveTagPromises = listaEtiquetas.map(tag => etiquetaModel.create(idPublicacion, tag))
                await Promise.all(saveTagPromises)
            }
        }

        return res.redirect('/feed')
    }
}