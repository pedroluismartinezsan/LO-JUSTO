// ============================================================
// LO JUSTO - APP DEL CONDUCTOR
// Versión inicial funcional
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
  onDisconnect,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// ============================================================
// CONFIGURACIÓN FIREBASE
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDuQ033fmDiX7BHRyLntLFjlXXb9jqFKXU",
  authDomain: "lo-justo-495ec.firebaseapp.com",
  databaseURL: "https://lo-justo-495ec-default-rtdb.firebaseio.com",
  projectId: "lo-justo-495ec",
  storageBucket: "lo-justo-495ec.firebasestorage.app",
  messagingSenderId: "1029572045640",
  appId: "1:1029572045640:web:ef64b69515eb9820b3617d"
};


// ============================================================
// INICIALIZAR FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// ============================================================
// CONFIGURACIÓN DEL CONDUCTOR DE PRUEBA
// ============================================================

// Por ahora usamos el conductor que creamos manualmente
// en Firebase.
// Más adelante lo relacionaremos directamente con el UID
// de Firebase Authentication.

const CONDUCTOR_ID = "conductor_prueba";


// ============================================================
// VARIABLES GENERALES
// ============================================================

let conductorActual = null;

let serviciosDisponibles = {};

let servicioActivo = null;

let servicioActivoId = null;

let tarifas = {
  inicial: 0,
  metro: 1.5,
  minuto: 150
};


// ============================================================
// VARIABLES DEL GPS
// ============================================================

let gpsWatchId = null;

let ultimaPosicion = null;

let distanciaMetros = 0;

let inicioServicioMs = null;

let intervaloTaximetro = null;

let rastreandoServicio = false;


// ============================================================
// ELEMENTOS HTML
// ============================================================

const pantallaCarga = document.getElementById("pantallaCarga");

const appPrincipal = document.getElementById("app");

const pantallaLogin = document.getElementById("pantallaLogin");

const pantallaPrincipal = document.getElementById("pantallaPrincipal");

const formLogin = document.getElementById("formLogin");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const mensajeLogin = document.getElementById("mensajeLogin");

const textoEstado = document.getElementById("textoEstado");

const btnConexion = document.getElementById("btnConexion");

const estadoGPS = document.getElementById("estadoGPS");

const latitudElemento = document.getElementById("latitud");

const longitudElemento = document.getElementById("longitud");

const listaServicios = document.getElementById("listaServicios");

const contadorServicios = document.getElementById("contadorServicios");

const seccionServicioActivo =
  document.getElementById("seccionServicioActivo");

const codigoServicioActivo =
  document.getElementById("codigoServicioActivo");

const origenServicio =
  document.getElementById("origenServicio");

const destinoServicio =
  document.getElementById("destinoServicio");

const estadoServicioActivo =
  document.getElementById("estadoServicioActivo");

const usuarioServicio =
  document.getElementById("usuarioServicio");

const btnLlegue =
  document.getElementById("btnLlegue");

const btnStart =
  document.getElementById("btnStart");

const btnEnd =
  document.getElementById("btnEnd");

const valorActual =
  document.getElementById("valorActual");

const distanciaActual =
  document.getElementById("distanciaActual");

const tiempoActual =
  document.getElementById("tiempoActual");

const totalServicios =
  document.getElementById("totalServicios");

const totalGenerado =
  document.getElementById("totalGenerado");

const notificacion =
  document.getElementById("notificacion");

const textoNotificacion =
  document.getElementById("textoNotificacion");


// ============================================================
// INICIO DE LA APLICACIÓN
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  mostrarPantallaPrincipal(false);

  await cargarTarifas();

  configurarEventos();

  observarSesion();

  setTimeout(() => {

    if (pantallaCarga) {
      pantallaCarga.classList.add("oculto");
    }

  }, 1200);

});


// ============================================================
// CONFIGURAR EVENTOS
// ============================================================

