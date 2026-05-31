# Gestion de tareas domesticas

Aplicacion web para organizar tareas dentro de hogares compartidos. El sistema permite registrar usuarios, iniciar sesion, crear hogares, agregar miembros por correo, administrar roles y gestionar tareas con prioridad, fecha limite, asignacion, aceptacion, rechazo, inicio, finalizacion, verificacion, historial, reportes y notificaciones.

El proyecto esta dividido en:

- `backend/`: API REST con Spring Boot, Spring Security, JWT, Spring Data JPA y MySQL.
- `frontend/`: aplicacion React con Vite.

## Funcionalidades principales

- Registro e inicio de sesion de usuarios.
- Autenticacion con JWT.
- Creacion de hogares compartidos.
- Agregar miembros a un hogar usando el correo registrado.
- Gestion de roles: `ADMIN`, `MIEMBRO` e `INVITADO`.
- Creacion, edicion, asignacion y eliminacion de tareas.
- Control de estados de tarea: sin asignar, pendiente, aceptada, rechazada, en progreso, completada, verificada o con verificacion rechazada.
- Inicio, finalizacion y verificacion de tareas.
- Consulta de tareas asignadas, estado general del hogar e historial de tareas.
- Reportes de cumplimiento, participacion por usuario y distribucion de tareas.
- Restricciones por rol:
  - Solo administradores pueden agregar miembros, cambiar roles, asignar tareas, eliminar tareas y modificar prioridad/fecha limite.
  - Solo administradores pueden verificar o rechazar la verificacion de tareas completadas.
  - Un administrador no puede verificar una tarea que esta asignada a si mismo.
  - Miembros asignados pueden aceptar, rechazar, iniciar y completar sus tareas.
  - Invitados no pueden recibir tareas.
- Notificaciones por asignacion, aceptacion, finalizacion, verificacion y rechazo de verificacion de tareas.

## Requisitos

Para ejecutar el proyecto en local se necesita:

- Java 21.
- Node.js y npm.
- MySQL 8 o compatible.
- Git.

No es necesario instalar Maven globalmente porque el backend incluye Maven Wrapper.

## Configuracion local

### 1. Crear base de datos

Crear una base de datos MySQL vacia. Ejemplo:

```sql
CREATE DATABASE organizacionhogar_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar backend

Antes de ejecutar el backend, llenar el archivo:

```text
backend/src/main/resources/application.properties
```

Este archivo se sube sin valores sensibles. Para local puede quedar asi:

```properties
spring.application.name=backend

spring.datasource.url=jdbc:mysql://localhost:3306/organizacionhogar_db
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

jwt.secret=clave-super-secreta-de-minimo-32-caracteres
jwt.expiration=86400000
```

Importante: `jwt.secret` debe tener minimo 32 caracteres.

### 3. Configurar frontend

Crear o revisar el archivo:

```text
frontend/.env
```

Para local:

```env
VITE_API_BASE_URL=http://localhost:8080
```

El archivo `.env` no debe subirse al repositorio. Para referencia existe `frontend/.env.example`.

## Ejecutar en local

### Backend

Desde la raiz del proyecto:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

En Linux/Mac:

```bash
cd backend
./mvnw spring-boot:run
```

La API quedara disponible en:

```text
http://localhost:8080
```

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicacion quedara disponible normalmente en:

```text
http://localhost:5173
```

## Verificacion rapida

Backend:

```bash
cd backend
.\mvnw.cmd test
```

En Linux/Mac usar `./mvnw test`.

Frontend:

```bash
cd frontend
npm run build
```

## Indicaciones para despliegue

Este proyecto no esta preparado como produccion real; esta pensado para entrega academica. Aun asi, para desplegarlo correctamente se deben configurar tres puntos: base de datos/backend, CORS y URL del backend en el frontend.

### 1. Backend en despliegue

En el entorno donde se despliegue el backend, llenar:

```text
backend/src/main/resources/application.properties
```

Ejemplo:

```properties
spring.application.name=backend

spring.datasource.url=jdbc:mysql://HOST:PUERTO/NOMBRE_DB
spring.datasource.username=USUARIO_DB
spring.datasource.password=PASSWORD_DB

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

jwt.secret=CLAVE_JWT_DE_MINIMO_32_CARACTERES
jwt.expiration=86400000
```

Si la plataforma de despliegue asigna un puerto propio, el encargado del despliegue debe ajustar `server.port` segun lo que pida esa plataforma.

Para compilar el backend:

```bash
cd backend
.\mvnw.cmd clean package
```

En Linux/Mac:

```bash
cd backend
./mvnw clean package
```

El `.jar` se genera dentro de:

```text
backend/target/
```

### 2. Configurar CORS del backend

El backend solo acepta peticiones desde origenes permitidos. Antes de desplegar, se debe agregar la URL real del frontend en:

```text
backend/src/main/java/com/ebp04/backend/config/SecurityConfig.java
```

Buscar esta parte:

```java
configuration.setAllowedOrigins(List.of(
        "http://localhost:5173",
        "http://127.0.0.1:5173"
));
```

Y agregar la URL del frontend desplegado. Ejemplo:

```java
configuration.setAllowedOrigins(List.of(
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://url-del-frontend-desplegado.com"
));
```

Si no se configura CORS con la URL correcta, el navegador bloqueara las peticiones del frontend al backend.

### 3. Configurar URL del backend en el frontend

Antes de compilar o desplegar el frontend, crear o editar:

```text
frontend/.env
```

Con la URL real del backend:

```env
VITE_API_BASE_URL=https://url-del-backend-desplegado.com
```

Luego compilar:

```bash
cd frontend
npm install
npm run build
```

Importante: en Vite, las variables `VITE_*` se toman al momento de compilar. Si cambia la URL del backend, se debe volver a ejecutar `npm run build`.

### 4. Rutas del frontend

El frontend usa rutas como `/dashboard`, `/tasks`, `/members`, etc. Si se despliega en una plataforma como Vercel, Netlify o similar, se debe configurar fallback hacia `index.html` para que al recargar una ruta interna no aparezca error 404.

Ejemplo para Vercel, archivo `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Archivos que no se deben subir con datos reales

No subir credenciales ni archivos generados:

- `frontend/.env`
- passwords reales de MySQL
- claves JWT reales
- `frontend/node_modules/`
- `frontend/dist/`
- `backend/target/`

El repositorio incluye `.gitignore` en la raiz para evitar subir dependencias, builds y archivos locales.

## Notas 

- El archivo `application.properties` se sube sin valores sensibles y debe llenarse en cada entorno.
- El CORS depende de la URL final del frontend y debe configurarlo quien haga el despliegue.
- `VITE_API_BASE_URL` depende de la URL final del backend y debe configurarse antes de compilar el frontend.
- Para la entrega academica se mantiene `spring.jpa.hibernate.ddl-auto=update` para facilitar la creacion/actualizacion de tablas.
