import type { Request, Response } from "express";
import { comunidadModel } from "../models/comunidad.js";
import type { comunidadInsert } from "../utils/types.js";

export class comunidadController {

    static async crearComunidad(req: Request, res: Response) {
        const newComunidad: comunidadInsert = req.body

        comunidadModel.create(newComunidad)
    }

}