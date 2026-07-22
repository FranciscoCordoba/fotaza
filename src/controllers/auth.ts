import type { Request, Response } from "express";
import { usuarioModel } from "../models/usuario.js";
import type { usuarioInsert } from "../utils/types.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secretKey';

export class authController {
    static async loginUsuarioView(req: Request, res: Response) {
        res.render('login');
    }

    static async loginUsuario(req: Request, res: Response) {
        const { nickname, password } = req.body;

        const usuario = await usuarioModel.getByNickname(nickname);
        if (!usuario)
            throw new Error('Usuario no encontrado');

        if (usuario.activo === false)
            throw new Error('El usuario ya no puede acceder por la cantidad de strikes recibidos');

        const coincide = await bcrypt.compare(password, usuario.password);
        if (!coincide)
            throw new Error('Contraseña incorrecta');

        const token = jwt.sign({ nickname: usuario.nickname }, JWT_SECRET, {
            expiresIn: '1h'
        });

        const refreshToken = jwt.sign({ nickname: usuario.nickname }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,     // no se puede acceder desde javascript
            secure: true,       // solo se envia con https
            sameSite: 'strict'  // solo se envia en la misma pagina
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return res.redirect('/feed');
    }

    static async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.cookies;

        if (!refreshToken)
            return res.status(401).json({ message: 'No hay refresh token' });

        try {
            const data: any = jwt.verify(refreshToken, JWT_SECRET);
            const token = jwt.sign({ nickname: data.nickname }, JWT_SECRET, {
                expiresIn: '1h'
            });

            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            return res.status(200).json({ message: 'Token refrescado' });
        } catch (error) {
            return res.status(403).json({ message: 'Refresh token invalido' });
        }
    }

    static async registroUsuarioView(req: Request, res: Response) {
        res.render('registro');
    }

    static async registrarUsuario(req: Request, res: Response) {
        const newUsuario: usuarioInsert = req.body;

        const existe = await usuarioModel.getByNickname(newUsuario.nickname);
        if (existe)
            throw new Error('El usuario ya existe');

        const hash = await bcrypt.hash(newUsuario.password, 10);

        const resultado = await usuarioModel.create({ ...newUsuario, password: hash });

        if (!resultado)
            throw new Error('Error al crear usuario');

        return res.redirect('/auth/login');
    }

    static async cerrarSesion(req: Request, res: Response) {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Usuario deslogueado exitosamente' });
    }
}