function configurarEventos() {

  if (formLogin) {

    formLogin.addEventListener("submit", iniciarSesion);

  }

  if (btnConexion) {

    btnConexion.addEventListener("click", cambiarConexion);

  }

  if (btnLlegue) {

    btnLlegue.addEventListener("click", marcarLlegada);

  }

  if (btnStart) {

    btnStart.addEventListener("click", iniciarServicio);

  }

  if (btnEnd) {

    btnEnd.addEventListener("click", finalizarServicio);

  }

}


// ============================================================
// SESIÓN
// ============================================================

function observarSesion() {

  onAuthStateChanged(auth, async (usuario) => {

    if (usuario) {

      await cargarConductor();

      mostrarPantallaPrincipal(true);

      escucharServicios();

      escucharServicioActivo();

      escucharEstadisticas();

    } else {

      mostrarPantallaPrincipal(false);

    }

  });

}


// ============================================================
// INICIAR SESIÓN
// ============================================================

async function iniciarSesion(event) {

  event.preventDefault();

  const email = emailInput.value.trim();

  const password = passwordInput.value;

  if (!email || !password) {

    mostrarMensajeLogin("Ingresa correo y contraseña.");

    return;

  }

  mostrarMensajeLogin("Ingresando...");

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    mostrarMensajeLogin("");

  } catch (error) {

    console.error(error);

    let mensaje = "No fue posible iniciar sesión.";

    if (error.code === "auth/invalid-credential") {

      mensaje = "Correo o contraseña incorrectos.";

    }

    if (error.code === "auth/user-not-found") {

      mensaje = "El usuario no existe.";

    }

    if (error.code === "auth/wrong-password") {

      mensaje = "La contraseña es incorrecta.";

    }

    mostrarMensajeLogin(mensaje);

  }

}


// ============================================================
// CERRAR SESIÓN
// ============================================================

async function cerrarSesion() {

  detenerGPS();

  detenerTaximetro();

  await actualizarEstadoConductor("desconectado");

  await signOut(auth);

}


// ============================================================
// CARGAR CONDUCTOR
// ============================================================

async function cargarConductor() {

  const referencia =
    ref(db, `conductores/${CONDUCTOR_ID}`);

  const snapshot = await get(referencia);

  if (snapshot.exists()) {

    conductorActual = snapshot.val();

    actualizarInterfazConductor();

  } else {

    mostrarNotificacion(
      "No se encontró el conductor en Firebase."
    );

  }

}


// ============================================================
// INTERFAZ DEL CONDUCTOR
// ============================================================

function actualizarInterfazConductor() {

  if (!conductorActual) return;

  if (textoEstado) {

    textoEstado.textContent =
      conductorActual.estado === "conectado"
        ? "CONDUCTOR CONECTADO"
        : "CONDUCTOR DESCONECTADO";

  }

  if (btnConexion) {

    btnConexion.textContent =
      conductorActual.estado === "conectado"
        ? "DESCONECTAR"
        : "CONECTAR";

  }

}


// ============================================================
// CAMBIAR CONEXIÓN
// ============================================================

async function cambiarConexion() {

  if (!conductorActual) return;

  const conectado =
    conductorActual.estado === "conectado";

  if (conectado) {

    await actualizarEstadoConductor("desconectado");

    detenerGPS();

    mostrarNotificacion(
      "Te desconectaste correctamente."
    );

  } else {

    await actualizarEstadoConductor("conectado");

    iniciarGPS();

    mostrarNotificacion(
      "Estás disponible para recibir servicios."
    );

  }

}


// ============================================================
// ACTUALIZAR ESTADO DEL CONDUCTOR
// ============================================================

async function actualizarEstadoConductor(estado) {

  try {

    const referencia =
      ref(db, `conductores/${CONDUCTOR_ID}`);

    await update(referencia, {

      estado: estado,

      ultima_conexion: obtenerHora()

    });

    if (conductorActual) {

      conductorActual.estado = estado;

    }

    actualizarInterfazConductor();

  } catch (error) {

    console.error(
      "Error actualizando conductor:",
      error
    );

  }

}


