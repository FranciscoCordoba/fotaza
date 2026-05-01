import { date, pgTable, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";

export const comunidadTable = pgTable('comunidad', {
    nickComunidad: varchar('nick_comunidad', { length: 100 }).primaryKey(),
    nickCreador: varchar('nick_creador', { length: 100 }).notNull().references(() => userTable.nickname),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    descripcion: varchar('descripcion', { length: 255 }),
    imagen: varchar('imagen', { length: 255 }),
    normas: varchar('normas', { length: 500 }),
    createdAt: date('created_at').defaultNow().notNull()
})