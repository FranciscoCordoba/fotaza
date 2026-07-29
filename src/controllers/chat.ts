import type { Request, Response } from "express";
import { conversacionModel } from "../models/conversacion.js";
import { mensajeModel } from "../models/mensaje.js";

export class chatController {
    static async listarChats(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const chats = await conversacionModel.getByUsuario(nickUsuario);
        return res.render('chats', { chats, nickUsuario });
    }

    static async verChat(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const idConversacion = Number(req.params.id);
        if (isNaN(idConversacion)) throw new Error("Chat no encontrado");

        const chat = await conversacionModel.getById(idConversacion);
        if (!chat) throw new Error("Chat no encontrado");

        if (chat.nickUsuario1 !== nickUsuario && chat.nickUsuario2 !== nickUsuario) {
            throw new Error("No tienes acceso a este chat");
        }

        const mensajes = await mensajeModel.getByConversacion(idConversacion);
        const otroUsuario = chat.nickUsuario1 === nickUsuario ? chat.nickUsuario2 : chat.nickUsuario1;

        return res.render('chat-detalle', { chat, mensajes, nickUsuario, otroUsuario });
    }

    static async enviarMensaje(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const idConversacion = Number(req.params.id);
        const { contenido } = req.body;

        if (isNaN(idConversacion) || !contenido || contenido.trim() === "") {
            throw new Error("Mensaje invalido");
        }

        const chat = await conversacionModel.getById(idConversacion);
        if (!chat || (chat.nickUsuario1 !== nickUsuario && chat.nickUsuario2 !== nickUsuario)) {
            throw new Error("No tienes acceso a este chat");
        }

        await mensajeModel.create(idConversacion, nickUsuario, contenido.trim());

        return res.redirect(`/chat/${idConversacion}`);
    }
}