// ============================================================
// TARIFAS
// ============================================================

async function cargarTarifas() {

  try {

    const referencia =
      ref(db, "configuracion");

    const snapshot = await get(referencia);

    if (!snapshot.exists()) return;

    const datos = snapshot.val();

    tarifas.inicial =
      Number(datos.tarifa_inicial ?? 0);

    tarifas.metro =
      Number(datos.tarifa_metro ?? 1.5);

    tarifas.minuto =
      Number(datos.tarifa_minuto ?? 150);

    console.log("Tarifas cargadas:", tarifas);

  } catch (error) {

    console.error(
      "Error cargando tarifas:",
      error
    );

  }

}


// ============================================================
// ESCUCHAR SERVICIOS DISPONIBLES
// ============================================================

function escucharServicios() {

  const referencia =
    ref(db, "servicios");

  onValue(referencia, (snapshot) => {

    const datos = snapshot.val() || {};

    serviciosDisponibles = {};

    Object.entries(datos).forEach(
      ([id, servicio]) => {

        if (
          servicio.estado === "BUSCANDO" &&
          !servicio.conductor_id
        ) {

          serviciosDisponibles[id] = servicio;

        }

      }
    );

    pintarServiciosDisponibles();

  });

}


// ============================================================
// PINTAR SERVICIOS
// ============================================================

function pintarServiciosDisponibles() {

  if (!listaServicios) return;

  listaServicios.innerHTML = "";

  const ids =
    Object.keys(serviciosDisponibles);

  if (contadorServicios) {

    contadorServicios.textContent =
      ids.length;

  }

  if (ids.length === 0) {

    listaServicios.innerHTML = `
      <div class="sin-servicios">
        <div class="icono-vacio">🚘</div>
        <p>No hay servicios disponibles</p>
        <small>Cuando llegue una solicitud aparecerá aquí.</small>
      </div>
    `;

    return;

  }

  ids.forEach((id) => {

    const servicio =
      serviciosDisponibles[id];

    const tarjeta =
      document.createElement("div");

    tarjeta.className = "tarjeta-servicio";

    tarjeta.innerHTML = `

      <div class="servicio-cabecera">

        <span class="codigo">
          #${servicio.codigo || id}
        </span>

        <span class="estado">
          DISPONIBLE
        </span>

      </div>

      <div class="servicio-ruta">

        <div>
          <strong>📍 Origen</strong>
          <span>${servicio.origen || "No especificado"}</span>
        </div>

        <div>
          <strong>🏁 Destino</strong>
          <span>${servicio.destino || "Por definir"}</span>
        </div>

      </div>

      <button class="btn-tomar">
        TOMAR SERVICIO
      </button>

    `;

    const boton =
      tarjeta.querySelector(".btn-tomar");

    boton.addEventListener(
      "click",
      () => tomarServicio(id)
    );

    listaServicios.appendChild(tarjeta);

  });

}


// ============================================================
// TOMAR SERVICIO
// ============================================================

async function tomarServicio(servicioId) {

  const referencia =
    ref(db, `servicios/${servicioId}`);

  try {

    const resultado =
      await runTransaction(
        referencia,
        (servicio) => {

          if (!servicio) {

            return;

          }

          if (
            servicio.estado !== "BUSCANDO" ||
            servicio.conductor_id
          ) {

            return;

          }

          servicio.conductor_id =
            CONDUCTOR_ID;

          servicio.estado =
            "ASIGNADO";

          servicio.hora_asignacion =
            obtenerHora();

          return servicio;

        }
      );

    if (!resultado.committed) {

      mostrarNotificacion(
        "Este servicio ya fue tomado por otro conductor."
      );

      return;

    }

    mostrarNotificacion(
      "¡Servicio asignado correctamente! 🎉"
    );

    cargarServicioActivo(
      servicioId,
      resultado.snapshot.val()
    );

  } catch (error) {

    console.error(error);

    mostrarNotificacion(
      "No fue posible tomar el servicio."
    );

  }

}


