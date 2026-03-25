import { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { config } from "./config";
import logger from "./utils/logger";
import { KimovilListPage } from "./pages/KimovilList";
import { KimovilDetailPage } from "./pages/KimovilDetail";
import { appendToCSV } from "./utils/csvWriter";
import { Smartphone } from "./types";

// Activamos el plugin de Stealth para evadir Cloudflare
chromium.use(stealthPlugin());

/**
 * ORQUESTADOR PRINCIPAL DEL SCRAPER
 *
 * Este es el corazón del bot. Coordina:
 * 1. Inicialización del navegador
 * 2. Extracción de URLs de la lista
 * 3. Navegación a cada detalle con reintentos
 * 4. Guardado en CSV
 * 5. Cierre limpio
 */

async function main() {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    logger.info("🚀 Iniciando scraper de Kimovil...");

    // 1. Inicializar el navegador
    browser = await chromium.launch({
      headless: config.browser.headless,
      slowMo: config.browser.slowMo,
    });

    // 2. Crear un contexto con User-Agent y localización de México
    context = await browser.newContext({
      userAgent: config.userAgent,
      viewport: { width: 1920, height: 1080 },
      locale: config.locale, // Español de México (es-MX)
      timezoneId: config.timezone, // Zona horaria de México
      geolocation: { longitude: -99.1332, latitude: 19.4326 }, // Ciudad de México
      permissions: ["geolocation"],
    });

    page = await context.newPage();

    // Agregar cookie para forzar la moneda a pesos mexicanos (MXN)
    await context.addCookies([
      {
        name: config.currencyCookie.name,
        value: config.currencyCookie.value,
        domain: config.currencyCookie.domain,
        path: config.currencyCookie.path,
      },
    ]);

    logger.info(
      "✅ Navegador inicializado correctamente (locale: es-MX, moneda: MXN)",
    );

    // 3. Navegar a la lista y extraer URLs
    const listPage = new KimovilListPage(page);
    await listPage.navigateToList();

    // Hacemos scroll para cargar todo el contenido (si usa scroll infinito)
    await listPage.scrollToBottom();

    const smartphoneUrls = await listPage.extractSmartphoneUrls();

    if (smartphoneUrls.length === 0) {
      logger.warn(
        "⚠️ No se encontraron URLs de smartphones. Verificar selectores.",
      );
      return;
    }

    logger.info(`📋 Total de smartphones a procesar: ${smartphoneUrls.length}`);

    // 4. Iterar sobre cada URL y extraer datos
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < smartphoneUrls.length; i++) {
      const url = smartphoneUrls[i];
      logger.info(`\n📱 Procesando ${i + 1}/${smartphoneUrls.length}: ${url}`);

      try {
        // Usar la función de reintentos para manejar fallos temporales
        const smartphone = await retryWithBackoff(
          async () => {
            const detailPage = new KimovilDetailPage(page!);
            await detailPage.navigateToDetail(url);
            return await detailPage.extractSmartphoneData(url);
          },
          config.retries.maxAttempts,
          config.retries.delayMs,
        );

        // Guardar en CSV inmediatamente (modo append)
        await appendToCSV(smartphone);
        successCount++;

        // Pausa educada entre requests
        logger.info(
          `⏳ Esperando ${config.timeouts.betweenRequests / 1000}s antes del próximo...`,
        );
        await page.waitForTimeout(config.timeouts.betweenRequests);
      } catch (error) {
        logger.error(`❌ Error al procesar ${url}`, { error });
        errorCount++;

        // Si hay demasiados errores consecutivos, tal vez estamos bloqueados
        if (errorCount > 5) {
          logger.error(
            "🚨 Demasiados errores consecutivos. Posible bloqueo. Deteniendo...",
          );
          break;
        }
      }
    }

    // 5. Resumen final
    logger.info("\n" + "=".repeat(60));
    logger.info("📊 RESUMEN DE EJECUCIÓN");
    logger.info("=".repeat(60));
    logger.info(`✅ Smartphones procesados exitosamente: ${successCount}`);
    logger.info(`❌ Errores: ${errorCount}`);
    logger.info(`📁 Archivo CSV: ${config.output.csvPath}`);
    logger.info("=".repeat(60));
  } catch (error) {
    logger.error("💥 Error fatal en el scraper", { error });
    throw error;
  } finally {
    // Limpieza: cerrar el navegador siempre
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
    logger.info("🔒 Navegador cerrado correctamente");
  }
}

/**
 * FUNCIÓN DE REINTENTOS CON BACKOFF EXPONENCIAL
 *
 * Esta es la clave de la resiliencia. Si una operación falla (ej. timeout),
 * la reintentamos automáticamente con pausas progresivas.
 *
 * @param fn - Función async a ejecutar
 * @param maxRetries - Número máximo de intentos
 * @param delayMs - Delay inicial en ms (se multiplica en cada reintento)
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`🔄 Intento ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`⚠️ Intento ${attempt} falló: ${lastError.message}`);

      if (attempt < maxRetries) {
        const waitTime = delayMs * attempt; // Backoff exponencial simple
        logger.info(`⏳ Esperando ${waitTime / 1000}s antes de reintentar...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // Si llegamos acá, todos los intentos fallaron
  logger.error(`💀 Todos los ${maxRetries} intentos fallaron`);
  throw lastError || new Error("Falló después de todos los reintentos");
}

// Ejecutar el scraper
main()
  .then(() => {
    logger.info("✅ Scraper finalizado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    logger.error("💥 El scraper terminó con errores", { error });
    process.exit(1);
  });
