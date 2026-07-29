import { v2 as cloudinary } from "cloudinary";

try {
    process.loadEnvFile()
} catch (error) {
    // Ignorar en producción si no existe el archivo .env
}

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME)
    throw new Error('Falta configurar Cloudinary')

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
})

export const subirACaudinary = (bufferImg: Buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'fotaza' },
            (error, result) => {
                if (error) {
                    console.error("Error subiendo a Cloudinary:", error)
                    reject(error)
                    return
                }
                resolve(result)
            }
        )
        uploadStream.end(bufferImg)
    })
}

export const subirACaudinaryConMarcaDeAgua = (bufferImg: Buffer, textoMarcaDeAgua: string) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'fotaza',
                transformation: [
                    {
                        overlay: {
                            font_family: "Arial",
                            font_size: 50,
                            text: textoMarcaDeAgua
                        },
                        color: "white",
                        gravity: "south_east",
                        x: 20,
                        y: 20
                    }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error("Error subiendo a Cloudinary:", error)
                    reject(error)
                    return
                }
                resolve(result)
            }
        )
        uploadStream.end(bufferImg)
    })
}