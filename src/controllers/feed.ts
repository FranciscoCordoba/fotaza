import { feedQuerySchema } from "../utils/schemas.js"
import { publicacionModel } from "../models/publicacion.js"
import { imagenModel } from "../models/imagen.js"
import { etiquetaModel } from "../models/etiqueta.js"
import { usuarioSigueAModel } from "../models/usuarioSigueA.js"
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js"
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js"
import { valoracionModel } from "../models/valoracion.js"
import type { Response, Request } from "express"

export class feedController {
    static async getAll(req: Request, res: Response) {
        const queryValidation = feedQuerySchema.safeParse(req.query)
        if (!queryValidation.success) {
            return res.redirect('/feed')
        }

        const publicaciones = await publicacionModel.getAll()
        const imagenes = await imagenModel.getAll()
        const etiquetas = await etiquetaModel.getAll()
        const valoraciones = await valoracionModel.getAll()

        const scores = new Map<number, number>();
        publicaciones.forEach(p => {
            const imagenesPub = imagenes.filter(i => i.idPublicacion === p.id);
            if (imagenesPub.length > 0) {
                const idImagen = imagenesPub[0]?.id;
                const vals = valoraciones.filter(v => v.idImagen === idImagen);
                if (vals.length > 0) {
                    const avg = vals.reduce((acc, v) => acc + v.valoracion, 0) / vals.length;
                    const score = avg + (vals.length * 0.5); 
                    scores.set(p.id, score);
                } else {
                    scores.set(p.id, 0);
                }
            } else {
                scores.set(p.id, -1);
            }
        });

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

        publicacionesConDatos.sort((a, b) => {
            const scoreA = scores.get(a.id) ?? -1;
            const scoreB = scores.get(b.id) ?? -1;
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return res.render('feed', { publicaciones: publicacionesConDatos, titulo: "Todas las publicaciones" })
    }

    static async getFollowingFeed(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const queryValidation = feedQuerySchema.safeParse(req.query)
        if (!queryValidation.success) {
            return res.redirect('/feed')
        }

        const seguidos = await usuarioSigueAModel.getAllSeguidos(nickUsuario)
        const nickSeguidos = seguidos.map(s => s.nickSeguido)

        const publicaciones = await publicacionModel.getAll()
        const publicacionesSeguidos = publicaciones.filter(p => nickSeguidos.includes(p.nickUsuario))

        const imagenes = await imagenModel.getAll()
        const etiquetas = await etiquetaModel.getAll()

        const publicacionesConDatos = publicacionesSeguidos.map(p => {
            const imagenesPublicacion = imagenes.filter(i => i.idPublicacion === p.id)
            const etiquetasPublicacion = etiquetas.filter(e => e.idPublicacion === p.id)

            return {
                ...p,
                imagenes: imagenesPublicacion,
                imagen: imagenesPublicacion[0],
                etiquetas: etiquetasPublicacion
            }
        })

        publicacionesConDatos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return res.render('feed', { publicaciones: publicacionesConDatos, titulo: "Feed de seguidos" })
    }

    static async getComunidadesFeed(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const queryValidation = feedQuerySchema.safeParse(req.query)
        if (!queryValidation.success) {
            return res.redirect('/feed')
        }

        const seguidas = await usuarioSigueComunidadModel.getByNickname(nickUsuario)
        const nickComunidades = seguidas.map(s => s.nickComunidad)

        const todasPublicacionesComunidad = await publicacionEnComunidadModel.getAll()
        const idsPublicaciones = todasPublicacionesComunidad
            .filter(pc => nickComunidades.includes(pc.nickComunidad))
            .map(pc => pc.idPublicacion)

        if (idsPublicaciones.length === 0) {
            return res.render('feed', { publicaciones: [], titulo: "Feed de Comunidades Seguidas" })
        }

        const publicaciones = await publicacionModel.getByIds(idsPublicaciones)
        
        const imagenes = await imagenModel.getAll()
        const etiquetas = await etiquetaModel.getAll()

        const publicacionesConDatos = publicaciones.map(p => {
            const imagenesPublicacion = imagenes.filter(i => i.idPublicacion === p.id)
            const etiquetasPublicacion = etiquetas.filter(e => e.idPublicacion === p.id)
            
            const enComunidades = todasPublicacionesComunidad.filter(pc => pc.idPublicacion === p.id && nickComunidades.includes(pc.nickComunidad))
            const comunidadOrigen = enComunidades.length > 0 ? enComunidades[0]?.nickComunidad : null;

            return {
                ...p,
                imagenes: imagenesPublicacion,
                imagen: imagenesPublicacion[0],
                etiquetas: etiquetasPublicacion,
                comunidadOrigen
            }
        })

        publicacionesConDatos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return res.render('feed', { publicaciones: publicacionesConDatos, titulo: "Feed de Comunidades Seguidas" })
    }
}