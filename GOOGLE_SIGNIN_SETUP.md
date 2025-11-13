# 🔐 Configuración de Google Sign-In en Firebase

## Paso a Paso para Habilitar Google Sign-In

### 1. Ir a Firebase Console

Ve a [console.firebase.google.com](https://console.firebase.google.com) e inicia sesión.

### 2. Seleccionar tu Proyecto

Selecciona el proyecto `plagdetect-b5e56` (o el que estés usando).

### 3. Ir a Authentication

1. En el menú lateral izquierdo, haz clic en **Authentication**
2. Si es la primera vez, haz clic en **Get Started**

### 4. Habilitar Google Sign-In

1. Ve a la pestaña **Sign-in method**
2. Haz clic en **Google** en la lista de proveedores
3. Activa el interruptor **Enable**
4. **IMPORTANTE**: Configura lo siguiente:
   - **Support email**: Ingresa tu email (requerido)
   - **Project ID**: Ya está configurado automáticamente

5. Haz clic en **Save**

### 5. Configurar Dominios Autorizados

1. En la misma página de **Sign-in method**
2. Desplázate hasta **Authorized domains**
3. Verifica que estén agregados:
   - `localhost` (para desarrollo)
   - Tu dominio de producción (cuando despliegues)

**Por defecto ya debería estar `localhost`, pero verifica:**
- ✅ `localhost`
- ✅ `plagdetect-b5e56.firebaseapp.com`

### 6. Verificar Configuración

Tu configuración debería verse así:

```
Authentication > Sign-in method

✅ Email/Password - Enabled
✅ Google - Enabled
   Support email: tu-email@example.com
```

### 7. Probar en tu App

1. Inicia tu aplicación:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:5173`

3. En la página de Login o Sign Up, deberías ver:
   - Formulario de Email/Password
   - Divisor "Or continue with"
   - **Botón con logo de Google** que dice "Sign in with Google" o "Sign up with Google"

4. Haz clic en el botón de Google:
   - Se abrirá una ventana popup de Google
   - Selecciona tu cuenta de Google
   - La ventana se cerrará automáticamente
   - Serás redirigido al dashboard

### 8. Verificar Usuario en Firestore

Después de iniciar sesión con Google:

1. Ve a Firebase Console → **Firestore Database**
2. Abre la colección `profiles`
3. Deberías ver un nuevo documento con:
   ```json
   {
     "id": "uid-generado-por-firebase",
     "email": "tu-email-de-google@gmail.com",
     "display_name": "Tu Nombre de Google",
     "has_subscription": false,
     "subscription_expires_at": null,
     "created_at": "2024-XX-XX...",
     "updated_at": "2024-XX-XX..."
   }
   ```

## ❗ Troubleshooting

### Error: "This domain is not authorized"

**Solución:**
1. Ve a Firebase Console → Authentication → Sign-in method
2. Scroll hasta "Authorized domains"
3. Agrega `localhost` si no está

### Error: "popup_closed_by_user"

**Causa:** El usuario cerró el popup antes de completar el login.

**Solución:** Es normal, simplemente vuelve a intentar.

### Error: "auth/popup-blocked"

**Causa:** El navegador bloqueó el popup.

**Solución:**
1. Permitir popups en tu navegador para `localhost`
2. O usa `signInWithRedirect` en lugar de `signInWithPopup`

### El botón de Google no aparece

**Verificar:**
1. ✅ Ejecutaste `npm run dev` después de los cambios
2. ✅ No hay errores en la consola del navegador (F12)
3. ✅ El archivo `LoginForm.tsx` tiene el import de `useAuth`

### Errores en Consola

Abre la consola del navegador (F12) y busca errores. Los más comunes:

- **"signInWithGoogle is not a function"**: 
  - Verifica que AuthContext.tsx tenga la función exportada
  - Verifica que el Provider incluya `signInWithGoogle` en el value

- **"Firebase: Error (auth/unauthorized-domain)"**:
  - Agrega el dominio en Firebase Console

## 🎉 ¡Listo!

Una vez configurado, los usuarios podrán:
- ✅ Iniciar sesión con Google (un solo click)
- ✅ Registrarse con Google automáticamente
- ✅ No necesitan crear/recordar contraseñas
- ✅ Sus datos se sincronizan con Firestore

## 🔒 Seguridad

Firebase maneja toda la seguridad:
- ✅ OAuth 2.0 con Google
- ✅ Tokens JWT seguros
- ✅ Sin almacenar contraseñas
- ✅ Sesiones encriptadas

## 📱 Producción

Cuando despliegues a producción:

1. Agrega tu dominio de producción en "Authorized domains"
   - Ejemplo: `plagdetect.com`

2. Firebase automáticamente permite:
   - `https://tu-dominio.com`
   - `https://www.tu-dominio.com`

3. **NO necesitas** reconfigurar nada más en el código.

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de Firebase](https://firebase.google.com/docs/auth/web/google-signin)
