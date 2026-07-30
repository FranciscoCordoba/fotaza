import { publicacionModel } from "../models/publicacion.js";
import { imagenModel } from "../models/imagen.js";
import { etiquetaModel } from "../models/etiqueta.js";
import { valoracionModel } from "../models/valoracion.js";
import { comentarioModel } from "../models/comentario.js";
import { usuarioSigueAModel } from "../models/usuarioSigueA.js";
import { comunidadModel } from "../models/comunidad.js";
import type { Request, Response } from "express";
import type { publicacion } from "../utils/types.js";
import { subirACaudinary, subirACaudinaryConMarcaDeAgua } from "../utils/cloudinary.js";
import { usuarioSigueComunidadModel } from "../models/usuarioSigueComunidad.js";
import { publicacionEnComunidadModel } from "../models/publicacionEnComunidad.js";
import { denunciaComentarioModel } from "../models/denunciaComentario.js";
import { denunciaImagenModel } from "../models/denunciaImagen.js";
import { coleccionModel } from "../models/coleccion.js";
import { notificacionModel } from "../models/notificacion.js";
import { interesModel } from "../models/interes.js";
import { mensajeModel } from "../models/mensaje.js";
import { conversacionModel } from "../models/conversacion.js";
import { z } from "zod";

const getPublicacionByIdParamsSchema = z.object({
    id: z.coerce.number({ message: "ID invalido" })
});

const getPublicacionByIdViewParamsSchema = z.object({
    id: z.coerce.number({ message: "ID invalido" }),
    orden: z.coerce.number({ message: "Orden invalido" })
});

const valorarImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
});
const valorarImagenBodySchema = z.object({
    puntaje: z.coerce.number().min(1).max(5)
});

const comentarImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
});
const comentarImagenBodySchema = z.object({
    texto: z.string().trim().min(1)
});

const buscarPublicacionesQuerySchema = z.object({
    busqueda: z.string().min(1)
});

const crearPublicacionBodySchema = z.object({
    titulo: z.string().min(1),
    descripcion: z.string().optional(),
    etiquetas: z.string().optional(),
    comunidades: z.union([z.string(), z.array(z.string())]).optional()
});

const toggleComentariosImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
});

const denunciarComentarioParamsSchema = z.object({
    idComentario: z.coerce.number()
});

const denunciarImagenViewParamsSchema = z.object({
    idImagen: z.coerce.number()
});

const denunciarImagenPostParamsSchema = z.object({
    idImagen: z.coerce.number()
});
const denunciarImagenPostBodySchema = z.object({
    idMotivo: z.coerce.number(),
    descripcion: z.string().optional()
});

const toggleFavoritoParamsSchema = z.object({
    id: z.coerce.number()
});

const setCopyrightImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
});
const setCopyrightImagenBodySchema = z.object({
    textoMarcaDeAgua: z.string().trim().min(1)
});

const marcarInteresParamsSchema = z.object({
    idImagen: z.coerce.number()
});

