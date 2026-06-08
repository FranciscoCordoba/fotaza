import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
import type { Response, Request } from "express";

export class feedController {
    static async getAll(req: Request, res: Response) {
        const publicaciones = await publicacionModel.getAll()
        const imagenes = await imagenModel.getAll()
        const etiquetas = await etiquetaModel.getAll()

        const publicacionesConDatos = publicaciones.map(p => {
            const imagenesPublicacion = imagenes.filter(i => i.idPublicacion === p.id)
            const etiquetasPublicacion = etiquetas.filter(e => e.idPublicacion === p.id)

            return {
                ...p,
                imagenes: imagenesPublicacion,
                imagen: imagenesPublicacion[0],
                etiquetas: etiquetasPublicacion
            }
        })

        return res.render('feed', { publicaciones: publicacionesConDatos })
    }
}