// ============================================================
// ESCUCHAR SERVICIO ACTIVO
// ============================================================

function escucharServicioActivo() {

  const referencia =
    ref(db, "servicios");

  onValue(referencia, (snapshot) => {

    const servicios =
      snapshot.val() || {};

    let encontrado = null;

    Object.entries(servicios).forEach(
      ([id, servicio]) => {

        if (
          servicio.conductor_id === CONDUCTOR_ID &&
          servicio.estado !== "FINALIZADO" &&
          servicio.estado !== "CANCELADO"
        ) {

          encontrado = {
            id,
            datos: servicio
          };

        }

      }
    );

    if (encontrado) {

      cargarServicioActivo(
        encontrado.id,
        encontrado.datos
      );

    } else {

      ocultarServicioActivo();

    }

  });

}


// ============================================================
// CARGAR SERVICIO ACTIVO
// ============================================================

function cargarServicioActivo(id, servicio) {

  servicioActivoId = id;

  servicioActivo = servicio;

  if (seccionServicioActivo) {

    seccionServicioActivo.style.display = "block";

  }

  if (codigoServicioActivo) {

    codigoServicioActivo.textContent =
      `#${servicio.codigo || id}`;

  }

  if (origenServicio) {

    origenServicio.textContent =
      servicio.origen || "No especificado";

  }

  if (destinoServicio) {

    destinoServicio.textContent =
      servicio.destino || "Por definir";

  }

  if (usuarioServicio) {

    usuarioServicio.textContent =
      servicio.usuario_id || "Usuario";

  }

  if (estadoServicioActivo) {

    estadoServicioActivo.textContent =
      servicio.estado || "";

  }

  actualizarBotonesServicio(
    servicio.estado
  );

  if (
    servicio.estado === "EN_SERVICIO" &&
    !rastreandoServicio
  ) {

    iniciarSeguimientoServicio(
      servicio
    );

  }

}


// ============================================================
// OCULTAR SERVICIO ACTIVO
// ============================================================

function ocultarServicioActivo() {

  if (seccionServicioActivo) {

    seccionServicioActivo.style.display = "none";

  }

  servicioActivo = null;

  servicioActivoId = null;

  detenerTaximetro();

  rastreandoServicio = false;

}


// ============================================================
// BOTONES SEGÚN ESTADO
// ============================================================

function actualizarBotonesServicio(estado) {

  if (!btnLlegue || !btnStart || !btnEnd) {
    return;
  }

  btnLlegue.style.display = "none";

  btnStart.style.display = "none";

  btnEnd.style.display = "none";


  if (estado === "ASIGNADO") {

    btnLlegue.style.display = "block";

  }


  if (estado === "CONDUCTOR_EN_SITIO") {

    btnStart.style.display = "block";

  }


  if (estado === "EN_SERVICIO") {

    btnEnd.style.display = "block";

  }

}


// ============================================================
// MARCAR "LLEGUÉ"
// ============================================================

async function marcarLlegada() {

  if (!servicioActivoId) return;

  try {

    await update(
      ref(db, `servicios/${servicioActivoId}`),
      {

        estado: "CONDUCTOR_EN_SITIO",

        hora_llegada:
          obtenerHora()

      }
    );

    mostrarNotificacion(
      "Llegaste al punto de recogida. 📍"
    );

  } catch (error) {

    console.error(error);

    mostrarNotificacion(
      "No fue posible actualizar el servicio."
    );

  }

}


// ============================================================
// INICIAR SERVICIO
// ============================================================

