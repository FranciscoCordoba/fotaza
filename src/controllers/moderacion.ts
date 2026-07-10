import type { Request, Response } from "express";
import { denunciaComentarioModel } from "../models/denunciaComentario.js";
import { comentarioModel } from "../models/comentario.js";

export class moderacionController {
    static async getDenuncias(req: Request, res: Response) {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }

        const nickname = req.session.user.nickname;

        try {
            const denuncias = await denunciaComentarioModel.getDenunciasPorAutorPublicacion(nickname);
            res.render('moderacion', { denuncias, user: req.session.user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener las denuncias');
        }
    }

    static async desestimar(req: Request, res: Response) {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }

        const { nickUsuario, idComentario } = req.body;

        try {
            await denunciaComentarioModel.delete(String(nickUsuario), Number(idComentario));
            res.redirect('/moderacion');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al desestimar la denuncia');
        }
    }

    static async eliminarComentario(req: Request, res: Response) {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }

        const { idComentario } = req.body;
        const nickname = req.session.user.nickname;

        try {
            // Borrar todas las denuncias del comentario
            await denunciaComentarioModel.deleteAllByComment(Number(idComentario));

            // Borrar el comentario
            await comentarioModel.delete(Number(idComentario));

            res.redirect('/moderacion');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al eliminar el comentario');
        }
    }
}
