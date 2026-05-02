import { usuarioTable } from "../db/schemas/usuario.js";
import { publicacionTable } from "../db/schemas/publicacion.js";
import { imagenTable } from "../db/schemas/imagen.js";
import { comentarioTable } from "../db/schemas/comentario.js";
import { denunciaImagenTable } from "../db/schemas/denunciaImagen.js";
import { denunciaComentarioTable } from "../db/schemas/denunciaComentario.js";
import { valoracionTable } from "../db/schemas/valoracion.js";
import { mensajeTable } from "../db/schemas/mensaje.js";
import { comunidadTable } from "../db/schemas/comunidad.js";
import { coleccionTable } from "../db/schemas/coleccion.js";
import { etiquetaTable } from "../db/schemas/etiqueta.js";
import { usuarioSigueATable } from "../db/schemas/usuarioSigueA.js";
import { usuarioSigueComunidadTable } from "../db/schemas/usuarioSigueComunidad.js";
import { publicacionEnComunidadTable } from "../db/schemas/publicacionEnComunidad.js";
import { notificacionTable } from "../db/schemas/notificacion.js";

export type usuarioInsert = typeof usuarioTable.$inferInsert
export type usuario = typeof usuarioTable.$inferSelect

export type publicacionInsert = typeof publicacionTable.$inferInsert
export type publicacion = typeof publicacionTable.$inferSelect

export type imagenInsert = typeof imagenTable.$inferInsert
export type imagen = typeof imagenTable.$inferSelect

export type comentarioInsert = typeof comentarioTable.$inferInsert
export type comentario = typeof comentarioTable.$inferSelect

export type denunciaImagenInsert = typeof denunciaImagenTable.$inferInsert
export type denunciaImagen = typeof denunciaImagenTable.$inferSelect

export type denunciaComentarioInsert = typeof denunciaComentarioTable.$inferInsert
export type denunciaComentario = typeof denunciaComentarioTable.$inferSelect

export type valoracionInsert = typeof valoracionTable.$inferInsert
export type valoracion = typeof valoracionTable.$inferSelect

export type mensajeInsert = typeof mensajeTable.$inferInsert
export type mensaje = typeof mensajeTable.$inferSelect

export type comunidadInsert = typeof comunidadTable.$inferInsert
export type comunidad = typeof comunidadTable.$inferSelect

export type coleccionInsert = typeof coleccionTable.$inferInsert
export type coleccion = typeof coleccionTable.$inferSelect

export type etiquetaInsert = typeof etiquetaTable.$inferInsert
export type etiqueta = typeof etiquetaTable.$inferSelect

export type usuarioSigueAInsert = typeof usuarioSigueATable.$inferInsert
export type usuarioSigueA = typeof usuarioSigueATable.$inferSelect

export type usuarioSigueComunidadInsert = typeof usuarioSigueComunidadTable.$inferInsert
export type usuarioSigueComunidad = typeof usuarioSigueComunidadTable.$inferSelect

export type publicacionEnComunidadInsert = typeof publicacionEnComunidadTable.$inferInsert
export type publicacionEnComunidad = typeof publicacionEnComunidadTable.$inferSelect

export type notificacionInsert = typeof notificacionTable.$inferInsert
export type notificacion = typeof notificacionTable.$inferSelect
