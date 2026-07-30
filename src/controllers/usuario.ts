import { usuarioSigueAModel } from "../models/usuarioSigueA.js"
import { usuarioModel } from "../models/usuario.js"
import type { Request, Response } from "express"
import type { mensajeInsert, usuarioInsert, usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js"
import { mensajeModel } from "../models/mensaje.js"
import { publicacionModel } from "../models/publicacion.js"
import { imagenModel } from "../models/imagen.js"
import { notificacionModel } from "../models/notificacion.js"
import { coleccionModel } from "../models/coleccion.js"
import {
    perfilUsuarioParamsSchema,
    eliminarUsuarioBodySchema,
    usuarioSigueABodySchema,
    seguirUsuarioBodySchema,
    dejarSeguirUsuarioBodySchema,
    listarSeguidoresBodySchema,
    crearColeccionBodySchema,
    verColeccionDetalleParamsSchema,
    marcarNotificacionVistaParamsSchema
} from "../utils/schemas.js"

export class usuarioController {

    static async allUsers(req: Request, res: Response) {
        const usuarios = await usuarioModel.getAll()
        return res.json(usuarios)
    }

    static async perfilUsuario(req: Request, res: Response) {
        const parseResult = perfilUsuarioParamsSchema.safeParse(req.params)

        if (!parseResult.success) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const { nickname } = parseResult.data

        const perfil = await usuarioModel.getByNickname(nickname)
        if (!perfil) {
            const backURL = req.header('Referer') || '/feed'
            return res.redirect(backURL)
        }

        const publicaciones = await publicacionModel.getByNickUsuario(nickname)
        const publicacionesConDatos = await Promise.all(publicaciones.map(async publicacion => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, 1)
            return {
                ...publicacion,
                imagen
            }
        }))

        const nickUsuarioLogueado = req.session!.user!.nickname
        let esPropio = false
        let siguiendo = false

        if (nickUsuarioLogueado === nickname) {
            esPropio = true
        } else {
            const follow = await usuarioSigueAModel.getByNicknames(nickUsuarioLogueado, nickname)
            if (follow) {
                siguiendo = true
            }
        }

        const seguidosArray = await usuarioSigueAModel.getAllSeguidos(nickname)
        const seguidoresArray = await usuarioSigueAModel.getAllSeguidores(nickname)
        
        const cantidadSeguidos = seguidosArray.length
        const cantidadSeguidores = seguidoresArray.length

        return res.render('perfil', {
            perfil,
            publicaciones: publicacionesConDatos,
            esPropio,
            siguiendo,
            nickUsuarioLogueado,
            cantidadSeguidos,
            cantidadSeguidores
        })
    }
    static async eliminarUsuario(req: Request, res: Response) {
        const parseResult = eliminarUsuarioBodySchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.status(400).json({ error: "ID de usuario inválido" })
        }
        const { id } = parseResult.data

        const resultado = await usuarioModel.delete(id)

        return res.status(201).json(resultado)
    }

    //Tabla usuarioSigueA
    static async usuarioSigueA(req: Request, res: Response) {
        const parseResult = usuarioSigueABodySchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.status(400).json({ error: "Debe indicar el usuario" })
        }
        const { nickSeguido } = parseResult.data
        const nickSeguidor = req.session?.user?.nickname

        if (!nickSeguidor) {
            return res.status(401).json({ error: "No se pudo obtener el nick del usuario" })
        }

        const siguiendo = await usuarioSigueAModel.getByNicknames(nickSeguidor, nickSeguido)
        if (siguiendo)
            return res.json({ siguiendo: true })
        else
            return res.json({ siguiendo: false })
    }

    static async seguirUsuario(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const parseResult = seguirUsuarioBodySchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.redirect(backURL)
        }
        const { nickSeguido } = parseResult.data
        const nickSeguidor = req.session!.user!.nickname

        const existe = await usuarioSigueAModel.getByNicknames(nickSeguidor, nickSeguido)
        if (existe) {
            return res.redirect(backURL)
        }

        await usuarioSigueAModel.create({
            nickSeguidor,
            nickSeguido
        })

        await notificacionModel.create(nickSeguidor, nickSeguido, 'seguir')

        return res.redirect(backURL)
    }

    static async dejarSeguirUsuario(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/feed'
        const parseResult = dejarSeguirUsuarioBodySchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.redirect(backURL)
        }
        const { nickSeguido } = parseResult.data
        const nickSeguidor = req.session!.user!.nickname

        const existe = await usuarioSigueAModel.getByNicknames(nickSeguidor, nickSeguido)
        if (!existe) {
            return res.redirect(backURL)
        }

        await usuarioSigueAModel.delete(nickSeguidor, nickSeguido)

        return res.redirect(backURL)
    }

    static async listarSeguidores(req: Request, res: Response) {
        const parseResult = listarSeguidoresBodySchema.safeParse(req.body)
        if (!parseResult.success) {
            return res.status(400).json({ error: "Debe indicar el id" })
        }
        const { id } = parseResult.data
        const info: usuarioSigueA[] = await usuarioSigueAModel.getAllSeguidores(id)
        return res.json(info)
    }

    static async verColeccionesView(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const coleccionesBasicas = await coleccionModel.getColeccionesConUltimaPublicacion(nickUsuario)

        const colecciones = await Promise.all(coleccionesBasicas.map(async (col) => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(col.idPublicacion, 1)
            return {
                ...col,
                imagen
            }
        }))

        return res.render('colecciones', { colecciones, nickUsuario })
    }

    static async nuevaColeccionView(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const favs = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, 'Favoritos')

        const publicacionesFav = await Promise.all(favs.map(async (fav) => {
            const publicacion = await publicacionModel.getById(fav.idPublicacion)
            const imagen = await imagenModel.getByIdPublicacionAndOrden(fav.idPublicacion, 1)
            return {
                ...publicacion,
                imagen
            }
        }))

        return res.render('nueva-coleccion', { publicacionesFav, nickUsuario })
    }

    static async crearColeccion(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const parseResult = crearColeccionBodySchema.safeParse(req.body)
        if (!parseResult.success) {
            const favs = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, 'Favoritos')

            const publicacionesFav = await Promise.all(favs.map(async (fav) => {
                const publicacion = await publicacionModel.getById(fav.idPublicacion)
                const imagen = await imagenModel.getByIdPublicacionAndOrden(fav.idPublicacion, 1)
                return {
                    ...publicacion,
                    imagen
                }
            }))

            return res.render('nueva-coleccion', { error: "Nombre de coleccion invalido", publicacionesFav, nickUsuario })
        }

        const { nombreColeccion: nombre, publicaciones } = parseResult.data

        const existentes = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, nombre)
        if (existentes.length > 0 || nombre === 'Favoritos') {
            const favs = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, 'Favoritos')
            const publicacionesFav = await Promise.all(favs.map(async (fav) => {
                const publicacion = await publicacionModel.getById(fav.idPublicacion)
                const imagen = await imagenModel.getByIdPublicacionAndOrden(fav.idPublicacion, 1)
                return { ...publicacion, imagen }
            }))
            return res.render('nueva-coleccion', { error: "La colección ya existe", publicacionesFav, nickUsuario })
        }

        let ids: number[] = []
        if (publicaciones) {
            if (Array.isArray(publicaciones)) {
                ids = publicaciones.map(p => Number(p))
            } else {
                ids = [Number(publicaciones)]
            }
        }

        const promesas = ids.map(idPub => {
            if (!isNaN(idPub)) {
                return coleccionModel.create(nickUsuario, nombre, idPub)
            }
        })

        await Promise.all(promesas)

        return res.redirect('/usuario/colecciones')
    }

    static async verColeccionDetalleView(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const parseResult = verColeccionDetalleParamsSchema.safeParse(req.params)
        if (!parseResult.success) {
            const backURL = req.header('Referer') || '/usuario/colecciones'
            return res.redirect(backURL)
        }

        const { nickColeccion } = parseResult.data

        const pubsEnColeccion = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, nickColeccion)

        const publicaciones = await Promise.all(pubsEnColeccion.map(async (col) => {
            const publicacion = await publicacionModel.getById(col.idPublicacion)
            const imagen = await imagenModel.getByIdPublicacionAndOrden(col.idPublicacion, 1)
            return {
                ...publicacion,
                imagen
            }
        }))

        let publicacionesFav: any[] = []
        if (nickColeccion !== 'Favoritos') {
            const favs = await coleccionModel.getPublicacionesEnColeccion(nickUsuario, 'Favoritos')
            const idsEnColeccion = new Set(pubsEnColeccion.map(p => p.idPublicacion))
            const favsDisponibles = favs.filter(f => !idsEnColeccion.has(f.idPublicacion))
            
            publicacionesFav = await Promise.all(favsDisponibles.map(async (fav) => {
                const publicacion = await publicacionModel.getById(fav.idPublicacion)
                const imagen = await imagenModel.getByIdPublicacionAndOrden(fav.idPublicacion, 1)
                return { ...publicacion, imagen }
            }))
        }

        return res.render('coleccion-detalle', { publicaciones, nickColeccion, nickUsuario, publicacionesFav })
    }

    static async agregarAColeccion(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname
        const nickColeccion = req.params.nickColeccion as string
        const { publicaciones } = req.body
        
        if (publicaciones && nickColeccion !== 'Favoritos') {
            let ids: number[] = []
            if (Array.isArray(publicaciones)) {
                ids = publicaciones.map(p => Number(p))
            } else {
                ids = [Number(publicaciones)]
            }

            const promesas = ids.map(idPub => {
                if (!isNaN(idPub)) {
                    return coleccionModel.create(nickUsuario, nickColeccion, idPub)
                }
            })
            await Promise.all(promesas)
        }
        return res.redirect(`/usuario/colecciones/${nickColeccion}`)
    }

    static async eliminarDeColeccion(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname
        const nickColeccion = req.params.nickColeccion as string
        const { idPublicacion } = req.body
        
        if (idPublicacion && nickColeccion !== 'Favoritos') {
            await coleccionModel.delete(nickUsuario, nickColeccion, Number(idPublicacion))
        }
        return res.redirect(`/usuario/colecciones/${nickColeccion}`)
    }

    static async verNotificacionesView(req: Request, res: Response) {
        const nickUsuario = req.session!.user!.nickname

        const notificaciones = await notificacionModel.getByNickname(nickUsuario)

        return res.render('notificaciones', { notificaciones, nickUsuario })
    }

    static async marcarNotificacionVista(req: Request, res: Response) {
        const backURL = req.header('Referer') || '/usuario/notificaciones'
        const nickUsuario = req.session!.user!.nickname

        const parseResult = marcarNotificacionVistaParamsSchema.safeParse(req.params)
        if (!parseResult.success) return res.redirect(backURL)

        const idNum = parseResult.data.id

        await notificacionModel.marcarComoVista(idNum, nickUsuario)

        return res.redirect(backURL)
    }
}