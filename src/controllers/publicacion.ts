import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
import { valoracionModel } from "../models/valoracion.js";
import { comentarioModel } from "../models/comentario.js";
import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { comunidadModel } from "../models/comunidad.js";
import type { Request, Response } from "express";
import type { publicacion } from "../utils/types.js";
import { subirACaudinary } from "../utils/cloudinary.js";
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js";
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js";
import { denunciaComentarioModel } from "../models/denunciaComentario.js";
import { denunciaImagenModel } from "../models/denunciaImagen.js";

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
        const { id, orden } = req.params

        const idNumero: number = Number(id)
        if (isNaN(idNumero))
            throw new Error("ID invalido")

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion)
            throw new Error("Publicacion no encontrada")

        const ordenNumero: number = Number(orden)
        if (isNaN(ordenNumero))
            throw new Error("Orden invalido")

        const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, ordenNumero)
        const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)
        const { prev, post } = await imagenModel.getPrevYPost(publicacion.id, ordenNumero)

        const nickUsuario = req.session?.user?.nickname
        let siguiendo = false
        if (nickUsuario && nickUsuario != publicacion.nickUsuario) {
            const resultado = await usuarioSigueAModel.getByNicknames(nickUsuario, publicacion.nickUsuario)
            if (resultado)
                siguiendo = true
        }

        if (!imagen) {
            throw new Error("Imagen no encontrada")
        }
        const statsValoracion = await valoracionModel.getStatsByImage(imagen.id)
        const comentarios = await comentarioModel.getAllByImage(imagen.id)

        return res.render('publicacion', { publicacion, imagen, etiquetas, prev, post, statsValoracion, comentarios, siguiendo, nickUsuario })
    }

    static async valorarImagen(req: Request, res: Response) {
        const { idImagen } = req.params
        const { puntaje } = req.body

        const idImagenNum = Number(idImagen)
        const puntajeNum = Number(puntaje)

        if (isNaN(idImagenNum) || isNaN(puntajeNum) || puntajeNum < 1 || puntajeNum > 5) {
            throw new Error("Datos de valoracion invalidos")
        }

        const nickUsuario = req.session?.user?.nickname

        await valoracionModel.create(nickUsuario!, idImagenNum, puntajeNum)

        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async comentarImagen(req: Request, res: Response) {
        const { idImagen } = req.params
        const { texto } = req.body

        const idImagenNum = Number(idImagen)
        if (isNaN(idImagenNum) || !texto || texto.trim().length === 0) {
            throw new Error("Datos de comentario invalidos")
        }

        const nickUsuario = req.session?.user?.nickname

        await comentarioModel.create(nickUsuario!, idImagenNum, texto.trim())

        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async buscarPublicacionesView(req: Request, res: Response) {
        const { busqueda } = req.query

        if (!busqueda || typeof busqueda !== 'string')
            throw new Error("Busqueda invalida")

        const publicaciones = await publicacionModel.getByTitulo(busqueda)
        const comunidades = await comunidadModel.search(busqueda)

        const publicacionesConDatos = await Promise.all(publicaciones.map(async publicacion => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, 1)
            const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)
            return {
                ...publicacion,
                imagen,
                etiquetas
            }
        }))

        return res.render('explorador', { publicacionesConDatos, comunidades })
    }

    static async crearPublicacionView(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname
        let comunidadesSigue: any[] = []
        if (nickUsuario) {
            comunidadesSigue = await usuarioSigueComunidadModel.getByNickname(nickUsuario)
        }
        return res.render('nueva-publicacion', { comunidadesSigue })
    }

    static async crearPublicacion(req: Request, res: Response) {
        const { titulo, descripcion, etiquetas } = req.body
        const nickUsuario = req.session?.user?.nickname

        if (!nickUsuario)
            throw new Error("Usuario no logueado")

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

        const saveImagePromises = urls.map((url, index) => imagenModel.create(idPublicacion, url, index + 1))
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

        const comunidades = req.body.comunidades
        if (comunidades) {
            const listaComunidades = Array.isArray(comunidades) ? comunidades : [comunidades]
            const saveComunidadesPromises = listaComunidades.map(nickComunidad =>
                publicacionEnComunidadModel.create(nickComunidad, idPublicacion)
            )
            await Promise.all(saveComunidadesPromises)
        }

        return res.redirect('/feed')
    }

    static async toggleComentariosImagen(req: Request, res: Response) {
        const { idImagen } = req.params
        const { comentariosActivos } = req.body
        const idImagenNum = Number(idImagen)
        if (isNaN(idImagenNum)) {
            throw new Error("Datos invalidos")
        }

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen) throw new Error("Imagen no encontrada")

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        const nickUsuario = req.session?.user?.nickname

        if (publicacion?.nickUsuario !== nickUsuario) {
            throw new Error("No tienes permiso")
        }

        await imagenModel.toggleComentariosActivos(idImagenNum, comentariosActivos === 'true')
        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async denunciarComentario(req: Request, res: Response) {
        const { idComentario } = req.params
        const idComentarioNum = Number(idComentario)
        if (isNaN(idComentarioNum)) {
            throw new Error("Datos invalidos")
        }

        const nickUsuario = req.session?.user?.nickname
        if (!nickUsuario) {
            throw new Error("Usuario no logueado")
        }

        await denunciaComentarioModel.create(nickUsuario, idComentarioNum)
        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async denunciarImagenView(req: Request, res: Response) {
        const { idImagen } = req.params;
        const idImagenNum = Number(idImagen);
        if (isNaN(idImagenNum)) throw new Error("Datos invalidos");

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const imagen = await imagenModel.getById(idImagenNum);
        if (!imagen) throw new Error("Imagen no encontrada");

        const publicacion = await publicacionModel.getById(imagen.idPublicacion);
        if (publicacion?.nickUsuario === nickUsuario) {
            throw new Error("No puedes denunciar tu propia imagen");
        }

        const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagenNum);
        const yaDenunciado = !!denunciaExistente;

        const motivos = await denunciaImagenModel.getMotivos();

        return res.render('denunciar-imagen', {
            imagen,
            publicacion,
            motivos,
            yaDenunciado
        });
    }

    static async denunciarImagenPost(req: Request, res: Response) {
        const { idImagen } = req.params;
        const { idMotivo, descripcion } = req.body;
        const idImagenNum = Number(idImagen);
        const idMotivoNum = Number(idMotivo);

        if (isNaN(idImagenNum) || isNaN(idMotivoNum)) {
            throw new Error("Datos invalidos");
        }

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const imagen = await imagenModel.getById(idImagenNum);
        if (!imagen) throw new Error("Imagen no encontrada");

        const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagenNum);
        if (denunciaExistente) {
            throw new Error("Ya has denunciado esta imagen");
        }

        await denunciaImagenModel.create(nickUsuario, idImagenNum, idMotivoNum, descripcion);

        return res.redirect(`/publicacion/p/${imagen.idPublicacion}/${imagen.orden}`);
    }
}