async function iniciarServicio() {

  if (!servicioActivoId) return;

  distanciaMetros = 0;

  ultimaPosicion = null;

  inicioServicioMs = Date.now();

  rastreandoServicio = true;

  try {

    await update(
      ref(db, `servicios/${servicioActivoId}`),
      {

        estado: "EN_SERVICIO",

        hora_inicio:
          obtenerHora(),

        distancia_metros: 0,

        duracion_minutos: 0,

        valor_distancia: 0,

        valor_tiempo: 0,

        valor_total: tarifas.inicial

      }
    );

    iniciarGPS();

    iniciarTaximetro();

    mostrarNotificacion(
      "Servicio iniciado. Taxímetro activo. 🚘"
    );

  } catch (error) {

    console.error(error);

    mostrarNotificacion(
      "No fue posible iniciar el servicio."
    );

  }

}


// ============================================================
// INICIAR TAXÍMETRO
// ============================================================

function iniciarTaximetro() {

  detenerTaximetro();

  actualizarTaximetro();

  intervaloTaximetro =
    setInterval(
      actualizarTaximetro,
      1000
    );

}


// ============================================================
// ACTUALIZAR TAXÍMETRO
// ============================================================

function actualizarTaximetro() {

  if (!inicioServicioMs) return;

  const ahora =
    Date.now();

  const duracionMs =
    ahora - inicioServicioMs;

  const minutos =
    duracionMs / 60000;

  const valorDistancia =
    distanciaMetros * tarifas.metro;

  const valorTiempo =
    minutos * tarifas.minuto;

  const total =
    tarifas.inicial +
    valorDistancia +
    valorTiempo;


  if (valorActual) {

    valorActual.textContent =
      formatoPesos(total);

  }

  if (distanciaActual) {

    distanciaActual.textContent =
      `${(distanciaMetros / 1000).toFixed(2)} km`;

  }

  if (tiempoActual) {

    tiempoActual.textContent =
      formatoTiempo(duracionMs);

  }

}


// ============================================================
// DETENER TAXÍMETRO
// ============================================================

function detenerTaximetro() {

  if (intervaloTaximetro) {

    clearInterval(intervaloTaximetro);

    intervaloTaximetro = null;

  }

}


// ============================================================
// FINALIZAR SERVICIO
// ============================================================

async function finalizarServicio() {

  if (!servicioActivoId) return;

  if (!inicioServicioMs) {

    mostrarNotificacion(
      "El servicio todavía no ha sido iniciado."
    );

    return;

  }

  const ahora =
    Date.now();

  const duracionMs =
    ahora - inicioServicioMs;

  const duracionMinutos =
    duracionMs / 60000;

  const valorDistancia =
    distanciaMetros * tarifas.metro;

  const valorTiempo =
    duracionMinutos * tarifas.minuto;

  const valorTotal =
    tarifas.inicial +
    valorDistancia +
    valorTiempo;


  detenerTaximetro();

  detenerGPS();

  rastreandoServicio = false;


  try {

    await update(
      ref(db, `servicios/${servicioActivoId}`),
      {

        estado: "FINALIZADO",

        hora_finalizacion:
          obtenerHora(),

        distancia_metros:
          Math.round(distanciaMetros),

        duracion_minutos:
          Number(duracionMinutos.toFixed(2)),

        valor_distancia:
          Math.round(valorDistancia),

        valor_tiempo:
          Math.round(valorTiempo),

        valor_total:
          Math.round(valorTotal)

      }
    );


    mostrarNotificacion(
      `Servicio finalizado. Total: ${formatoPesos(valorTotal)}`
    );


    mostrarResultadoFinal(
      distanciaMetros,
      duracionMinutos,
      valorDistancia,
      valorTiempo,
      valorTotal
    );


    distanciaMetros = 0;

    inicioServicioMs = null;

    ultimaPosicion = null;


  } catch (error) {

    console.error(error);

    mostrarNotificacion(
      "No fue posible finalizar el servicio."
    );

  }

}


