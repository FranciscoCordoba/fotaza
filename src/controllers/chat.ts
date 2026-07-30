import type { Request, Response } from "express"
import { verChatParamsSchema, enviarMensajeParamsSchema, enviarMensajeBodySchema } from "../utils/schemas.js"
import { conversacionModel } from "../models/conversacion.js"
import { mensajeModel } from "../models/mensaje.js"

export class chatController {
    static async listarChats(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const chats = await conversacionModel.getByUsuario(nickUsuario)
        return res.render('chats', { chats, nickUsuario })
    }

    static async verChat(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const paramsResult = verChatParamsSchema.safeParse(req.params)
        if (!paramsResult.success) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }
        const idConversacion = paramsResult.data.id

        const chat = await conversacionModel.getById(idConversacion)
        if (!chat) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        if (chat.nickUsuario1 !== nickUsuario && chat.nickUsuario2 !== nickUsuario) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const mensajes = await mensajeModel.getByConversacion(idConversacion)
        const otroUsuario = chat.nickUsuario1 === nickUsuario ? chat.nickUsuario2 : chat.nickUsuario1

        return res.render('chat-detalle', { chat, mensajes, nickUsuario, otroUsuario })
    }

    static async enviarMensaje(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const paramsResult = enviarMensajeParamsSchema.safeParse(req.params)
        const bodyResult = enviarMensajeBodySchema.safeParse(req.body)

        if (!paramsResult.success || !bodyResult.success) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const idConversacion = paramsResult.data.id
        const contenido = bodyResult.data.contenido

        const chat = await conversacionModel.getById(idConversacion)
        if (!chat || (chat.nickUsuario1 !== nickUsuario && chat.nickUsuario2 !== nickUsuario)) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        await mensajeModel.create(idConversacion, nickUsuario, contenido)

        return res.redirect(`/chat/${idConversacion}`)
    }
}

