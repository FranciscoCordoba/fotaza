import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { usuarioModel } from "../models/usuario.js";
import type { Request, Response } from "express";
import type { mensajeInsert, usuarioInsert, usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js";
import { mensajeModel } from "../models/mensaje.js";

export class usuarioController {

    static async loginUsuario(req: Request, res: Response) {


        const { nickname, password } = req.body

        const usuario = await usuarioModel.getByNickname(nickname)
        if (!usuario)
            return res.status(400).json({
                status: "Error",
                message: "Usuario no encontrado"
            })

        return res.status(200).json({ message: 'Usuario logueado exitosamente' })
    }

    static async crearUsuario(req: Request, res: Response) {
        const newUsuario: usuarioInsert = req.body

        const resultado = await usuarioModel.create(newUsuario)

        if (resultado)
            return res.status(201).json(resultado)


        return res.status(400).json({
            status: "Error",
            message: "Error al crear usuario"
        })
    }

    static async eliminarUsuario(req: Request, res: Response) {
        const { id } = req.body

        const resultado = await usuarioModel.delete(id)

        return res.status(201).json(resultado)
    }

    //Tabla usuarioSigueA
    static async seguirUsuario(req: Request, res: Response) {
        const info: usuarioSigueAInsert = req.body
        const follow = await usuarioSigueAModel.create(info)
        if (follow)
            return res.status(200).json({ solicitud: 'exitosa' })

        return res.status(500).json({ solicitud: 'fallida' })
    }

    static async dejarSeguirUsuario(req: Request, res: Response) {
        const { nickSeguidor, nickSeguido } = req.body
        return await usuarioSigueAModel.delete(nickSeguidor, nickSeguido)
    }

    static async listarSeguidores(req: Request, res: Response) {
        const { id } = req.body
        const info: usuarioSigueA[] = await usuarioSigueAModel.getAllSeguidores(id)
        return info
    }

    //Tabla mensaje
    static async enviarMensaje(req: Request, res: Response) {
        const mensaje: mensajeInsert = req.body
        const confirmado = await mensajeModel.create(mensaje)

        if (confirmado)
            return res.status(200).json({ solicitud: 'exitosa' })

        return res.status(500).json({ solicitud: 'fallida' })
    }

}