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
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'

export const publicacionInsertSchema = createInsertSchema(publicacionTable)
export const publicacionSelectSchema = createSelectSchema(publicacionTable)
export const publicacionUpdateSchema = createUpdateSchema(publicacionTable)

export const imagenInsertSchema = createInsertSchema(imagenTable)
export const etiquetaInsertSchema = createInsertSchema(etiquetaTable)
