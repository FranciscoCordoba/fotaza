import type { Request, Response } from "express";
import { z } from "zod";
import { conversacionModel } from "../models/conversacion.js";
import { mensajeModel } from "../models/mensaje.js";

const sessionUserSchema = z.object({
    user: z.object({
        nickname: z.string({ message: "Usuario no logueado" }).min(1, "Usuario no logueado")
    }, { message: "Usuario no logueado" })
});

const verChatParamsSchema = z.object({
    id: z.coerce.number({ message: "Chat no encontrado" })
        .pipe(z.number().refine(val => !isNaN(val), { message: "Chat no encontrado" }))
});

const enviarMensajeParamsSchema = z.object({
    id: z.coerce.number({ message: "Mensaje invalido" })
        .pipe(z.number().refine(val => !isNaN(val), { message: "Mensaje invalido" }))
});

const enviarMensajeBodySchema = z.object({
    contenido: z.string({ message: "Mensaje invalido" })
        .transform(val => val.trim())
        .refine(val => val.length > 0, { message: "Mensaje invalido" })
});

function getNickUsuario(session: unknown): string {
    const parseResult = sessionUserSchema.safeParse(session);
    if (!parseResult.success) {
        throw new Error("Usuario no logueado");
    }
    return parseResult.data.user.nickname;
}

export class chatController {
    static async listarChats(req: Request, res: Response) {
        const nickUsuario = getNickUsuario(req.session);

        const chats = await conversacionModel.getByUsuario(nickUsuario);
        return res.render('chats', { chats, nickUsuario });
    }

    static async verChat(req: Request, res: Response) {
        const nickUsuario = getNickUsuario(req.session);

        const paramsResult = verChatParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            throw new Error(paramsResult.error.issues[0]?.message || "Chat no encontrado");
        }
        const idConversacion = paramsResult.data.id;

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
        const nickUsuario = getNickUsuario(req.session);

        const paramsResult = enviarMensajeParamsSchema.safeParse(req.params);
        const bodyResult = enviarMensajeBodySchema.safeParse(req.body);

        if (!paramsResult.success || !bodyResult.success) {
            throw new Error("Mensaje invalido");
        }

        const idConversacion = paramsResult.data.id;
        const contenido = bodyResult.data.contenido;

        const chat = await conversacionModel.getById(idConversacion);
        if (!chat || (chat.nickUsuario1 !== nickUsuario && chat.nickUsuario2 !== nickUsuario)) {
            throw new Error("No tienes acceso a este chat");
        }

        await mensajeModel.create(idConversacion, nickUsuario, contenido);

        return res.redirect(`/chat/${idConversacion}`);
    }
}

