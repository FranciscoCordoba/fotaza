# Fotaza

Fotaza es una red social orientada a las imágenes donde los usuarios pueden crear publicaciones, subir imágenes, valorar, comentar, seguir a otros usuarios y ver el feed de sus seguidos.

El backend y las vistas de la aplicación se sirven a través de **Node.js, Express, Drizzle ORM y Pug**.

## Requisitos Previos
- Node.js (v18 o superior recomendado)
- Una base de datos PostgreSQL local o en la nube.
- Una cuenta en Cloudinary (para el almacenamiento de las imágenes)

## Pasos para ejecutar la aplicación

Importante: La aplicación debe ejecutarse en el siguiente orden.

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/FranciscoCordoba/fotaza.git
   cd fotaza
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar el entorno**:
   - Hay un archivo `.env.example` en la raíz. Úsalo como referencia para crear un archivo `.env` en la raíz de tu proyecto.
   - Deberás especificar tu conexión a PostgreSQL, el secreto JWT y tus credenciales de Cloudinary:
     ```env
     PORT=3000
     DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/tu_base_de_datos
     JWT_SECRET=tu_secreto_super_seguro
     CLOUDINARY_CLOUD_NAME=cloud_name
     CLOUDINARY_API_KEY=key
     CLOUDINARY_API_SECRET=secret
     ```

4. **Inicializar la base de datos (creación de tablas)**:
   ```bash
   npm run db:init
   ```

5. **Iniciar el servidor**:
   ```bash
   npm start
   ```

6. ¡Listo! Una vez iniciada, la aplicación quedará accesible en: `http://localhost:3000`

---

## Usuarios de prueba e información

Para probar la plataforma puedes registrar a nuevos usuarios desde `http://localhost:3000/auth/registro` (aun sin seed)

## Módulos y Requisitos Cumplidos
- **Creación de publicación:** Subida de archivo limitando peso a 4MB y enviándolo directamente a Cloudinary.
- **Buscador de publicaciones/imágenes:** Búsqueda activa por título desde la barra superior del feed.
- **Módulo de comentarios:** Foro en cada vista de imagen (`/publicacion/p/:id/1`).
- **Valoración de imágenes:** Sistema de calificación de 1 a 5 estrellas con actualización asíncrona de puntajes.
- **Seguimiento de usuarios:** Botón para alternar el feed entre general y "siguiendo", mostrando únicamente contenido de los creadores que el usuario logueado haya decidido seguir.