// ============================================================
// MOSTRAR RESULTADO FINAL
// ============================================================

function mostrarResultadoFinal(
  distancia,
  minutos,
  valorDistancia,
  valorTiempo,
  total
) {

  if (valorActual) {

    valorActual.textContent =
      formatoPesos(total);

  }

  if (distanciaActual) {

    distanciaActual.textContent =
      `${(distancia / 1000).toFixed(2)} km`;

  }

  if (tiempoActual) {

    tiempoActual.textContent =
      formatoTiempo(minutos * 60000);

  }

}


// ============================================================
// GPS GENERAL
// ============================================================

function iniciarGPS() {

  if (!navigator.geolocation) {

    actualizarEstadoGPS(
      "GPS no disponible"
    );

    return;

  }

  if (gpsWatchId !== null) {

    return;

  }

  actualizarEstadoGPS(
    "Buscando ubicación..."
  );


  gpsWatchId =
    navigator.geolocation.watchPosition(

      recibirPosicion,

      errorGPS,

      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000
      }

    );


  configurarDesconexion();

}


// ============================================================
// RECIBIR POSICIÓN
// ============================================================

async function recibirPosicion(position) {

  const lat =
    position.coords.latitude;

  const lon =
    position.coords.longitude;

  const accuracy =
    position.coords.accuracy;


  if (latitudElemento) {

    latitudElemento.textContent =
      lat.toFixed(6);

  }

  if (longitudElemento) {

    longitudElemento.textContent =
      lon.toFixed(6);

  }


  actualizarEstadoGPS(
    `GPS activo ±${Math.round(accuracy)} m`
  );


  // ----------------------------------------------------------
  // CALCULAR DISTANCIA DEL SERVICIO
  // ----------------------------------------------------------

  if (
    rastreandoServicio &&
    inicioServicioMs
  ) {

    if (
      accuracy <= 50 &&
      ultimaPosicion
    ) {

      const distancia =
        calcularDistanciaGPS(
          ultimaPosicion.lat,
          ultimaPosicion.lon,
          lat,
          lon
        );


      // Evitamos pequeños movimientos causados
      // por la imprecisión normal del GPS.

      if (
        distancia >= 2 &&
        distancia <= 300
      ) {

        distanciaMetros += distancia;

      }

    }

    if (accuracy <= 50) {

      ultimaPosicion = {
        lat,
        lon
      };

    }

    actualizarTaximetro();

  }


  // ----------------------------------------------------------
  // GUARDAR UBICACIÓN DEL CONDUCTOR
  // ----------------------------------------------------------

  try {

    await update(
      ref(
        db,
        `ubicacion_conductores/${CONDUCTOR_ID}`
      ),
      {

        latitud: lat,

        longitud: lon,

        ultima_actualizacion:
          obtenerHora()

      }
    );

  } catch (error) {

    console.error(
      "Error guardando GPS:",
      error
    );

  }

}


// ============================================================
// ERROR GPS
// ============================================================

function errorGPS(error) {

  console.error(
    "Error GPS:",
    error
  );


  let mensaje =
    "No se pudo obtener la ubicación.";


  if (error.code === 1) {

    mensaje =
      "Permiso de ubicación denegado.";

  }

  if (error.code === 2) {

    mensaje =
      "Ubicación no disponible.";

  }

  if (error.code === 3) {

    mensaje =
      "Tiempo agotado buscando GPS.";

  }


  actualizarEstadoGPS(mensaje);

}


// ============================================================
// DETENER GPS
// ============================================================

function detenerGPS() {

  if (gpsWatchId !== null) {

    navigator.geolocation.clearWatch(
      gpsWatchId
    );

    gpsWatchId = null;

  }

  actualizarEstadoGPS(
    "GPS desconectado"
  );

}


// ============================================================
// DESCONEXIÓN AUTOMÁTICA
// ============================================================

