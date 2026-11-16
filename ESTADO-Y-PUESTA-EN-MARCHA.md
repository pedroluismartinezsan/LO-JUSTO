# LOJUSTO — Estado real y puesta en marcha

## Disponible en GitHub Pages
- Diseño responsive para inicio, pasajero, conductor y administración.
- Mapa OpenStreetMap: el pasajero puede usar GPS, tocar el mapa y arrastrar el marcador del punto de recogida.
- Vista previa local de la solicitud con enlace de mapa.
- Demostración del ciclo solicitud → aceptación → PIN → taxímetro → finalizar → cerrar.
- Simulador de tarifas para el conductor y simulador editable local en administración.
- PWA con manifiesto y caché.

**Estas funciones son demostraciones, no un servicio de transporte operativo.**

## Pendiente antes de operar con personas reales
1. **Autenticación por celular + contraseña sin correo:** Firebase Auth no ofrece esa combinación de forma nativa. Requiere una solución de identidad confiable que no almacene contraseñas en el navegador ni en Firestore. La opción Email/Password habilitada no equivale a acceso por celular.
2. **Permisos de administración y conductores:** verificación de rol por servidor, altas de conductores solo por administrador y reglas Firestore probadas.
3. **Servicios en tiempo real:** lectura/escritura autorizada, coincidencia geográfica 400 m, ubicación reciente, aceptación exclusiva con transacción atómica.
4. **PIN y cobro:** generación y validación seguras del PIN, medición confiable del trayecto, cálculo definitivo de tarifa del lado de confianza.
5. **Notificaciones y segundo plano:** revisar compatibilidad de Android/iOS, permisos y limitaciones del navegador. No prometer GPS o push garantizado con la app cerrada.
6. **Reportes automáticos PDF 23:50 Colombia:** un programador y almacenamiento confiables, con cuotas y costes verificados.
7. **Pruebas integrales y despliegue:** comprobar acceso, privacidad, concurrencia, límites del plan Spark y recuperación de errores.

## Seguridad actual
El archivo `firestore.rules` incluido en GitHub deniega todo por defecto y **no está desplegado automáticamente**. GitHub Pages aloja archivos estáticos; no puede custodiar claves privadas ni ejecutar lógica privilegiada. No publicar credenciales ni reglas que permitan a cualquiera asignarse el rol de administrador.

## Qué debe autorizar el propietario para completar la conexión
- Elegir una solución de autenticación real compatible con la exigencia de **solo celular y contraseña** y el presupuesto cero, o revisar uno de esos requisitos.
- Desplegar reglas de Firestore en la consola Firebase (o habilitar una integración de despliegue con permisos adecuados).
- Probar el flujo con usuarios de prueba antes de usar datos personales.

La configuración pública de Firebase inicializa la aplicación en el navegador, **pero no demuestra que las operaciones de Firestore ni el acceso de usuarios estén conectados**.
