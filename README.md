# Fotaza

Fotaza es una red social orientada a las imágenes donde los usuarios pueden crear publicaciones, subir imágenes, valorar, comentar, seguir a otros usuarios y ver el feed de sus seguidos. 

El backend y las vistas de la aplicación se sirven a través de **Node.js, Express, Drizzle ORM y Pug**, enfocado en el rendimiento y la facilidad de mantenimiento.

## 🚀 Requisitos Previos
- Node.js (v18 o superior recomendado)
- Una base de datos PostgreSQL local o en la nube (ej. Neon)
- Una cuenta en Cloudinary (para el almacenamiento y manipulación de las imágenes)

## 🛠️ Pasos para ejecutar la aplicación

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

5. **(Opcional) Cargar datos de prueba**:
   ```bash
   npm run db:seed
   ```

6. **Iniciar el servidor (Modo Desarrollo)**:
   ```bash
   npm run dev
   ```

7. ¡Listo! Una vez iniciada, la aplicación quedará accesible en: `http://localhost:3000`

---

## 📡 Documentación de Endpoints Principales

La aplicación utiliza un sistema MVC tradicional con renderizado en servidor (Pug). Aquí están las rutas clave de la arquitectura:

### Autenticación (`/auth`)
- `GET /auth/login`: Vista de inicio de sesión.
- `POST /auth/login`: Procesa las credenciales y devuelve tokens (JWT) en cookies.
- `GET /auth/registro`: Vista de registro de usuario.
- `POST /auth/registro`: Crea un nuevo usuario.
- `GET /auth/logout`: Cierra sesión y elimina las cookies.

### Feed (`/feed`)
- `GET /feed`: Muestra el feed global con el algoritmo de priorización (basado en puntuación y cantidad).
- `GET /feed/siguiendo`: Muestra únicamente publicaciones de usuarios seguidos.
- `GET /feed/comunidades`: Muestra publicaciones de las comunidades suscritas.

### Publicaciones (`/publicacion`)
- `GET /publicacion/p/:id/:orden`: Visualiza el detalle de una imagen específica.
- `GET /publicacion/buscar`: Buscador avanzado (título, autor, etiqueta y ordenamiento).
- `GET /publicacion/crear`: Formulario para subir una nueva publicación con imágenes múltiples.
- `POST /publicacion/crear`: Sube imágenes a Cloudinary y guarda el registro.
- `POST /publicacion/imagen/:idImagen/valorar`: Añade una valoración (1 a 5 estrellas).
- `POST /publicacion/imagen/:idImagen/comentar`: Agrega un comentario a la imagen.
- `POST /publicacion/imagen/:idImagen/copyright`: Incrusta una marca de agua a la imagen llamando a Cloudinary.
- `POST /publicacion/:id/favorito`: Agrega o quita una publicación de la colección principal de Favoritos.
- `POST /publicacion/imagen/:idImagen/toggle-comentarios`: Activa/desactiva los comentarios en una imagen.
- `POST /publicacion/imagen/:idImagen/denunciar`: Envía una denuncia sobre una imagen a moderación.
- `POST /publicacion/comentario/:idComentario/denunciar`: Denuncia un comentario.

### Usuarios y Colecciones (`/usuario`)
- `GET /usuario/perfil/:nickname`: Perfil del usuario (sus publicaciones).
- `POST /usuario/seguir`: Seguir a un usuario.
- `POST /usuario/dejar_seguir`: Dejar de seguir a un usuario.
- `GET /usuario/colecciones`: Ver lista de colecciones del usuario.
- `GET /usuario/colecciones/nueva`: Vista para crear nueva colección.
- `POST /usuario/colecciones/nueva`: Crear una nueva colección personalizada.
- `GET /usuario/colecciones/:nickColeccion`: Ver contenido de una colección.
- `POST /usuario/colecciones/:nickColeccion/agregar`: Agrega una publicación a una colección existente.
- `POST /usuario/colecciones/:nickColeccion/eliminar`: Quita una publicación de la colección.
- `GET /usuario/notificaciones`: Centro de notificaciones del usuario.

### Comunidades (`/comunidad`)
- `GET /comunidad/crear`: Vista para crear comunidad.
- `POST /comunidad/crear`: Crea una comunidad nueva.
- `GET /comunidad/:nickComunidad`: Perfil de una comunidad (publicaciones compartidas).
- `POST /comunidad/:nickComunidad/seguir`: Unirse a la comunidad.
- `POST /comunidad/:nickComunidad/dejar-seguir`: Salir de la comunidad.
- `POST /comunidad/:nickComunidad/compartir`: Comparte publicaciones propias dentro de la comunidad.
- `POST /comunidad/:nickComunidad/dejar-compartir`: Retira una publicación compartida de la comunidad.

### Moderación (`/moderacion`)
- `GET /moderacion`: Panel central para administradores y moderadores.
- `POST /moderacion/estado-imagen`: Acepta o rechaza una denuncia de imagen.
- `POST /moderacion/eliminar`: Elimina un comentario denunciado y emite un strike.
- `POST /moderacion/desestimar`: Rechaza la denuncia sobre un comentario.

### Chat Privado (`/chat`)
- `GET /chat`: Lista las conversaciones activas.
- `GET /chat/:id`: Abre un chat específico con otro usuario.
- `POST /chat/:id/mensaje`: Envía un nuevo mensaje al chat.

---

## 📝 Informe de Desarrollo (Perspectiva Junior)

Durante el desarrollo de **Fotaza**, nos enfrentamos a varios desafíos interesantes que resolvimos implementando tecnologías y prácticas modernas:

1. **Gestión y Manipulación de Imágenes (Cloudinary)**
   - *Problema:* Guardar imágenes directamente en nuestro servidor o en base de datos iba a consumir el almacenamiento rápidamente y haría lenta la carga. Además, necesitábamos una forma de proteger las fotos de los usuarios (copyright).
   - *Solución:* Integramos la API de **Cloudinary**. Esto no solo nos brindó almacenamiento seguro en la nube, sino que aprovechamos sus **transformaciones dinámicas** para incrustar marcas de agua (texto customizado) directamente sobre las imágenes "al vuelo", sin tener que programar pesadas librerías de manipulación gráfica en nuestro backend Node.js.

2. **Manejo Estructurado de Base de Datos (Drizzle ORM)**
   - *Problema:* Escribir consultas SQL crudas para operaciones complejas (como traer el feed global con sus imágenes asociadas, o calcular el puntaje promedio de cada publicación) era propenso a errores tipográficos y muy difícil de mantener escalable.
   - *Solución:* Adoptamos **Drizzle ORM**. Nos resultó sumamente ágil porque nos permitió modelar nuestras tablas en TypeScript, autocompletando las propiedades y garantizando que los tipos coincidieran. Si bien experimentamos pequeños choques al renombrar tablas (crasheos de `drizzle-kit`), aprendimos a resolverlo limpiando nuestro esquema en Neon (Base de datos en la nube) y utilizando `db:init` para mantener la sincronización perfecta.

3. **Despliegue Serverless en la Nube (Vercel)**
   - *Problema:* Al subir el proyecto a producción en Vercel, descubrimos que los estilos CSS y archivos estáticos no cargaban, arrojando errores de *MIME Type* en la consola del cliente.
   - *Solución:* Investigando cómo funciona el entorno *Serverless* de Vercel, descubrimos que los recursos estáticos no se incluyen en el "paquete" a menos que se indiquen. Solucionamos el inconveniente creando un archivo `vercel.json` y ordenándole explícitamente incluir nuestra carpeta `src/public/**`, resolviendo el ruteo de archivos exitosamente en producción.
