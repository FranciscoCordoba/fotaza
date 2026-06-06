import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { usuarioModel } from "../models/usuario.js";
import type { Request, Response } from "express";
import type { mensajeInsert, usuarioInsert, usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js";
import { mensajeModel } from "../models/mensaje.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export class usuarioController {

    static async allUsers(req: Request, res: Response) {
        const usuarios = await usuarioModel.getAll()
        return res.json(usuarios)
    }

    static async loginUsuarioView(req: Request, res: Response) {
        res.render('login')
    }

    static async loginUsuario(req: Request, res: Response) {

        const { nickname, password } = req.body

        const usuario = await usuarioModel.getByNickname(nickname)
        if (!usuario)
            throw new Error('Usuario no encontrado')

        const coincide = await bcrypt.compare(password, usuario.password)
        if (!coincide)
            throw new Error('Contraseña incorrecta')

        const token = jwt.sign({ nickname: usuario.nickname }, 'secretKey', {
            expiresIn: '1h'
        })

        res.cookie('token', token, {
            httpOnly: true,     // no se puede acceder desde javascript
            secure: true,       // solo se envia con https
            sameSite: 'strict'  // solo se envia en la misma pagina
        })

        return res.status(200).json({ message: 'Usuario logueado exitosamente' })
    }

    static async registrarUsuario(req: Request, res: Response) {
        const newUsuario: usuarioInsert = req.body

        const existe = await usuarioModel.getByNickname(newUsuario.nickname)
        if (existe)
            throw new Error('El usuario ya existe')

        const hash = await bcrypt.hash(newUsuario.password, 10)

        const resultado = await usuarioModel.create({ ...newUsuario, password: hash })

        if (!resultado)
            throw new Error('Error al crear usuario')

        return res.status(201).json(resultado)

    }

    static async cerrarSesion(req: Request, res: Response) {
        res.clearCookie('token')
        return res.status(200).json({ message: 'Usuario deslogueado exitosamente' })
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