import { boolean, date, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";
import { imagenTable } from "./imagen.js";

export const denunciaImagenTable = pgTable('denuncia_imagen', {
    nickUsuario: varchar('nick_usuario', { length: 100 }),
    idImagen: integer('id_imagen'),
    motivo: varchar({ length: 255 }).notNull(),
    evaluacion: boolean().notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.idImagen] }),
    foreignKey({
        columns: [table.nickUsuario, table.idImagen],
        foreignColumns: [userTable.nickname, imagenTable.id]
    })
])