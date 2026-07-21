import type { Request, Response } from "express";
import { denunciaComentarioModel } from "../models/denunciaComentario.js";
import { comentarioModel } from "../models/comentario.js";
import { usuarioModel } from "../models/usuario.js";
import { denunciaImagenModel } from "../models/denunciaImagen.js";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { notificacionModel } from "../models/notificacion.js";

export class moderacionController {
    static async getDenuncias(req: Request, res: Response) {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }

        const nickname = req.session.user.nickname;

        try {
            const usuario = await usuarioModel.getByNickname(nickname);
            const rol = usuario?.rol || 'usuario';

            const denuncias = await denunciaComentarioModel.getDenunciasPorAutorPublicacion(nickname);
            
            let denunciasImagen: any[] = [];
            if (rol === 'moderador' || rol === 'admin') {
                denunciasImagen = await denunciaImagenModel.getAllWithDetails();
            }

            res.render('moderacion', { denuncias, denunciasImagen, rol, user: req.session.user });
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

    static async actualizarEstadoDenunciaImagen(req: Request, res: Response) {
        if (!req.session?.user) {
            return res.redirect('/auth/login');
        }

        const nickname = req.session.user.nickname;

        try {
            const usuario = await usuarioModel.getByNickname(nickname);
            if (usuario?.rol !== 'moderador' && usuario?.rol !== 'admin') {
                return res.status(403).send('No tienes permisos para realizar esta acción');
            }

            const { nickUsuario, idImagen, estado } = req.body;
            
            if (!['pendiente', 'aceptada', 'rechazada'].includes(estado)) {
                 return res.status(400).send('Estado inválido');
            }

            const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(String(nickUsuario), Number(idImagen));
            if (!denunciaExistente) {
                return res.status(404).send('Denuncia no encontrada');
            }

            if (denunciaExistente.estado !== 'pendiente') {
                return res.status(400).send('La denuncia ya fue procesada y su estado no puede ser modificado');
            }

            await denunciaImagenModel.updateEstado(String(nickUsuario), Number(idImagen), estado as 'pendiente'|'aceptada'|'rechazada');

            if (estado === 'aceptada') {
                const imagen = await imagenModel.getById(Number(idImagen));
                if (imagen) {
                    const publicacion = await publicacionModel.getById(imagen.idPublicacion);
                    if (publicacion) {
                        const autorNick = publicacion.nickUsuario;
                        
                        // Eliminar la publicación completa
                        await publicacionModel.deleteCompleta(publicacion.id);

                        // Sumar strike
                        await usuarioModel.sumarStrike(autorNick);

                        // Enviar notificación al autor
                        // Obtenemos el motivo
                        const motivos = await denunciaImagenModel.getMotivos();
                        const motivoObj = motivos.find(m => m.id === denunciaExistente.idMotivo);
                        const motivoTexto = motivoObj ? motivoObj.motivo : 'Inapropiado';
                        
                        await notificacionModel.create(
                            String(nickUsuario), // usuario que denuncia
                            autorNick, // usuario que recibe (autor de la publicación)
                            `strike: ${motivoTexto}`
                        );
                    }
                }
            }

            res.redirect('/moderacion');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al actualizar el estado de la denuncia');
        }
    }
}
