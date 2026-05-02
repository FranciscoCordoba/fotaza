import { boolean, date, foreignKey, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";

export const notificacionTable = pgTable('notificacion', {
    id: serial('id').primaryKey(),
    nickRecepcion: varchar('nick_recepcion', { length: 100 }).notNull(),
    nickGeneracion: varchar('nick_generacion', { length: 100 }).notNull(),
    fuenteTipo: varchar('fuente_tipo', { length: 100 }).notNull(),
    texto: varchar({ length: 255 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull(),
    vista: boolean().default(false).notNull()
}, (tabla) => [
    foreignKey({
        columns: [tabla.nickRecepcion, tabla.nickGeneracion],
        foreignColumns: [usuarioTable.nickname, usuarioTable.nickname]
    })
])