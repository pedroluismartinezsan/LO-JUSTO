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
- Requisito de producto: pasajeros se registran con nombre, apellido, número de celular/WhatsApp y contraseña; no se solicita correo.
- Firebase Authentication estándar **no admite celular + contraseña como proveedor directo**.
- No simular correos electrónicos a partir de teléfonos ni guardar contraseñas o hashes en Firestore accesible al cliente.
- Hasta contar con un mecanismo de autenticación seguro, **no habilitar registro ni acceso real con celular + contraseña**.
- Los conductores deben ser dados de alta exclusivamente por el administrador, con autorización comprobada del lado del servidor.
- No usar rutas ocultas, identificadores o reglas de interfaz como sustituto de autorización.
- Firestore debe mantener reglas restrictivas; nunca abrir escrituras públicas para hacer funcionar una demostración.
- La aceptación exclusiva de viajes requiere operación atómica y reglas seguras; el GPS en segundo plano y notificaciones con la app cerrada no están garantizados en todos los dispositivos.

## Próximos pasos sin costo
1. Mejorar las pantallas públicas y la experiencia de la PWA.
2. Preparar modelos de datos y reglas restrictivas de Firestore, sin desplegarlas automáticamente.
3. Evaluar una solución verificable de autenticación teléfono+contraseña que funcione en el plan gratuito; si no es posible, mantener esta función pendiente y explicar el bloqueo antes de habilitarla.
4. Revisar las cuotas y límites gratuitos antes de añadir sincronización de GPS, notificaciones o informes.
