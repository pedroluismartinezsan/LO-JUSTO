# Activar administrador y conductores — LOJUSTO (sin pagos)

El ingreso es siempre con correo y contraseña de Firebase Authentication. Para saber quién puede administrar, LOJUSTO lee un documento de Firestore. No se necesitan Cloud Shell, Admin SDK, claves privadas, funciones de pago ni plan Blaze.

## Una sola vez: activar administrador

1. En Firebase Console del proyecto `lo-justo-app`, abre **Firestore Database → Datos**.
2. Crea la colección `roles` y un documento cuyo ID sea **exactamente el UID del administrador** que aparece en Authentication → Users.
3. Agrega el campo `admin`, tipo **boolean**, valor **true**. Guarda.
4. En **Firestore Database → Reglas**, copia el contenido completo de `firestore.rules` de este repositorio y pulsa **Publicar**.
5. Entra normalmente con el correo y contraseña del administrador en LOJUSTO.

## Conductores
En Firebase Authentication crea o identifica la cuenta del conductor y su UID. En Firestore → Datos crea `roles/{UID_DEL_CONDUCTOR}` con campo boolean `driver: true`. Solo alguien con acceso administrativo a Firebase Console debe asignar roles. El registro público no concede permisos.

## Estado
Las reglas guardadas en GitHub **no se publican automáticamente** en Firebase. Las solicitudes reales de viaje todavía no están activas; `rides` permanece cerrado. El proyecto utiliza Firebase Spark y GitHub Pages sin servicios de pago, sujeto a las cuotas gratuitas.
