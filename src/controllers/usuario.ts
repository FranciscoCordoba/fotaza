import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { usuarioModel } from "../models/usuario.js";
import type { Request, Response } from "express";
import type { mensajeInsert, usuarioInsert, usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js";
import { mensajeModel } from "../models/mensaje.js";
import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { notificacionModel } from "../models/notificacion.js";
import { coleccionModel } from "../models/coleccion.js";
import { z } from "zod";

const perfilUsuarioParamsSchema = z.object({
    nickname: z.string().min(1, 'Debe indicar un usuario')
});

const eliminarUsuarioBodySchema = z.object({
    id: z.string().min(1)
});

const usuarioSigueABodySchema = z.object({
    nickSeguido: z.string().min(1)
});

const seguirUsuarioBodySchema = z.object({
    nickSeguido: z.string().min(1)
});

const dejarSeguirUsuarioBodySchema = z.object({
    nickSeguido: z.string().min(1)
});

const listarSeguidoresBodySchema = z.object({
    id: z.string().min(1)
});

const crearColeccionBodySchema = z.object({
    nombreColeccion: z.string().trim().min(1, "Nombre de coleccion invalido"),
    publicaciones: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]).optional()
});

const verColeccionDetalleParamsSchema = z.object({
    nickColeccion: z.string().trim().min(1, "Coleccion no especificada")
});

const marcarNotificacionVistaParamsSchema = z.object({
    id: z.coerce.number()
});

export class usuarioController {

    static async allUsers(req: Request, res: Response) {
        const usuarios = await usuarioModel.getAll()
        return res.json(usuarios)
    }

    static async perfilUsuario(req: Request, res: Response) {
        const parseResult = perfilUsuarioParamsSchema.safeParse(req.params);

        if (!parseResult.success)
            throw new Error('Debe indicar un usuario')

        const { nickname } = parseResult.data;

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
        const parseResult = eliminarUsuarioBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: "ID de usuario inválido" });
        }
        const { id } = parseResult.data;

        const resultado = await usuarioModel.delete(id)

        return res.status(201).json(resultado)
    }

    //Tabla usuarioSigueA
    static async usuarioSigueA(req: Request, res: Response) {
        const parseResult = usuarioSigueABodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new Error('Debe indicar el usuario');
        }
        const { nickSeguido } = parseResult.data;
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
        const parseResult = seguirUsuarioBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new Error('Debe indicar el usuario');
        }
        const { nickSeguido } = parseResult.data;
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
        const parseResult = dejarSeguirUsuarioBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new Error('Debe indicar el usuario');
        }
        const { nickSeguido } = parseResult.data;
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
        const parseResult = listarSeguidoresBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new Error('Debe indicar el id');
        }
        const { id } = parseResult.data;
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

        const parseResult = crearColeccionBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new Error("Nombre de coleccion invalido");
        }

        const { nombreColeccion: nombre, publicaciones } = parseResult.data;

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

        const parseResult = verColeccionDetalleParamsSchema.safeParse(req.params);
        if (!parseResult.success) throw new Error("Coleccion no especificada");

        const { nickColeccion } = parseResult.data;

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

        const parseResult = marcarNotificacionVistaParamsSchema.safeParse(req.params);
        if (!parseResult.success) throw new Error("ID invalido");

        const idNum = parseResult.data.id;

        await notificacionModel.marcarComoVista(idNum, nickUsuario);

        const backURL = req.header('Referer') || '/usuario/notificaciones';
        return res.redirect(backURL);
    }
}