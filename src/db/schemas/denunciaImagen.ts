import { date, foreignKey, integer, pgTable, primaryKey, varchar, serial, pgEnum } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { imagenTable } from "./imagen.js";

export const motivoDenunciaTable = pgTable('motivo_denuncia', {
    id: serial('id').primaryKey(),
    motivo: varchar({ length: 255 }).notNull().unique()
})

export const estadoEnum = pgEnum('estado', ['pendiente', 'aceptada', 'rechazada'])

export const denunciaImagenTable = pgTable('denuncia_imagen', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    idImagen: integer('id_imagen').notNull(),
    idMotivo: integer('id_motivo').notNull(),
    descripcion: varchar({ length: 500 }),
    estado: estadoEnum('estado').default('pendiente').notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.idImagen] }),
    foreignKey({
        columns: [table.nickUsuario],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.idImagen],
        foreignColumns: [imagenTable.id]
    }),
    foreignKey({
        columns: [table.idMotivo],
        foreignColumns: [motivoDenunciaTable.id]
    })
])