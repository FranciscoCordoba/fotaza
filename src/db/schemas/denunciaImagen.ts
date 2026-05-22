import { boolean, date, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { imagenTable } from "./imagen.js";

export const denunciaImagenTable = pgTable('denuncia_imagen', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    idImagen: integer('id_imagen').notNull(),
    motivo: varchar({ length: 255 }).notNull(),
    evaluacion: boolean(),
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
    })
])