# Modelo de datos propuesto para Firestore — LOJUSTO

**Estado:** diseño, no activado. No hay autenticación funcional ni permisos de lectura/escritura para clientes.

## Colecciones
- `usuarios/{uid}`: `nombre`, `apellido`, `telefonoE164`, `rol` (pasajero/conductor/admin), `activo`, `creadoEn`. El rol debe establecerlo un proceso de confianza, nunca el propio cliente.
- `conductores/{uid}`: `disponible`, `ubicacion` (GeoPoint), `ubicacionActualizadaEn`, `servicioActivoId`. Solo administradores autorizados pueden dar de alta y activar conductores.
- `servicios/{id}`: `pasajeroUid`, `barrio`, `origen` (GeoPoint), `estado` (solicitado/aceptado/en_curso/finalizado/cerrado), `conductorUid`, marcas de tiempo, `distanciaMetros`, `segundosPosterioresUmbral`, `valorFinalCop`. Evitar guardar PIN en texto claro.
- `configuracion/tarifas`: `minimoCop`=6000, `metrosIncluidos`=2000, `copPorMetroAdicional`=3, `copPorMinutoPosterior`=200, `redondeoCop`=50.
- `reportes/{fechaBogota}`: referencias al informe diario y metadatos de generación/archivo.

## Reglas de seguridad
El archivo `firestore.rules` **deniega todas las lecturas y escrituras**. Se mantiene así hasta disponer de una autenticación con celular+contraseña que emita identidad verificable, autorización por rol y operaciones atómicas seguras. No desplegar reglas abiertas ni permitir al cliente establecer `rol=admin` o `conductor`.

## Restricciones del plan gratuito
- No activar Blaze ni contratar servicios.
- Firestore Spark tiene cuotas; evitar escrituras continuas de GPS sin límites.
- La PWA no puede garantizar seguimiento en segundo plano ni push en todos los teléfonos.
- No presentar el modelo de datos como funcional hasta conectar los componentes de forma segura.
