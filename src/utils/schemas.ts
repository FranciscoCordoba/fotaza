import { z } from "zod";

// auth.ts
export const loginSchema = z.object({
    nickname: z.string({ message: 'Nickname es requerido' }).min(1, 'Nickname es requerido'),
    password: z.string({ message: 'Contraseña es requerida' }).min(1, 'Contraseña es requerida')
})

export const refreshTokenCookieSchema = z.object({
    refreshToken: z.string({ message: 'No hay refresh token' }).min(1, 'No hay refresh token')
})

export const registrarUsuarioSchema = z.object({
    nickname: z.string({ message: 'Nickname es requerido' }).min(1, 'Nickname es requerido'),
    correo: z.string({ message: 'Correo es requerido' }).min(1, 'Correo es requerido'),
    nombre: z.string({ message: 'Nombre es requerido' }).min(1, 'Nombre es requerido'),
    password: z.string({ message: 'Contraseña es requerida' }).min(1, 'Contraseña es requerida'),
    rol: z.enum(['usuario', 'moderador', 'admin']).optional(),
    activo: z.boolean().optional(),
    strikes: z.number().optional()
})

// chat.ts
export const verChatParamsSchema = z.object({
    id: z.coerce.number({ message: "Chat no encontrado" })
        .pipe(z.number().refine(val => !isNaN(val), { message: "Chat no encontrado" }))
})

export const enviarMensajeParamsSchema = z.object({
    id: z.coerce.number({ message: "Mensaje invalido" })
        .pipe(z.number().refine(val => !isNaN(val), { message: "Mensaje invalido" }))
})

export const enviarMensajeBodySchema = z.object({
    contenido: z.string({ message: "Mensaje invalido" })
        .transform(val => val.trim())
        .refine(val => val.length > 0, { message: "Mensaje invalido" })
})

// comunidad.ts
export const nickComunidadParamsSchema = z.object({
    nickComunidad: z.string({ message: "Debe ingresar un nick de comunidad" }).min(1, "Debe ingresar un nick de comunidad")
})

export const crearComunidadBodySchema = z.object({
    nickComunidad: z.string({ message: "El nick de la comunidad y el titulo son obligatorios" }).min(1, "El nick de la comunidad y el titulo son obligatorios"),
    titulo: z.string({ message: "El nick de la comunidad y el titulo son obligatorios" }).min(1, "El nick de la comunidad y el titulo son obligatorios"),
    descripcion: z.string().optional().default(''),
    normas: z.string().optional().default('')
})

// feed.ts
export const feedQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional()
})

// moderacion.ts
export const desestimarSchema = z.object({
    nickUsuario: z.string().min(1),
    idComentario: z.coerce.number()
})

export const eliminarComentarioSchema = z.object({
    idComentario: z.coerce.number()
})

export const actualizarEstadoDenunciaImagenSchema = z.object({
    nickUsuario: z.string().min(1),
    idImagen: z.coerce.number(),
    estado: z.enum(['pendiente', 'aceptada', 'rechazada'])
})

// publicacion.ts
export const getPublicacionByIdParamsSchema = z.object({
    id: z.coerce.number({ message: "ID invalido" })
})

export const getPublicacionByIdViewParamsSchema = z.object({
    id: z.coerce.number({ message: "ID invalido" }),
    orden: z.coerce.number({ message: "Orden invalido" })
})

export const valorarImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
})
export const valorarImagenBodySchema = z.object({
    puntaje: z.coerce.number().min(1).max(5)
})

export const comentarImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
})
export const comentarImagenBodySchema = z.object({
    texto: z.string().trim().min(1)
})

export const buscarPublicacionesQuerySchema = z.object({
    busqueda: z.string().optional(),
    etiqueta: z.string().optional(),
    autor: z.string().optional(),
    orden: z.enum(['recientes', 'antiguas']).optional()
})

export const crearPublicacionBodySchema = z.object({
    titulo: z.string().min(1),
    descripcion: z.string().optional(),
    etiquetas: z.string().optional(),
    comunidades: z.union([z.string(), z.array(z.string())]).optional()
})

export const toggleComentariosImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
})

export const denunciarComentarioParamsSchema = z.object({
    idComentario: z.coerce.number()
})

export const denunciarImagenViewParamsSchema = z.object({
    idImagen: z.coerce.number()
})

export const denunciarImagenPostParamsSchema = z.object({
    idImagen: z.coerce.number()
})
export const denunciarImagenPostBodySchema = z.object({
    idMotivo: z.coerce.number(),
    descripcion: z.string().optional()
})

export const toggleFavoritoParamsSchema = z.object({
    id: z.coerce.number()
})

export const setCopyrightImagenParamsSchema = z.object({
    idImagen: z.coerce.number()
})
export const setCopyrightImagenBodySchema = z.object({
    textoMarcaDeAgua: z.string().trim().min(1)
})

export const marcarInteresParamsSchema = z.object({
    idImagen: z.coerce.number()
})

// usuario.ts
export const perfilUsuarioParamsSchema = z.object({
    nickname: z.string().min(1, 'Debe indicar un usuario')
})

export const eliminarUsuarioBodySchema = z.object({
    id: z.string().min(1)
})

export const usuarioSigueABodySchema = z.object({
    nickSeguido: z.string().min(1)
})

export const seguirUsuarioBodySchema = z.object({
    nickSeguido: z.string().min(1)
})

export const dejarSeguirUsuarioBodySchema = z.object({
    nickSeguido: z.string().min(1)
})

export const listarSeguidoresBodySchema = z.object({
    id: z.string().min(1)
})

export const crearColeccionBodySchema = z.object({
    nombreColeccion: z.string().trim().min(1, "Nombre de coleccion invalido"),
    publicaciones: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]).optional()
})

export const verColeccionDetalleParamsSchema = z.object({
    nickColeccion: z.string().trim().min(1, "Coleccion no especificada")
})

export const marcarNotificacionVistaParamsSchema = z.object({
    id: z.coerce.number()
})
