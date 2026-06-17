import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { usuarioModel } from "../models/usuario.js";
import type { Request, Response } from "express";
import type { mensajeInsert, usuarioInsert, usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js";
import { mensajeModel } from "../models/mensaje.js";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey'

export class usuarioController {

    static async allUsers(req: Request, res: Response) {
        const usuarios = await usuarioModel.getAll()
        return res.json(usuarios)
    }

    static async perfilUsuario(req: Request, res: Response) {
        const { nickname } = req.params;

        if (!nickname || nickname === '' || typeof nickname !== 'string')
            throw new Error('Debe indicar un usuario')

        const perfil = await usuarioModel.getByNickname(nickname);
        if (!perfil) {
            throw new Error('Usuario no encontrado');
        }

        const publicaciones = await publicacionModel.getByNickUsuario(nickname);
        const publicacionesConDatos = await Promise.all(publicaciones.map(async publicacion => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, 1)
            return {
                ...publicacion,
                imagen
            }
        }));

        const nickUsuarioLogueado = req.session?.user?.nickname;
        let esPropio = false;
        let siguiendo = false;

        if (nickUsuarioLogueado === nickname) {
            esPropio = true;
        } else if (nickUsuarioLogueado) {
            const follow = await usuarioSigueAModel.getByNicknames(nickUsuarioLogueado, nickname);
            if (follow) {
                siguiendo = true;
            }
        }

        return res.render('perfil', {
            perfil,
            publicaciones: publicacionesConDatos,
            esPropio,
            siguiendo,
            nickUsuarioLogueado
        });
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

        const token = jwt.sign({ nickname: usuario.nickname }, JWT_SECRET, {
            expiresIn: '1h'
        })

        const refreshToken = jwt.sign({ nickname: usuario.nickname }, JWT_SECRET, {
            expiresIn: '7d'
        })

        res.cookie('token', token, {
            httpOnly: true,     // no se puede acceder desde javascript
            secure: true,       // solo se envia con https
            sameSite: 'strict'  // solo se envia en la misma pagina
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })

        return res.redirect('/feed')
    }

    static async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.cookies

        if (!refreshToken)
            return res.status(401).json({ message: 'No hay refresh token' })

        try {
            const data: any = jwt.verify(refreshToken, JWT_SECRET)
            const token = jwt.sign({ nickname: data.nickname }, JWT_SECRET, {
                expiresIn: '1h'
            })

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            })

            return res.status(200).json({ message: 'Token refrescado' })
        } catch (error) {
            return res.status(403).json({ message: 'Refresh token invalido' })
        }
    }

    static async registroUsuarioView(req: Request, res: Response) {
        res.render('registro')
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

        return res.redirect('/auth/login')

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
    static async usuarioSigueA(req: Request, res: Response) {
        const { nickSeguido } = req.body
        const nickSeguidor = req.session?.user?.nickname

        if (!nickSeguidor)
            throw new Error('No se pudo obtener el nick del usuario')

        const siguiendo = await usuarioSigueAModel.getByNicknames(nickSeguidor, nickSeguido)
        if (siguiendo)
            return res.json({ siguiendo: true })
        else
            return res.json({ siguiendo: false })
    }

    static async seguirUsuario(req: Request, res: Response) {
        const { nickSeguido } = req.body
        const nickSeguidor = req.session?.user?.nickname

        if (!nickSeguidor)
            throw new Error('No se pudo obtener el nick del usuario')

        const existe = await usuarioSigueAModel.getByNicknames(nickSeguidor, nickSeguido)
        if (existe)
            throw new Error('Ya sigues a este usuario')

        const follow = await usuarioSigueAModel.create({
            nickSeguidor,
            nickSeguido
        })

        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async dejarSeguirUsuario(req: Request, res: Response) {
        const { nickSeguido } = req.body
        const nickSeguidor = req.session?.user?.nickname

        if (!nickSeguidor)
            throw new Error('No se pudo obtener el nick del usuario')

        const existe = await usuarioSigueAModel.getByNicknames(nickSeguidor, nickSeguido)
        if (!existe)
            throw new Error('No sigues a este usuario')

        const unfollow = await usuarioSigueAModel.delete(nickSeguidor, nickSeguido)

        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
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