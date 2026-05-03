# Sistema de Gestión de Tareas Domésticas - Flujo Completo

## 📋 Resumen del Flujo

Este sistema implementa un flujo completo de autenticación y gestión de hogares compartidos con las siguientes características:

### ✅ Características Implementadas

1. **Registro automático con login**
   - El usuario se registra una sola vez
   - Inicio de sesión automático después del registro
   - Sin necesidad de volver a ingresar credenciales

2. **Usuario activo visible en todo momento**
   - Header persistente que muestra el nombre y email del usuario
   - Avatar visual con iniciales
   - Presente en todas las pantallas del flujo de onboarding

3. **Opción de cerrar sesión accesible**
   - Botón de cerrar sesión en la esquina superior derecha
   - Disponible en todas las pantallas después del login
   - Permite cambiar de cuenta en cualquier momento

4. **Persistencia de sesión**
   - La sesión se mantiene entre recargas de página
   - Almacenamiento en localStorage
   - Solo se cierra cuando el usuario lo solicita explícitamente

5. **Login inteligente**
   - Detecta el estado del usuario al iniciar sesión
   - Redirige automáticamente según lo que falta completar:
     - Si falta perfil → `/profile-setup`
     - Si falta hogar → `/home-selection`
     - Si todo está completo → `/dashboard`

---

## 🔄 Flujo de Navegación Completo

### Nuevo Usuario

```
1. /register (Registro)
   ↓ (Registro exitoso - Login automático)

2. /profile-setup (Completar Perfil)
   - Header con usuario activo + cerrar sesión
   - Campos: teléfono, edad, sexo
   ↓ (Guardar y continuar)

3. /home-selection (Selección de hogar)
   - Header con usuario activo + cerrar sesión
   - Opción A: Crear hogar
   - Opción B: Unirse a hogar

   3A. /create-home (Crear Hogar)
       - Header con usuario activo + cerrar sesión
       - Input: nombre del hogar
       - Usuario queda como administrador
       ↓
       /dashboard

   3B. /join-home (Unirse a Hogar)
       - Header con usuario activo + cerrar sesión
       - Muestra el correo del usuario
       - Botón para copiar correo
       - Instrucciones claras
       ↓ (Volver a selección)
       /home-selection
```

### Usuario Existente

```
1. /login (Iniciar Sesión)
   ↓ (Login exitoso)

   → Si falta perfil → /profile-setup
   → Si falta hogar → /home-selection
   → Si todo está completo → /dashboard
```

### Dashboard (Usuario con Hogar)

```
/dashboard
├── Ver información del hogar
├── Opción: Mi Perfil (/profile)
│   └── Ver y editar datos personales
│   └── Ver correo del usuario
│   └── Guardar cambios
│
└── Opción: Miembros del Hogar (/members) [Solo Admin]
    ├── Listar miembros
    ├── Agregar miembro (por correo)
    └── Eliminar miembro (con confirmación)
```

---

## 🎨 Diseño UX/UI

### Identidad Visual
- Gradiente azul-índigo de fondo
- Tarjetas blancas con sombras suaves
- Botones con estados hover y transiciones
- Iconos de Lucide React para consistencia visual

### Header de Usuario (UserHeader)
```
┌──────────────────────────────────────────────┐
│ 👤 Juan Pérez          [🚪 Cerrar sesión]   │
│    juan@email.com                            │
└──────────────────────────────────────────────┘
```

### Componentes Reutilizables
- **Input**: Campo de texto con validaciones y errores
- **Select**: Selector con opciones
- **Button**: Botones con variantes (primary, secondary, danger)
- **Card**: Contenedor para formularios y contenido
- **UserHeader**: Header con usuario y logout

### Estados Visuales
- ✅ Mensajes de éxito (verde)
- ❌ Mensajes de error (rojo)
- ⚠️ Advertencias (ámbar)
- ℹ️ Información (azul)

---

## 🔐 Sistema de Autenticación

### Almacenamiento
- **localStorage.users**: Array de todos los usuarios
- **localStorage.currentUser**: Usuario actualmente autenticado
- **localStorage.homes**: Array de todos los hogares

### Validaciones
- Campos obligatorios en todos los formularios
- Email único en registro
- Credenciales correctas en login
- Usuario no puede unirse a múltiples hogares

### Roles
- **Administrador**: Puede agregar/eliminar miembros
- **Miembro**: Acceso al hogar sin permisos de administración

---

## 🚀 Flujo Sin Bloqueos

### Principios
1. **Cada acción tiene una respuesta clara**
   - Mensajes de éxito/error visibles
   - Redirecciones inmediatas
   - Sin pantallas de carga infinitas

2. **Navegación siempre disponible**
   - Botones de "Volver" en pantallas secundarias
   - Cerrar sesión siempre accesible
   - Breadcrumbs visuales claros

3. **Estado persistente**
   - La sesión no se pierde en recargas
   - Los datos se guardan inmediatamente
   - Sin pérdida de progreso

---

## 📱 Responsive Design

El sistema funciona en:
- 📱 Móviles (diseño de una columna)
- 💻 Tablets (grid adaptativo)
- 🖥️ Desktop (grid de 2 columnas donde aplique)

---

## 🔧 Tecnologías Utilizadas

- **React** con TypeScript
- **React Router** para navegación
- **Tailwind CSS** v4 para estilos
- **Lucide React** para iconos
- **localStorage** para persistencia
- **Context API** para estado global