export class publicacionController {
    static async getPublicacionById(req: Request, res: Response) {
        const parseResult = getPublicacionByIdParamsSchema.safeParse(req.params);
        if (!parseResult.success) {
            throw new Error("ID invalido");
        }
        const { id: idNumero } = parseResult.data;

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion)
            throw new Error("Publicacion no encontrada")
        return res.json(publicacion)
    }

    static async getPublicacionByIdView(req: Request, res: Response) {
        const parseResult = getPublicacionByIdViewParamsSchema.safeParse(req.params);
        if (!parseResult.success) {
            const firstError = parseResult.error.issues[0]?.message;
            throw new Error(firstError || "ID invalido");
        }
        const { id: idNumero, orden: ordenNumero } = parseResult.data;

        const publicacion = await publicacionModel.getById(idNumero)
        if (!publicacion)
            throw new Error("Publicacion no encontrada")

        const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, ordenNumero)
        const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)
        const { prev, post } = await imagenModel.getPrevYPost(publicacion.id, ordenNumero)

        const nickUsuario = req.session?.user?.nickname
        let siguiendo = false
        if (nickUsuario && nickUsuario != publicacion.nickUsuario) {
            const resultado = await usuarioSigueAModel.getByNicknames(nickUsuario, publicacion.nickUsuario)
            if (resultado)
                siguiendo = true
        }

        if (!imagen) {
            throw new Error("Imagen no encontrada")
        }
        const statsValoracion = await valoracionModel.getStatsByImage(imagen.id)
        const comentarios = await comentarioModel.getAllByImage(imagen.id)

        let enFavoritos = false;
        if (nickUsuario) {
            const colecciones = await coleccionModel.getByUsuarioAndPublicacion(nickUsuario, publicacion.id);
            if (colecciones.length > 0) {
                enFavoritos = true;
            }
        }

        let yaInteresado = false;
        if (nickUsuario && nickUsuario != publicacion.nickUsuario && imagen.copyright) {
            const interes = await interesModel.getByNicknames(nickUsuario, imagen.id);
            if (interes) {
                yaInteresado = true;
            }
        }

        return res.render('publicacion', { publicacion, imagen, etiquetas, prev, post, statsValoracion, comentarios, siguiendo, nickUsuario, enFavoritos, yaInteresado })
    }

    static async valorarImagen(req: Request, res: Response) {
        const paramsResult = valorarImagenParamsSchema.safeParse(req.params);
        const bodyResult = valorarImagenBodySchema.safeParse(req.body);

        if (!paramsResult.success || !bodyResult.success) {
            throw new Error("Datos de valoracion invalidos");
        }

        const idImagenNum = paramsResult.data.idImagen;
        const puntajeNum = bodyResult.data.puntaje;

        const nickUsuario = req.session?.user?.nickname

        await valoracionModel.create(nickUsuario!, idImagenNum, puntajeNum)

        const imagen = await imagenModel.getById(idImagenNum);
        if (imagen) {
            const publicacion = await publicacionModel.getById(imagen.idPublicacion);
            if (publicacion && publicacion.nickUsuario !== nickUsuario) {
                await notificacionModel.create(nickUsuario!, publicacion.nickUsuario, 'valoracion');
            }
        }

        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async comentarImagen(req: Request, res: Response) {
        const paramsResult = comentarImagenParamsSchema.safeParse(req.params);
        const bodyResult = comentarImagenBodySchema.safeParse(req.body);

        if (!paramsResult.success || !bodyResult.success) {
            throw new Error("Datos de comentario invalidos");
        }

        const idImagenNum = paramsResult.data.idImagen;
        const { texto } = bodyResult.data;

        const nickUsuario = req.session?.user?.nickname

        await comentarioModel.create(nickUsuario!, idImagenNum, texto)

        const imagen = await imagenModel.getById(idImagenNum);
        if (imagen) {
            const publicacion = await publicacionModel.getById(imagen.idPublicacion);
            if (publicacion && publicacion.nickUsuario !== nickUsuario) {
                await notificacionModel.create(nickUsuario!, publicacion.nickUsuario, 'comentario');
            }
        }

        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async buscarPublicacionesView(req: Request, res: Response) {
        const parseResult = buscarPublicacionesQuerySchema.safeParse(req.query);

        if (!parseResult.success) {
            throw new Error("Busqueda invalida");
        }

        const { busqueda } = parseResult.data;

        const publicaciones = await publicacionModel.getByTitulo(busqueda)
        const comunidades = await comunidadModel.search(busqueda)

        const publicacionesConDatos = await Promise.all(publicaciones.map(async publicacion => {
            const imagen = await imagenModel.getByIdPublicacionAndOrden(publicacion.id, 1)
            const etiquetas = await etiquetaModel.getByIdPublicacion(publicacion.id)
            return {
                ...publicacion,
                imagen,
                etiquetas
            }
        }))

        return res.render('explorador', { publicacionesConDatos, comunidades })
    }

    static async crearPublicacionView(req: Request, res: Response) {
        const nickUsuario = req.session?.user?.nickname
        let comunidadesSigue: any[] = []
        if (nickUsuario) {
            comunidadesSigue = await usuarioSigueComunidadModel.getByNickname(nickUsuario)
        }
        return res.render('nueva-publicacion', { comunidadesSigue })
    }

    static async crearPublicacion(req: Request, res: Response) {
        const parseResult = crearPublicacionBodySchema.safeParse(req.body);
        if (!parseResult.success) {
            throw new Error("Error al crear publicacion");
        }
        const { titulo, descripcion, etiquetas, comunidades } = parseResult.data;
        const nickUsuario = req.session?.user?.nickname

        if (!nickUsuario)
            throw new Error("Usuario no logueado")

        const resultado = await publicacionModel.create(nickUsuario, titulo, descripcion || "")

        if (!resultado)
            throw new Error("Error al crear publicacion")

        const idPublicacion: number = resultado[0]!.id

        const files = req.files as Express.Multer.File[]
        if (!files || files.length === 0)
            throw new Error("Debe subir al menos una imagen")

        const uploadPromises = files.map(async (file) => {
            const result = (await subirACaudinary(file.buffer)) as any
            return result.secure_url
        })
        const urls = await Promise.all(uploadPromises)

        const saveImagePromises = urls.map((url, index) => imagenModel.create(idPublicacion, url, index + 1, false))
        await Promise.all(saveImagePromises)

        if (etiquetas && typeof etiquetas === 'string') {
            const listaEtiquetas = etiquetas
                .split(/\s+/)
                .filter(tag => tag.startsWith('#'))
                .map(tag => tag.slice(1).trim())
                .filter(tag => tag.length > 0)

            if (listaEtiquetas.length > 0) {
                const saveTagPromises = listaEtiquetas.map(tag => etiquetaModel.create(idPublicacion, tag))
                await Promise.all(saveTagPromises)
            }
        }

        if (comunidades) {
            const listaComunidades = Array.isArray(comunidades) ? comunidades : [comunidades]
            const saveComunidadesPromises = listaComunidades.map(nickComunidad =>
                publicacionEnComunidadModel.create(nickComunidad, idPublicacion)
            )
            await Promise.all(saveComunidadesPromises)
        }

        return res.redirect(`/publicacion/p/${idPublicacion}/1`)
    }

    static async toggleComentariosImagen(req: Request, res: Response) {
        const paramsResult = toggleComentariosImagenParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            throw new Error("Datos invalidos")
        }
        const idImagenNum = paramsResult.data.idImagen;
        const { comentariosActivos } = req.body;

        const imagen = await imagenModel.getById(idImagenNum)
        if (!imagen) throw new Error("Imagen no encontrada")

        const publicacion = await publicacionModel.getById(imagen.idPublicacion)
        const nickUsuario = req.session?.user?.nickname

        if (publicacion?.nickUsuario !== nickUsuario) {
            throw new Error("No tienes permiso")
        }

        await imagenModel.toggleComentariosActivos(idImagenNum, comentariosActivos === 'true' || comentariosActivos === true)
        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async denunciarComentario(req: Request, res: Response) {
        const parseResult = denunciarComentarioParamsSchema.safeParse(req.params);
        if (!parseResult.success) {
            throw new Error("Datos invalidos")
        }
        const idComentarioNum = parseResult.data.idComentario;

        const nickUsuario = req.session?.user?.nickname
        if (!nickUsuario) {
            throw new Error("Usuario no logueado")
        }

        await denunciaComentarioModel.create(nickUsuario, idComentarioNum)
        const backURL = req.header('Referer') || '/feed'
        return res.redirect(backURL)
    }

    static async denunciarImagenView(req: Request, res: Response) {
        const parseResult = denunciarImagenViewParamsSchema.safeParse(req.params);
        if (!parseResult.success) throw new Error("Datos invalidos");
        const idImagenNum = parseResult.data.idImagen;

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const imagen = await imagenModel.getById(idImagenNum);
        if (!imagen) throw new Error("Imagen no encontrada");

        const publicacion = await publicacionModel.getById(imagen.idPublicacion);
        if (publicacion?.nickUsuario === nickUsuario) {
            throw new Error("No puedes denunciar tu propia imagen");
        }

        const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagenNum);
        const yaDenunciado = !!denunciaExistente;

        const motivos = await denunciaImagenModel.getMotivos();

        return res.render('denunciar-imagen', {
            imagen,
            publicacion,
            motivos,
            yaDenunciado
        });
    }

    static async denunciarImagenPost(req: Request, res: Response) {
        const paramsResult = denunciarImagenPostParamsSchema.safeParse(req.params);
        const bodyResult = denunciarImagenPostBodySchema.safeParse(req.body);

        if (!paramsResult.success || !bodyResult.success) {
            throw new Error("Datos invalidos");
        }

        const idImagenNum = paramsResult.data.idImagen;
        const idMotivoNum = bodyResult.data.idMotivo;
        const { descripcion } = bodyResult.data;

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const imagen = await imagenModel.getById(idImagenNum);
        if (!imagen) throw new Error("Imagen no encontrada");

        const denunciaExistente = await denunciaImagenModel.getByUsuarioAndImagen(nickUsuario, idImagenNum);
        if (denunciaExistente) {
            throw new Error("Ya has denunciado esta imagen");
        }

        await denunciaImagenModel.create(nickUsuario, idImagenNum, idMotivoNum, descripcion);

        return res.redirect(`/publicacion/p/${imagen.idPublicacion}/${imagen.orden}`);
    }

    static async toggleFavorito(req: Request, res: Response) {
        const parseResult = toggleFavoritoParamsSchema.safeParse(req.params);
        if (!parseResult.success) throw new Error("Datos invalidos");
        const idPublicacion = parseResult.data.id;

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const colecciones = await coleccionModel.getByUsuarioAndPublicacion(nickUsuario, idPublicacion);

        if (colecciones.length > 0) {
            await coleccionModel.deleteAllFromUsuarioAndPublicacion(nickUsuario, idPublicacion);
        } else {
            await coleccionModel.create(nickUsuario, 'Favoritos', idPublicacion);
        }

        const backURL = req.header('Referer') || '/feed';
        return res.redirect(backURL);
    }

    static async setCopyrightImagen(req: Request, res: Response) {
        const paramsResult = setCopyrightImagenParamsSchema.safeParse(req.params);
        const bodyResult = setCopyrightImagenBodySchema.safeParse(req.body);

        if (!paramsResult.success || !bodyResult.success) {
            throw new Error("Datos invalidos");
        }

        const idImagenNum = paramsResult.data.idImagen;
        const { textoMarcaDeAgua } = bodyResult.data;

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const imagen = await imagenModel.getById(idImagenNum);
        if (!imagen) throw new Error("Imagen no encontrada");

        const publicacion = await publicacionModel.getById(imagen.idPublicacion);
        if (!publicacion || publicacion.nickUsuario !== nickUsuario) {
            throw new Error("No tienes permiso");
        }

        if (imagen.copyright) {
            throw new Error("La imagen ya tiene copyright");
        }

        const response = await fetch(imagen.url);
        if (!response.ok) throw new Error("Error al descargar imagen desde Cloudinary");
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result: any = await subirACaudinaryConMarcaDeAgua(buffer, textoMarcaDeAgua);

        await imagenModel.updateUrlAndCopyright(idImagenNum, result.secure_url);

        return res.redirect(`/publicacion/p/${imagen.idPublicacion}/${imagen.orden}`);
    }

    static async marcarInteres(req: Request, res: Response) {
        const parseResult = marcarInteresParamsSchema.safeParse(req.params);
        if (!parseResult.success) throw new Error("Datos invalidos");
        const idImagenNum = parseResult.data.idImagen;

        const nickUsuario = req.session?.user?.nickname;
        if (!nickUsuario) throw new Error("Usuario no logueado");

        const imagen = await imagenModel.getById(idImagenNum);
        if (!imagen) throw new Error("Imagen no encontrada");
        if (!imagen.copyright) throw new Error("La imagen no tiene copyright");

        const publicacion = await publicacionModel.getById(imagen.idPublicacion);
        if (!publicacion) throw new Error("Publicacion no encontrada");

        if (publicacion.nickUsuario === nickUsuario) {
            throw new Error("No puedes mostrar interes en tu propia imagen");
        }

        const interes = await interesModel.getByNicknames(nickUsuario, idImagenNum);
        if (interes) {
            throw new Error("Ya mostraste interes");
        }

        await interesModel.create(nickUsuario, idImagenNum);

        await notificacionModel.create(nickUsuario, publicacion.nickUsuario, 'interes');

        let conversacion = await conversacionModel.getByUsers(nickUsuario, publicacion.nickUsuario);
        if (!conversacion) {
            conversacion = await conversacionModel.create(nickUsuario, publicacion.nickUsuario);
        }

        if (!conversacion) throw new Error("Error al crear conversacion");
        await mensajeModel.create(
            conversacion.id,
            nickUsuario,
            `¡Hola! Me interesa adquirir tu imagen con copyright (ID: ${imagen.id}) de la publicación '${publicacion.titulo}'.`
        );

        const backURL = req.header('Referer') || `/publicacion/p/${publicacion.id}/${imagen.orden}`;
        return res.redirect(backURL);
    }
}