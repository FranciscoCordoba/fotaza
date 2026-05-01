import { boolean, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";
import { imagenTable } from "./imagen.js";

export const valoracionTable = pgTable('valoracion', {
    nickUsuario: varchar('nick_usuario', { length: 100 }),
    idImagen: integer('id_imagen'),
    valoracion: integer().notNull(),
    interes: boolean().default(false).notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.idImagen] }),
    foreignKey({
        columns: [table.nickUsuario, table.idImagen],
        foreignColumns: [userTable.nickname, imagenTable.id]
    })
])