function configurarDesconexion() {

  const referencia =
    ref(
      db,
      `conductores/${CONDUCTOR_ID}/estado`
    );


  onDisconnect(referencia)
    .set("desconectado")
    .catch((error) => {

      console.error(
        "Error configurando desconexión:",
        error
      );

    });

}


// ============================================================
// DISTANCIA GPS - HAVERSINE
// ============================================================

function calcularDistanciaGPS(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371000;

  const rad =
    Math.PI / 180;

  const diferenciaLat =
    (lat2 - lat1) * rad;

  const diferenciaLon =
    (lon2 - lon1) * rad;

  const a =
    Math.sin(diferenciaLat / 2) *
    Math.sin(diferenciaLat / 2) +

    Math.cos(lat1 * rad) *
    Math.cos(lat2 * rad) *

    Math.sin(diferenciaLon / 2) *
    Math.sin(diferenciaLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;

}


// ============================================================
// ESTADO GPS
// ============================================================

function actualizarEstadoGPS(texto) {

  if (estadoGPS) {

    estadoGPS.textContent =
      texto;

  }

}


// ============================================================
// ESTADÍSTICAS
// ============================================================

function escucharEstadisticas() {

  const referencia =
    ref(db, "servicios");

  onValue(referencia, (snapshot) => {

    const servicios =
      snapshot.val() || {};

    let cantidad = 0;

    let generado = 0;


    Object.values(servicios).forEach(
      (servicio) => {

        if (
          servicio.conductor_id ===
            CONDUCTOR_ID &&
          servicio.estado ===
            "FINALIZADO"
        ) {

          cantidad++;

          generado +=
            Number(
              servicio.valor_total || 0
            );

        }

      }
    );


    if (totalServicios) {

      totalServicios.textContent =
        cantidad;

    }

    if (totalGenerado) {

      totalGenerado.textContent =
        formatoPesos(generado);

    }

  });

}


// ============================================================
// NOTIFICACIONES
// ============================================================

function mostrarNotificacion(mensaje) {

  if (!notificacion || !textoNotificacion) {

    return;

  }

  textoNotificacion.textContent =
    mensaje;

  notificacion.classList.add("mostrar");


  setTimeout(() => {

    notificacion.classList.remove(
      "mostrar"
    );

  }, 4000);

}


// ============================================================
// MENSAJE LOGIN
// ============================================================

function mostrarMensajeLogin(mensaje) {

  if (mensajeLogin) {

    mensajeLogin.textContent =
      mensaje;

  }

}


// ============================================================
// MOSTRAR / OCULTAR PANTALLAS
// ============================================================

function mostrarPantallaPrincipal(
  mostrar
) {

  if (pantallaLogin) {

    pantallaLogin.style.display =
      mostrar ? "none" : "block";

  }

  if (pantallaPrincipal) {

    pantallaPrincipal.style.display =
      mostrar ? "block" : "none";

  }

  if (appPrincipal) {

    appPrincipal.style.display =
      "block";

  }

}


// ============================================================
// FORMATO DE DINERO
// ============================================================

function formatoPesos(valor) {

  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }
  ).format(
    Math.round(valor)
  );

}


// ============================================================
// FORMATO DE TIEMPO
// ============================================================

function formatoTiempo(ms) {

  const totalSegundos =
    Math.floor(ms / 1000);

  const horas =
    Math.floor(
      totalSegundos / 3600
    );

  const minutos =
    Math.floor(
      (totalSegundos % 3600) / 60
    );

  const segundos =
    totalSegundos % 60;


  if (horas > 0) {

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

  }


  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

}


// ============================================================
// OBTENER HORA ACTUAL
// ============================================================

function obtenerHora() {

  const ahora =
    new Date();

  return ahora.toLocaleTimeString(
    "es-CO",
    {
      hour12: false
    }
  );

}


// ============================================================
// FIN
// ============================================================

console.log(
  "LO JUSTO - Aplicación del conductor iniciada."
);
