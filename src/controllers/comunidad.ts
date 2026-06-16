import type { Request, Response } from "express";
import { comunidadModel } from "../models/comunidad.js";
import { subirACaudinary } from "../utils/cloudinary.js";
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js";

export class comunidadController {
    static async getComunidadView(req: Request, res: Response) {
        const { nickComunidad } = req.params;

        if (!nickComunidad || typeof nickComunidad !== 'string') {
            throw new Error("Debe ingresar un nick de comunidad");
        }

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
        const { nickComunidad } = req.params;
        const nickUsuario = req.session?.user?.nickname;

        if (!nickUsuario) return res.redirect('/auth/login');

        if (!nickComunidad || typeof nickComunidad !== 'string') throw new Error('Debe ingresar un nick de comunidad')

        const suscripcion = await usuarioSigueComunidadModel.getByNicknames(nickUsuario, nickComunidad);
        if (!suscripcion) {
            await usuarioSigueComunidadModel.create(nickUsuario, nickComunidad);
        }

        const backURL = req.header('Referer') || `/comunidad/${nickComunidad}`;
        return res.redirect(backURL);
    }

    static async dejarDeSeguirComunidad(req: Request, res: Response) {
        const { nickComunidad } = req.params;
        const nickUsuario = req.session?.user?.nickname;

        if (!nickUsuario) return res.redirect('/auth/login')

        if (!nickComunidad || typeof nickComunidad !== 'string') throw new Error('Debe ingresar un nick de comunidad')

        const suscripcion = await usuarioSigueComunidadModel.getByNicknames(nickUsuario, nickComunidad)
        if (suscripcion) {
            await usuarioSigueComunidadModel.delete(nickUsuario, nickComunidad)
        }

        const backURL = req.header('Referer') || `/comunidad/${nickComunidad}`
        return res.redirect(backURL)
    }

    static async crearComunidadView(req: Request, res: Response) {
        return res.render('crear-comunidad')
    }

    static async crearComunidad(req: Request, res: Response) {
        const { nickComunidad, titulo, descripcion, normas } = req.body

        if (!nickComunidad || !titulo) {
            throw new Error("El nick de la comunidad y el titulo son obligatorios")
        }

        const file = req.file as Express.Multer.File
        let imagenUrl = ''

        if (file) {
            const result = (await subirACaudinary(file.buffer)) as any
            imagenUrl = result.secure_url
        }

        const resultado = await comunidadModel.create(
            nickComunidad,
            titulo,
            descripcion || '',
            imagenUrl,
            normas || ''
        )

        if (!resultado) {
            throw new Error("Error al crear la comunidad")
        }

        return res.redirect(`/comunidad/${nickComunidad}`)
    }
}
