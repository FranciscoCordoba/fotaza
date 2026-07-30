import type { Request, Response } from "express";
import { z } from "zod";
import { comunidadModel } from "../models/comunidad.js";
import { subirACaudinary } from "../utils/cloudinary.js";
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js";

const nickComunidadParamsSchema = z.object({
    nickComunidad: z.string({ message: "Debe ingresar un nick de comunidad" }).min(1, "Debe ingresar un nick de comunidad")
});

const crearComunidadBodySchema = z.object({
    nickComunidad: z.string({ message: "El nick de la comunidad y el titulo son obligatorios" }).min(1, "El nick de la comunidad y el titulo son obligatorios"),
    titulo: z.string({ message: "El nick de la comunidad y el titulo son obligatorios" }).min(1, "El nick de la comunidad y el titulo son obligatorios"),
    descripcion: z.string().optional().default(''),
    normas: z.string().optional().default('')
});

export class comunidadController {
    static async getComunidadView(req: Request, res: Response) {
        const validation = nickComunidadParamsSchema.safeParse(req.params);
        if (!validation.success) {
            throw new Error(validation.error.issues[0]?.message || "Debe ingresar un nick de comunidad");
        }
        const { nickComunidad } = validation.data;

        const comunidad = await comunidadModel.getByNickname(nickComunidad);
        if (!comunidad) {
            throw new Error("Comunidad no encontrada");
        }

        const nickUsuario = req.session?.user?.nickname;
        let siguiendo = false;
        if (nickUsuario) {
            const suscripcion = await usuarioSigueComunidadModel.getByNicknames(nickUsuario, nickComunidad);
            if (suscripcion) siguiendo = true;
        }

        const publicacionesComunidad = await publicacionEnComunidadModel.getByComunidad(nickComunidad);
        const idsPublicaciones = publicacionesComunidad.map(pc => pc.idPublicacion);

        const todasPublicaciones = await publicacionModel.getByIds(idsPublicaciones);

        todasPublicaciones.sort((a, b) => b.createdAt > a.createdAt ? 1 : -1);

        todasPublicaciones.map(async p => {
            const imagenes = await imagenModel.getByIdPublicacion(p.id);
            const etiquetas = await etiquetaModel.getByIdPublicacion(p.id);

            return {
                ...p,
                imagenes,
                imagen: imagenes[0],
                etiquetas
            }
        })

        const publicacionesConDatos = await Promise.all(todasPublicaciones)

        return res.render('comunidad', { comunidad, publicaciones: publicacionesConDatos, siguiendo });
    }

    static async seguirComunidad(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) return res.redirect('/auth/login');

        const validation = nickComunidadParamsSchema.safeParse(req.params);
        if (!validation.success) {
            throw new Error(validation.error.issues[0]?.message || "Debe ingresar un nick de comunidad");
        }
        const { nickComunidad } = validation.data;

        const suscripcion = await usuarioSigueComunidadModel.getByNicknames(nickUsuario, nickComunidad);
        if (!suscripcion) {
            await usuarioSigueComunidadModel.create(nickUsuario, nickComunidad);
        }

        const backURL = req.header('Referer') || `/comunidad/${nickComunidad}`;
        return res.redirect(backURL);
    }

    static async dejarDeSeguirComunidad(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) return res.redirect('/auth/login');

        const validation = nickComunidadParamsSchema.safeParse(req.params);
        if (!validation.success) {
            throw new Error(validation.error.issues[0]?.message || "Debe ingresar un nick de comunidad");
        }
        const { nickComunidad } = validation.data;

        const suscripcion = await usuarioSigueComunidadModel.getByNicknames(nickUsuario, nickComunidad);
        if (suscripcion) {
            await usuarioSigueComunidadModel.delete(nickUsuario, nickComunidad);
        }

        const backURL = req.header('Referer') || `/comunidad/${nickComunidad}`;
        return res.redirect(backURL);
    }

    static async crearComunidadView(req: Request, res: Response) {
        return res.render('crear-comunidad');
    }

    static async crearComunidad(req: Request, res: Response) {
        const validation = crearComunidadBodySchema.safeParse(req.body);
        if (!validation.success) {
            throw new Error(validation.error.issues[0]?.message || "El nick de la comunidad y el titulo son obligatorios");
        }
        const { nickComunidad, titulo, descripcion, normas } = validation.data;

        const file = req.file as Express.Multer.File;
        let imagenUrl = '';

        if (file) {
            const result = (await subirACaudinary(file.buffer)) as any;
            imagenUrl = result.secure_url;
        }

        const resultado = await comunidadModel.create(
            nickComunidad,
            titulo,
            descripcion || '',
            imagenUrl,
            normas || ''
        );

        if (!resultado) {
            throw new Error("Error al crear la comunidad");
        }

        return res.redirect(`/comunidad/${nickComunidad}`);
    }
}
