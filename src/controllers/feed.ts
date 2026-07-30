import { z } from "zod";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js";
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js";
import type { Response, Request } from "express";

const feedQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional()
});

export class feedController {
    static async getAll(req: Request, res: Response) {
        const queryValidation = feedQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            throw new Error("Parámetros de consulta inválidos");
        }

        const publicaciones = await publicacionModel.getAll();
        const imagenes = await imagenModel.getAll();
        const etiquetas = await etiquetaModel.getAll();

        const publicacionesConDatos = publicaciones.map(p => {
            const imagenesPublicacion = imagenes.filter(i => i.idPublicacion === p.id);
            const etiquetasPublicacion = etiquetas.filter(e => e.idPublicacion === p.id);

            return {
                ...p,
                imagenes: imagenesPublicacion,
                imagen: imagenesPublicacion[0],
                etiquetas: etiquetasPublicacion
            };
        });

        return res.render('feed', { publicaciones: publicacionesConDatos, titulo: "Todas las publicaciones" });
    }

    static async getFollowingFeed(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) return res.redirect('/auth/login');

        const queryValidation = feedQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            throw new Error("Parámetros de consulta inválidos");
        }

        const seguidos = await usuarioSigueAModel.getAllSeguidos(nickUsuario);
        const nickSeguidos = seguidos.map(s => s.nickSeguido);

        const publicaciones = await publicacionModel.getAll();
        const publicacionesSeguidos = publicaciones.filter(p => nickSeguidos.includes(p.nickUsuario));

        const imagenes = await imagenModel.getAll();
        const etiquetas = await etiquetaModel.getAll();

        const publicacionesConDatos = publicacionesSeguidos.map(p => {
            const imagenesPublicacion = imagenes.filter(i => i.idPublicacion === p.id);
            const etiquetasPublicacion = etiquetas.filter(e => e.idPublicacion === p.id);

            return {
                ...p,
                imagenes: imagenesPublicacion,
                imagen: imagenesPublicacion[0],
                etiquetas: etiquetasPublicacion
            };
        });

        return res.render('feed', { publicaciones: publicacionesConDatos, titulo: "Feed de seguidos" });
    }

    static async getComunidadesFeed(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) return res.redirect('/auth/login');

        const queryValidation = feedQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            throw new Error("Parámetros de consulta inválidos");
        }

        const seguidas = await usuarioSigueComunidadModel.getByNickname(nickUsuario);
        const nickComunidades = seguidas.map(s => s.nickComunidad);

        const todasPublicacionesComunidad = await publicacionEnComunidadModel.getAll();
        const idsPublicaciones = todasPublicacionesComunidad
            .filter(pc => nickComunidades.includes(pc.nickComunidad))
            .map(pc => pc.idPublicacion);

        if (idsPublicaciones.length === 0) {
            return res.render('feed', { publicaciones: [], titulo: "Feed de Comunidades Seguidas" });
        }

        const publicaciones = await publicacionModel.getByIds(idsPublicaciones);
        publicaciones.sort((a, b) => b.id - a.id);

        const imagenes = await imagenModel.getAll();
        const etiquetas = await etiquetaModel.getAll();

        const publicacionesConDatos = publicaciones.map(p => {
            const imagenesPublicacion = imagenes.filter(i => i.idPublicacion === p.id);
            const etiquetasPublicacion = etiquetas.filter(e => e.idPublicacion === p.id);

            return {
                ...p,
                imagenes: imagenesPublicacion,
                imagen: imagenesPublicacion[0],
                etiquetas: etiquetasPublicacion
            };
        });

        return res.render('feed', { publicaciones: publicacionesConDatos, titulo: "Feed de Comunidades Seguidas" });
    }
}