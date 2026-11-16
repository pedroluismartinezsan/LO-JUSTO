# Política de costo cero — LOJUSTO

## Requisito del propietario
- La aplicación es gratuita para pasajeros y conductores.
- El desarrollo y despliegue deben mantenerse sin gastos ni servicios de pago.
- **No activar Firebase Blaze, Cloud Functions, facturación, APIs pagas ni contratar servidores.**
- No afirmar que la infraestructura será gratuita de manera ilimitada: vigilar las cuotas del plan Spark y las restricciones de proveedores.

## Servicios actuales
- GitHub Pages: sitio web estático/PWA.
- Firebase Spark: proyecto `lo-justo-app`, Cloud Firestore y Firebase Authentication habilitado con correo/contraseña.
- No hay servidor de autenticación propio contratado.

## Seguridad y limitaciones
- Requisito actualizado: pasajeros se registran con nombre, apellido, correo electrónico y contraseña; Firebase Authentication Email/Password habilitado.
- Firebase Authentication usa correo electrónico y contraseña, sin SMS.
- Nunca guardar contraseñas ni hashes en Firestore o GitHub.
- El registro e ingreso de pasajeros usan Firebase Authentication; esto NO concede rol de conductor ni administrador.
- Los conductores deben ser dados de alta exclusivamente por el administrador, con autorización comprobada del lado del servidor.
- No usar rutas ocultas, identificadores o reglas de interfaz como sustituto de autorización.
- Firestore debe mantener reglas restrictivas; nunca abrir escrituras públicas para hacer funcionar una demostración.
- La aceptación exclusiva de viajes requiere operación atómica y reglas seguras; el GPS en segundo plano y notificaciones con la app cerrada no están garantizados en todos los dispositivos.

## Próximos pasos sin costo
1. Mejorar las pantallas públicas y la experiencia de la PWA.
2. Preparar modelos de datos y reglas restrictivas de Firestore, sin desplegarlas automáticamente.
3. Configurar y desplegar reglas de Firestore por roles; aprovisionar administrador con privilegios verificados en el servidor.
4. Revisar las cuotas y límites gratuitos antes de añadir sincronización de GPS, notificaciones o informes.

## Administración
- El correo administrativo designado por el propietario se configura exclusivamente en Firebase Authentication y los permisos se asignan mediante un mecanismo confiable. No guardar contraseñas administrativas en el repositorio.
- La ruta de administración no protege datos por sí sola; las reglas de Firestore deben denegar accesos no autorizados.
