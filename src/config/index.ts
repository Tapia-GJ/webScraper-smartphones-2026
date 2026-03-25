/**
 * Configuración centralizada del scraper
 * Si mañana cambian las URLs o necesitamos ajustar tiempos, tocamos solo acá
 */
export const config = {
  // URL base de Kimovil con el filtro aplicado por el usuario
  kimovilBaseUrl:
    "https://www.kimovil.com/es/comparar-moviles/i_m+code.Latam:Americ:NA:Intern:Global",

  // Timeouts (en milisegundos)
  timeouts: {
    navigation: 60000, // 60 segundos para que cargue una página completa
    element: 10000, // 10 segundos para esperar un elemento específico
    betweenRequests: 3000, // 3 segundos de pausa entre cada request (ser educados)
  },

  // Configuración de reintentos
  retries: {
    maxAttempts: 3, // Máximo de reintentos por página que falla
    delayMs: 5000, // 5 segundos de espera entre reintentos
  },

  // User-Agent para simular un navegador desde México (anti-detección + localización)
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

  // Configuración de geolocalización (México)
  locale: "es-MX", // Español de México
  timezone: "America/Mexico_City", // Zona horaria de México

  // Cookie para forzar la moneda a pesos mexicanos (MXN)
  currencyCookie: {
    name: "kmvcurrency", // Cookie que usa Kimovil para la moneda
    value: "MXN", // Código de moneda mexicana
    domain: ".kimovil.com",
    path: "/",
  },

  // Rutas de salida
  output: {
    csvPath: "./output/smartphone2.csv",
    logsPath: "./logs",
  },

  // Configuración del navegador
  browser: {
    headless: false, // En modo visible para aprender
    slowMo: 500, // Ralentiza las acciones 500ms para verlas mejor
  },
};
