import { db } from "./index.js";
import { motivoDenunciaTable } from "./db/schemas/denunciaImagen.js";
import { usuarioModel } from "./models/usuario.js";
import { publicacionModel } from "./models/publicacion.js";
import { imagenModel } from "./models/imagen.js";
import { etiquetaModel } from "./models/etiqueta.js";
import { comunidadModel } from "./models/comunidad.js";
import { comentarioModel } from "./models/comentario.js";
import { usuarioSigueComunidadModel } from "./models/usuarioSigueComunidad.js";
import { publicacionEnComunidadModel } from "./models/publicacionEnComunidad.js";
import bcrypt from "bcrypt";

try {
    const motivosDenuncia = [
        { motivo: "Contenido inapropiado" },
        { motivo: "Spam" },
        { motivo: "Acoso" },
        { motivo: "Contenido violento" },
        { motivo: "Otro" }
    ]

    await db.insert(motivoDenunciaTable).values(motivosDenuncia).onConflictDoNothing()

    // 1 Usuario
    const passwordHash = await bcrypt.hash("123", 10);
    const usuarioNick = "usuario_seed";

    await usuarioModel.create({
        nickname: usuarioNick,
        password: passwordHash,
        correo: `${usuarioNick}@seed.com`,
        nombre: "Usuario Seed",
    });

    // 2 Publicaciones para ese usuario
    const pub1 = await publicacionModel.create(usuarioNick, "Publicación Seed 1", "Mi primera publicación generada por seed");
    const pub2 = await publicacionModel.create(usuarioNick, "Publicación Seed 2", "Mi segunda publicación generada por seed");

    if (pub1 && pub1[0] && pub2 && pub2[0]) {
        const idPub1 = pub1[0].id;
        const idPub2 = pub2[0].id;

        // 3 imágenes en la pub 1
        const imgPub1 = await imagenModel.create(idPub1, "https://res.cloudinary.com/ddroukwqm/image/upload/v1781306153/fotaza/dpzivtbjhi6cgedkmaea.png", 1);
        await imagenModel.create(idPub1, "https://res.cloudinary.com/ddroukwqm/image/upload/v1781306153/fotaza/ksbq3amlpddj1nehudg3.png", 2);
        await imagenModel.create(idPub1, "https://res.cloudinary.com/ddroukwqm/image/upload/v1781306153/fotaza/w12086zcqrn3wzf1fycq.png", 3);

        // 1 imagen en la pub 2
        await imagenModel.create(idPub2, "https://res.cloudinary.com/ddroukwqm/image/upload/v1781306480/fotaza/ef10bele94okdont1y91.png", 1);

        // 2 etiquetas en cada publicación
        await etiquetaModel.create(idPub1, "moto");
        await etiquetaModel.create(idPub1, "rouser");

        await etiquetaModel.create(idPub2, "moto");
        await etiquetaModel.create(idPub2, "tekken");

        // 2 comentarios en la pub 1
        if (imgPub1 && imgPub1[0]) {
            await comentarioModel.create(usuarioNick, imgPub1[0].id, "Comentario 1");
            await comentarioModel.create(usuarioNick, imgPub1[0].id, "Comentario 2");
        }
    }

    // 1 Comunidad
    const comunidadNick = "comunidad_seed";
    await comunidadModel.create(comunidadNick, "Comunidad Seed", "Descripción de la comunidad seed", "https://res.cloudinary.com/ddroukwqm/image/upload/v1781556531/fotaza/dm89taxaty1f7fz6yurq.png", "No spam");

    // El usuario sigue a la comunidad
    await usuarioSigueComunidadModel.create(usuarioNick, comunidadNick);

    // La segunda publicación se comparte en la comunidad
    if (pub2 && pub2[0]) {
        await publicacionEnComunidadModel.create(comunidadNick, pub2[0].id);
    }

    console.log('Seed realizado exitosamente')
} catch (e) {
    console.log(e)
}