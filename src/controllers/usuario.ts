import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { usuarioModel } from "../models/usuario.js";
import type { Request, Response } from "express";
import type { mensajeInsert, usuarioInsert, usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js";
import { mensajeModel } from "../models/mensaje.js";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { notificacionModel } from "../models/notificacion.js";
import { coleccionModel } from "../models/coleccion.js";

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

        const seguidosArray = await usuarioSigueAModel.getAllSeguidos(nickname);
        const seguidoresArray = await usuarioSigueAModel.getAllSeguidores(nickname);
        
        const cantidadSeguidos = seguidosArray.length;
        const cantidadSeguidores = seguidoresArray.length;

        return res.render('perfil', {
            perfil,
            publicaciones: publicacionesConDatos,
            esPropio,
            siguiendo,
            nickUsuarioLogueado,
            cantidadSeguidos,
            cantidadSeguidores
        });
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

        await notificacionModel.create(nickSeguidor, nickSeguido, 'seguir');

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

    static async verColeccionesView(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const coleccionesBasicas = await coleccionModel.getColeccionesConUltimaPublicacion(nickUsuario);

        const colecciones = await Promise.all(coleccionesBasicas.map(async (col) => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(col.idPublicacion, 1);
            return {
                ...col,
                imagen
            }
        }));

        return res.render('colecciones', { colecciones, nickUsuario });
    }

    static async nuevaColeccionView(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const favs = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, 'Favoritos');

        const publicacionesFav = await Promise.all(favs.map(async (fav) => {
            const publicacion = await publicacionModel.getById(fav.idPublicacion);
            const imagen = await imagenModel.getByIdPublicacionAndOrden(fav.idPublicacion, 1);
            return {
                ...publicacion,
                imagen
            }
        }));

        return res.render('nueva-coleccion', { publicacionesFav, nickUsuario });
    }

    static async crearColeccion(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const { nombreColeccion, publicaciones } = req.body;
        if (!nombreColeccion || typeof nombreColeccion !== 'string' || nombreColeccion.trim() === '') {
            throw new Error("Nombre de coleccion invalido");
        }

        const nombre = nombreColeccion.trim();

        let ids: number[] = [];
        if (publicaciones) {
            if (Array.isArray(publicaciones)) {
                ids = publicaciones.map(p => Number(p));
            } else {
                ids = [Number(publicaciones)];
            }
        }

        const promesas = ids.map(idPub => {
            if (!isNaN(idPub)) {
                return coleccionModel.create(nickUsuario, nombre, idPub);
            }
        });

        await Promise.all(promesas);

        return res.redirect('/usuario/colecciones');
    }

    static async verColeccionDetalleView(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const { nickColeccion } = req.params;
        if (!nickColeccion || typeof nickColeccion !== 'string' || nickColeccion.trim() === '') throw new Error("Coleccion no especificada");

        const pubsEnColeccion = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, nickColeccion);

        const publicaciones = await Promise.all(pubsEnColeccion.map(async (col) => {
            const publicacion = await publicacionModel.getById(col.idPublicacion);
            const imagen = await imagenModel.getByIdPublicacionAndOrden(col.idPublicacion, 1);
            return {
                ...publicacion,
                imagen
            }
        }));

        return res.render('coleccion-detalle', { publicaciones, nickColeccion, nickUsuario });
    }

    static async verNotificacionesView(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const notificaciones = await notificacionModel.getByNickname(nickUsuario);

        return res.render('notificaciones', { notificaciones, nickUsuario });
    }

    static async marcarNotificacionVista(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const { id } = req.params;
        const idNum = Number(id);
        if (isNaN(idNum)) throw new Error("ID invalido");

        await notificacionModel.marcarComoVista(idNum, nickUsuario);

        const backURL = req.header('Referer') || '/usuario/notificaciones';
        return res.redirect(backURL);
    }
}