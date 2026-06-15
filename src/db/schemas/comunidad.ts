import { date, pgTable, varchar } from "drizzle-orm/pg-core";

export const comunidadTable = pgTable('comunidad', {
    nickComunidad: varchar('nick_comunidad', { length: 100 }).primaryKey(),
    titulo: varchar({ length: 100 }).notNull(),
    descripcion: varchar({ length: 255 }).default(''),
    imagen: varchar({ length: 255 }),
    normas: varchar({ length: 500 }).default(''),
    createdAt: date('created_at').defaultNow().notNull()
})