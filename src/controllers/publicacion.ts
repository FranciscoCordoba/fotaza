import { publicacionModel } from "../models/publicacion.js"
import { imagenModel } from "../models/imagen.js"
import { etiquetaModel } from "../models/etiqueta.js"
import { valoracionModel } from "../models/valoracion.js"
import { comentarioModel } from "../models/comentario.js"
import { usuarioSigueAModel } from "../models/usuarioSigueA.js"
import { comunidadModel } from "../models/comunidad.js"
import type { Request, Response } from "express"
import type { publicacion } from "../utils/types.js"
import { subirACaudinary, subirACaudinaryConMarcaDeAgua } from "../utils/cloudinary.js"
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js"
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js"
import { denunciaComentarioModel } from "../models/denunciaComentario.js"
import { denunciaImagenModel } from "../models/denunciaImagen.js"
import { coleccionModel } from "../models/coleccion.js"
import { notificacionModel } from "../models/notificacion.js"
import { interesModel } from "../models/interes.js"
import { mensajeModel } from "../models/mensaje.js"
import { conversacionModel } from "../models/conversacion.js"
import {
    getPublicacionByIdParamsSchema,
    getPublicacionByIdViewParamsSchema,
    valorarImagenParamsSchema,
    valorarImagenBodySchema,
    comentarImagenParamsSchema,
    comentarImagenBodySchema,
    buscarPublicacionesQuerySchema,
    crearPublicacionBodySchema,
    toggleComentariosImagenParamsSchema,
    denunciarComentarioParamsSchema,
    denunciarImagenViewParamsSchema,
    denunciarImagenPostParamsSchema,
    denunciarImagenPostBodySchema,
    toggleFavoritoParamsSchema,
    setCopyrightImagenParamsSchema,
    setCopyrightImagenBodySchema,
    marcarInteresParamsSchema
} from "../utils/schemas.js"

