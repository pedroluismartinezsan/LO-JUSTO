# Activación segura de roles — LOJUSTO

## Estado
El registro e inicio de sesión de pasajeros usan Firebase Authentication (correo/contraseña). El panel de administración exige el claim firmado `admin: true`; el panel de conductor exige `driver: true`. **La interfaz no es una frontera de seguridad:** las reglas de Firestore también verifican esos claims. El archivo `firestore.rules` está en GitHub, pero **no se despliega automáticamente**.

## Primer administrador
1. Cambiar cualquier contraseña compartida por chat y elegir una contraseña nueva y exclusiva.
2. En Firebase Console → Authentication → Users, crear o localizar la cuenta con el correo administrativo indicado por el propietario. No poner contraseñas en GitHub.
3. Desde un entorno de confianza que use Firebase Admin SDK y credenciales de administrador protegidas, localizar el UID de esa cuenta y asignar **solo a ese UID** el custom claim `{admin:true}` mediante `setCustomUserClaims`. El correo por sí solo **no** concede el rol. No ejecutar el Admin SDK en GitHub Pages ni subir claves privadas al repositorio.
4. Volver a iniciar sesión para refrescar el token y verificar el acceso.
5. En Firebase Console → Firestore → Rules, revisar y publicar `firestore.rules` solo después de confirmar que coincide con las colecciones utilizadas. Hasta entonces pueden seguir vigentes las reglas anteriores.

## Conductores
Solo el administrador debe aprobarlos. Un entorno confiable debe asignar el claim `{driver:true}` al UID correcto; **registrarse como pasajero no activa el rol**. La gestión real de conductores todavía necesita implementación de backend seguro.

## Limitaciones pendientes
- No se han creado cuentas ni asignado roles desde este repositorio.
- La colección `rides` permanece cerrada en las reglas propuestas: no hay viajes reales.
- Para aceptación exclusiva, PIN, tarifas definitivas e informes se requieren operaciones de confianza y pruebas integrales.
- El plan Firebase Spark tiene cuotas; evitar activar Blaze o servicios de pago.
