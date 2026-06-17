import { db } from "./index.js";
import { motivoDenunciaTable } from "./db/schemas/denunciaImagen.js";

try {
    const motivosDenuncia = [
        { motivo: "Contenido inapropiado" },
        { motivo: "Spam" },
        { motivo: "Acoso" },
        { motivo: "Contenido violento" },
        { motivo: "Otro" }
    ]

    await db.insert(motivoDenunciaTable).values(motivosDenuncia).onConflictDoNothing()

    console.log('Seed realizado exitosamente')
} catch (e) {
    console.log(e)
}