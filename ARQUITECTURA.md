# LOJUSTO — Plan de implementación segura

## Estado actual
Las páginas HTML son prototipos visuales. **No hay registro, autenticación, solicitud, asignación, taxímetro en vivo ni notificaciones reales**. No se deben capturar credenciales reales.

## Roles
- Pasajero: registro con nombres, apellidos, número de WhatsApp y contraseña; solicita desde GPS y escribe barrio.
- Conductor: solo lo crea y activa un administrador; recibe solicitudes a 400 m, acepta, verifica código de cuatro dígitos y registra el servicio.
- Administrador: ruta /1110503179, protegida por autenticación y comprobación de rol **en el servidor**, nunca por el nombre de la ruta.

## Componentes pendientes de configurar
1. Backend con autenticación segura por teléfono + contraseña (no existe como proveedor nativo directo de Firebase Auth). Evaluar backend de identidad propio sobre un proveedor gestionado, hashing de contraseña robusto y protección contra intentos, recuperación de cuenta, verificación de propiedad del número. Nunca guardar contraseñas en texto ni en Sheets.
2. Base de datos transaccional y reglas de acceso. Solo el servidor decide qué conductor puede ver y aceptar solicitudes; aceptación atómica para evitar duplicados.
3. GPS de conductor actualizado y marca temporal de frescura; el navegador no garantiza rastreo en segundo plano. Filtrar candidatos <=400 metros sobre coordenadas recientes.
4. FCM Web Push con claves VAPID, consentimiento, service worker y servidor autenticado. En iOS requiere PWA añadida a pantalla de inicio y versión compatible; no se garantiza entrega cuando el sistema bloquea notificaciones.
5. Código aleatorio de cuatro dígitos: generar en servidor, almacenar hash, caducidad y límite de intentos. El taxímetro inicia al validarlo.
6. Taxímetro: base COP 6000 incluye hasta 2000 m y tiempo hasta el cruce; después COP 3/m adicional y COP 200/min transcurrido **después** del cruce, prorrateado por segundo; redondear a COP 50. El backend calcula el precio definitivo, igual para ambos roles. El prorrateo por segundo es una decisión provisional que debe confirmar el propietario.
7. Finalización: conductor FINALIZAR fija importe, ambas pantallas muestran lo mismo; CERRAR SERVICIO reinicia estado visible; conductor puede ver historial.
8. Reporte PDF diario 23:50 America/Bogota, guardado duradero antes de eliminar datos temporales de servicios ya archivados. Servicios activos o finalizados después del corte se preservan para el próximo archivo. Mantener usuarios, tarifas y registros necesarios para auditoría.
9. Pruebas de seguridad, concurrencia, precisión GPS, permisos y flujos antes de publicar.

## Infraestructura
GitHub Pages solo sirve archivos estáticos; no es un backend seguro. Firebase, Cloud Functions u otra infraestructura requieren proyecto y configuración por el propietario; algunas funciones pueden requerir plan con facturación. Apps Script puede ayudar con reportes, no debe ser la autoridad para aceptación concurrente de viajes.

## Privacidad
Evitar publicar coordenadas, teléfonos, contraseñas, claves de servidor o reportes en GitHub. Restringir acceso a datos de cada servicio a sus participantes y administrador.
