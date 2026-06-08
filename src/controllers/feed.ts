import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import type { Response, Request } from "express";

export class feedController {
    static async getAll(req: Request, res: Response) {
        const publicaciones = await publicacionModel.getAll()
        const imagenes = await imagenModel.getAll()

        const publicacionesConImagenes = publicaciones.map(p => {
            const imagen = imagenes.find(i => i.idPublicacion === p.id)

            return { ...p, imagen }
        })

        return res.render('feed', { publicaciones: publicacionesConImagenes })
    }
}