export class publicacionController {
    static async getPublicacionById(req: Request, res: Response) {
        const parseResult = getPublicacionByIdParamsSchema.safeParse(req.params)
        if (!parseResult.success) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }
        const { id: idNumero } = parseResult.data

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }
        return res.json(publicacion)
    }

    static async getPublicacionByIdView(req: Request, res: Response) {
        const parseResult = getPublicacionByIdViewParamsSchema.safeParse(req.params)
        if (!parseResult.success) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }
        const { id: idNumero, orden: ordenNumero } = parseResult.data

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, ordenNumero)
        if (!imagen) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)
        const { prev, post } = await imagenModel.getPrevYPost(publicacion.id, ordenNumero)

        const nickUsuario = req.session?.user?.nickname
        let siguiendo = false
        if (nickUsuario && nickUsuario != publicacion.nickUsuario) {
            const resultado = await usuarioSigueAModel.getByNicknames(nickUsuario, publicacion.nickUsuario)
            if (resultado)
                siguiendo = true
        }

        const statsValoracion = await valoracionModel.getStatsByImage(imagen.id)
        const comentarios = await comentarioModel.getAllByImage(imagen.id)

        let enFavoritos = false
        if (nickUsuario) {
            const colecciones = await coleccionModel.getByUsuarioAndPublicacion(nickUsuario, publicacion.id)
            if (colecciones.length > 0) {
                enFavoritos = true
            }
        }

        let yaInteresado = false
        if (nickUsuario && nickUsuario != publicacion.nickUsuario && imagen.copyright) {
            const interes = await interesModel.getByNicknames(nickUsuario, imagen.id)
            if (interes) {
                yaInteresado = true
            }
        }

        return res.render('publicacion', { publicacion, imagen, etiquetas, prev, post, statsValoracion, comentarios, siguiendo, nickUsuario, enFavoritos, yaInteresado })
    }

    static async valorarImagen(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const paramsResult = valorarImagenParamsSchema.safeParse(req.params)
        const bodyResult = valorarImagenBodySchema.safeParse(req.body)

        if (!paramsResult.success || !bodyResult.success) {
            return res.redirect(backURL)
        }

        const idImagenNum = paramsResult.data.idImagen
        const puntajeNum = bodyResult.data.puntaje

        const nickUsuario = req.session!.user!.nickname

        await valoracionModel.create(nickUsuario, idImagenNum, puntajeNum)

        const imagen = await imagenModel.getById(idImagenNum)
        if (imagen) {
            const publicacion = await publicacionModel.getById(imagen.idPublicacion)
            if (publicacion && publicacion.nickUsuario !== nickUsuario) {
                await notificacionModel.create(nickUsuario, publicacion.nickUsuario, 'valoracion')
            }
        }

        return res.redirect(backURL)
    }

    static async comentarImagen(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const paramsResult = comentarImagenParamsSchema.safeParse(req.params)
        const bodyResult = comentarImagenBodySchema.safeParse(req.body)

        if (!paramsResult.success || !bodyResult.success) {
            return res.redirect(backURL)
        }

        const idImagenNum = paramsResult.data.idImagen
        const { texto } = bodyResult.data

        const nickUsuario = req.session!.user!.nickname

        await comentarioModel.create(nickUsuario, idImagenNum, texto)

        const imagen = await imagenModel.getById(idImagenNum)
        if (imagen) {
            const publicacion = await publicacionModel.getById(imagen.idPublicacion)
            if (publicacion && publicacion.nickUsuario !== nickUsuario) {
                await notificacionModel.create(nickUsuario, publicacion.nickUsuario, 'comentario')
            }
        }

        return res.redirect(backURL)
    }

    static async buscarPublicacionesView(req: Request, res: Response) {
        const parseResult = buscarPublicacionesQuerySchema.safeParse(req.query)

        if (!parseResult.success) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const { busqueda, etiqueta, autor, orden } = parseResult.data

        let publicaciones = await publicacionModel.getAll()

        if (busqueda) {
            const b = busqueda.toLowerCase()
            publicaciones = publicaciones.filter(p => p.titulo.toLowerCase().includes(b) || (p.descripcion && p.descripcion.toLowerCase().includes(b)))
        }

        if (autor) {
            const a = autor.toLowerCase()
            publicaciones = publicaciones.filter(p => p.nickUsuario.toLowerCase() === a)
        }

        const publicacionesConDatos = await Promise.all(publicaciones.map(async publicacion => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, 1)
            const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)
            return {
                ...publicacion,
                imagen,
                etiquetas
            }
        }))

        let result = publicacionesConDatos;

        if (etiqueta) {
            const e = etiqueta.toLowerCase().replace('#', '')
            result = result.filter(p => p.etiquetas && p.etiquetas.some(t => t.etiqueta.toLowerCase() === e))
        }

        if (orden === 'antiguas') {
            result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        } else {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }

        const comunidades = busqueda ? await comunidadModel.search(busqueda) : []

        return res.render('explorador', { 
            publicacionesConDatos: result, 
            comunidades,
            busqueda,
            etiqueta,
            autor,
            orden
        })
    }

    static async crearPublicacionView(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname
        const comunidadesSigue = await usuarioSigueComunidadModel.getByNickname(nickUsuario)
        return res.render('nueva-publicacion', { comunidadesSigue })
    }

    static async crearPublicacion(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname
        const comunidadesSigue = await usuarioSigueComunidadModel.getByNickname(nickUsuario)

        const parseResult = crearPublicacionBodySchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.render('nueva-publicacion', { error: "Error al crear publicacion", comunidadesSigue })
        }
        const { titulo, descripcion, etiquetas, comunidades } = parseResult.data

        const files = req.files as Express.Multer.File[]
        if (!files || files.length === 0) {
            return res.render('nueva-publicacion', { error: "Debe subir al menos una imagen", comunidadesSigue })
        }

        const resultado = await publicacionModel.create(nickUsuario, titulo, descripcion || "")

        if (!resultado) {
            return res.render('nueva-publicacion', { error: "Error al crear publicacion", comunidadesSigue })
        }

        const idPublicacion: number = resultado[0]!.id

        const uploadPromises = files.map(async (file) => {
            const result = (await subirACaudinary(file.buffer)) as any
            return result.secure_url
        })
        const urls = await Promise.all(uploadPromises)

        const saveImagePromises = urls.map((url, index) => imagenModel.create(idPublicacion, url, index + 1, false))
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

        if (comunidades) {
            const listaComunidades = Array.isArray(comunidades) ? comunidades : [comunidades]
            const saveComunidadesPromises = listaComunidades.map(nickComunidad =>
                publicacionEnComunidadModel.create(nickComunidad, idPublicacion)
            )
            await Promise.all(saveComunidadesPromises)
        }

        return res.redirect(`/publicacion/p/${idPublicacion}/1`)
    }

    static async toggleComentariosImagen(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const paramsResult = toggleComentariosImagenParamsSchema.safeParse(req.params)
        if (!paramsResult.success) {
            return res.redirect(backURL)
        }
        const idImagenNum = paramsResult.data.idImagen
        const { comentariosActivos } = req.body

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen) {
            return res.redirect(backURL)
        }

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        const nickUsuario = req.session!.user!.nickname

        if (publicacion?.nickUsuario !== nickUsuario) {
            return res.redirect(backURL)
        }

        await imagenModel.toggleComentariosActivos(idImagenNum, comentariosActivos === 'true' || comentariosActivos === true)
        return res.redirect(backURL)
    }

    static async denunciarComentario(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const parseResult = denunciarComentarioParamsSchema.safeParse(req.params)
        if (!parseResult.success) {
            return res.redirect(backURL)
        }
        const idComentarioNum = parseResult.data.idComentario

        const nickUsuario = req.session!.user!.nickname

        await denunciaComentarioModel.create(nickUsuario, idComentarioNum)
        return res.redirect(backURL)
    }

    static async denunciarImagenView(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const parseResult = denunciarImagenViewParamsSchema.safeParse(req.params)
        if (!parseResult.success) {
            return res.redirect(backURL)
        }
        const idImagenNum = parseResult.data.idImagen

        const nickUsuario = req.session!.user!.nickname

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen) {
            return res.redirect(backURL)
        }

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        if (!publicacion || publicacion.nickUsuario === nickUsuario) {
            return res.redirect(backURL)
        }

        const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagenNum)
        const yaDenunciado = !!denunciaExistente

        const motivos = await denunciaImagenModel.getMotivos()

        return res.render('denunciar-imagen', {
            imagen,
            publicacion,
            motivos,
            yaDenunciado
        })
    }

    static async denunciarImagenPost(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const paramsResult = denunciarImagenPostParamsSchema.safeParse(req.params)
        if (!paramsResult.success) {
            return res.redirect(backURL)
        }

        const idImagenNum = paramsResult.data.idImagen
        const nickUsuario = req.session!.user!.nickname

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen) {
            return res.redirect(backURL)
        }

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        const motivos = await denunciaImagenModel.getMotivos()
        const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagenNum)
        const yaDenunciado = !!denunciaExistente

        const bodyResult = denunciarImagenPostBodySchema.safeParse(req.body)
        if (!bodyResult.success) {
            return res.render('denunciar-imagen', {
                error: "Datos invalidos",
                imagen,
                publicacion,
                motivos,
                yaDenunciado
            })
        }

        if (denunciaExistente) {
            return res.render('denunciar-imagen', {
                error: "Ya has denunciado esta imagen",
                imagen,
                publicacion,
                motivos,
                yaDenunciado: true
            })
        }

        const idMotivoNum = bodyResult.data.idMotivo
        const { descripcion } = bodyResult.data

        await denunciaImagenModel.create(nickUsuario, idImagenNum, idMotivoNum, descripcion)

        return res.redirect(`/publicacion/p/${imagen.idPublicacion}/${imagen.orden}`)
    }

    static async toggleFavorito(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const parseResult = toggleFavoritoParamsSchema.safeParse(req.params)
        if (!parseResult.success) {
            return res.redirect(backURL)
        }
        const idPublicacion = parseResult.data.id

        const nickUsuario = req.session!.user!.nickname

        const colecciones = await coleccionModel.getByUsuarioAndPublicacion(nickUsuario, idPublicacion)

        if (colecciones.length > 0) {
            await coleccionModel.deleteAllFromUsuarioAndPublicacion(nickUsuario, idPublicacion)
        } else {
            await coleccionModel.create(nickUsuario, 'Favoritos', idPublicacion)
        }

        return res.redirect(backURL)
    }

    static async setCopyrightImagen(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const paramsResult = setCopyrightImagenParamsSchema.safeParse(req.params)
        const bodyResult = setCopyrightImagenBodySchema.safeParse(req.body)

        if (!paramsResult.success || !bodyResult.success) {
            return res.redirect(backURL)
        }

        const idImagenNum = paramsResult.data.idImagen
        const { textoMarcaDeAgua } = bodyResult.data

        const nickUsuario = req.session!.user!.nickname

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen) {
            return res.redirect(backURL)
        }

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        if (!publicacion || publicacion.nickUsuario !== nickUsuario) {
            return res.redirect(backURL)
        }

        if (imagen.copyright) {
            return res.redirect(backURL)
        }

        try {
            const response = await fetch(imagen.url)
            if (!response.ok) {
                return res.redirect(backURL)
            }
            const arrayBuffer = await response.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const result: any = await subirACaudinaryConMarcaDeAgua(buffer, textoMarcaDeAgua)

            await imagenModel.updateUrlAndCopyright(idImagenNum, result.secure_url)
        } catch (error) {
            console.error(error)
            return res.redirect(backURL)
        }

        return res.redirect(`/publicacion/p/${imagen.idPublicacion}/${imagen.orden}`)
    }

    static async marcarInteres(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const parseResult = marcarInteresParamsSchema.safeParse(req.params)
        if (!parseResult.success) return res.redirect(backURL)
        const idImagenNum = parseResult.data.idImagen

        const nickUsuario = req.session!.user!.nickname

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen || !imagen.copyright) return res.redirect(backURL)

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        if (!publicacion || publicacion.nickUsuario === nickUsuario) return res.redirect(backURL)

        const interes = await interesModel.getByNicknames(nickUsuario, idImagenNum)
        if (interes) return res.redirect(backURL)

        await interesModel.create(nickUsuario, idImagenNum)

        await notificacionModel.create(nickUsuario, publicacion.nickUsuario, 'interes')

        let conversacion = await conversacionModel.getByUsers(nickUsuario, publicacion.nickUsuario)
        if (!conversacion) {
            conversacion = await conversacionModel.create(nickUsuario, publicacion.nickUsuario)
        }

        if (!conversacion) return res.redirect(backURL)
        await mensajeModel.create(
            conversacion.id,
            nickUsuario,
            `Hola! Me interesa adquirir una imagen con copyright de la publicación '${publicacion.titulo}'.`
        )

        return res.redirect(backURL)
    }
}