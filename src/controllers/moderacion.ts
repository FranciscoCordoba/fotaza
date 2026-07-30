import type { Request, Response } from "express"
import { desestimarSchema, eliminarComentarioSchema, actualizarEstadoDenunciaImagenSchema } from "../utils/schemas.js"
import { denunciaComentarioModel } from "../models/denunciaComentario.js"
import { comentarioModel } from "../models/comentario.js"
import { usuarioModel } from "../models/usuario.js"
import { denunciaImagenModel } from "../models/denunciaImagen.js"
import { publicacionModel } from "../models/publicacion.js"
import { imagenModel } from "../models/imagen.js"
import { notificacionModel } from "../models/notificacion.js"

export class moderacionController {
    static async getDenuncias(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        try {
            const usuario = await usuarioModel.getByNickname(nickUsuario)
            const rol = usuario?.rol || 'usuario'

            const denuncias = await denunciaComentarioModel.getDenunciasPorAutorPublicacion(nickUsuario)

            let denunciasImagen: any[] = []
            if (rol === 'moderador' || rol === 'admin') {
                denunciasImagen = await denunciaImagenModel.getAllWithDetails()
            }

            res.render('moderacion', { denuncias, denunciasImagen, rol, user: req.session!.user })
        } catch (error) {
            console.error(error)
            res.status(500).send('Error al obtener las denuncias')
        }
    }

    static async desestimar(req: Request, res: Response) {
        const parseResult = desestimarSchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.status(400).send('Datos inválidos')
        }

        const { nickUsuario, idComentario } = parseResult.data

        try {
            await denunciaComentarioModel.delete(nickUsuario, idComentario)
            res.redirect('/moderacion')
        } catch (error) {
            console.error(error)
            res.status(500).send('Error al desestimar la denuncia')
        }
    }

    static async eliminarComentario(req: Request, res: Response) {
        const parseResult = eliminarComentarioSchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.status(400).send('Datos inválidos')
        }

        const { idComentario } = parseResult.data

        try {
            // Borrar todas las denuncias del comentario
            await denunciaComentarioModel.deleteAllByComment(idComentario)

            // Borrar el comentario
            await comentarioModel.delete(idComentario)

            res.redirect('/moderacion')
        } catch (error) {
            console.error(error)
            res.status(500).send('Error al eliminar el comentario')
        }
    }

    static async actualizarEstadoDenunciaImagen(req: Request, res: Response) {
        const nickname = req.session!.user!.nickname

        try {
            const usuario = await usuarioModel.getByNickname(nickname)
            if (usuario?.rol !== 'moderador' && usuario?.rol !== 'admin') {
                return res.status(403).send('No tienes permisos para realizar esta acción')
            }

            const parseResult = actualizarEstadoDenunciaImagenSchema.safeParse(req.body)
            if (!parseResult.success) {
                return res.status(400).send('Estado inválido')
            }

            const { nickUsuario, idImagen, estado } = parseResult.data

            const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagen)
            if (!denunciaExistente) {
                return res.status(404).send('Denuncia no encontrada')
            }

            if (denunciaExistente.estado !== 'pendiente') {
                return res.status(400).send('La denuncia ya fue procesada y su estado no puede ser modificado')
            }

            await denunciaImagenModel.updateEstado(nickUsuario, idImagen, estado)

            if (estado === 'aceptada') {
                const imagen = await imagenModel.getById(idImagen)
                if (imagen) {
                    const publicacion = await publicacionModel.getById(imagen.idPublicacion)
                    if (publicacion) {
                        const autorNick = publicacion.nickUsuario

                        // Eliminar la publicación completa
                        await publicacionModel.deleteCompleta(publicacion.id)

                        // Sumar strike
                        const strikes = await usuarioModel.sumarStrike(autorNick)

                        // Enviar notificación al autor
                        // Obtenemos el motivo
                        const motivos = await denunciaImagenModel.getMotivos()
                        const motivoObj = motivos.find(m => m.id === denunciaExistente.idMotivo)
                        const motivoTexto = motivoObj ? motivoObj.motivo : 'Inapropiado'

                        await notificacionModel.create(
                            nickUsuario, // usuario que denuncia
                            autorNick, // usuario que recibe (autor de la publicación)
                            `strike: ${motivoTexto}`
                        )

                        if (strikes && strikes === 3) {
                            await usuarioModel.desactivar(autorNick)
                        }
                    }
                }
            }

            res.redirect('/moderacion')
        } catch (error) {
            console.error(error)
            res.status(500).send('Error al actualizar el estado de la denuncia')
        }
    }
}
