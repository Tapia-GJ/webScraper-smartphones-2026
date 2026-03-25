import { Page } from "playwright";
import logger from "../utils/logger";
import { config } from "../config";

/**
 * Módulo para extraer URLs de smartphones desde la página de listado de Kimovil
 * Este módulo navega la lista y extrae todos los enlaces a las páginas de detalle
 */
export class KimovilListPage {
  constructor(private page: Page) {}

  /**
   * Navega a la URL de Kimovil con los filtros aplicados
   */
  async navigateToList(): Promise<void> {
    try {
      logger.info("🌐 Navegando a la lista de Kimovil...");
      await this.page.goto(config.kimovilBaseUrl, {
        waitUntil: "domcontentloaded",
        timeout: config.timeouts.navigation,
      });

      // Esperamos a que el contenido principal cargue
      await this.page.waitForTimeout(2000);
      logger.info("✅ Página de listado cargada");
    } catch (error) {
      logger.error("❌ Error al navegar a la lista de Kimovil", { error });
      throw error;
    }
  }

  /**
   * Extrae todas las URLs de smartphones de la página actual
   * Kimovil usa un listado de tarjetas con enlaces a cada modelo
   *
   * Vamos a buscar patrones comunes:
   * - Enlaces dentro de elementos con clases tipo "product-card", "phone-item", etc.
   * - Atributos href que apuntan a rutas tipo "/es/smartphone/..."
   */
  async extractSmartphoneUrls(): Promise<string[]> {
    try {
      logger.info("🔍 Extrayendo URLs de smartphones...");

      // Estrategia: buscar todos los enlaces que contengan "/es/" seguido de alguna marca/modelo
      // Kimovil usa URLs del tipo: https://www.kimovil.com/es/donde-comprar-samsung-galaxy-s23
      const urls = await this.page.$$eval(
        'a[href*="/es/donde-comprar"]',
        (links) => {
          return links
            .map((link) => (link as HTMLAnchorElement).href)
            .filter((href) => href && href.includes("kimovil.com"));
        },
      );

      console.log(urls);

      // Eliminamos duplicados
      const uniqueUrls = [...new Set(urls)];

      logger.info(`✅ ${uniqueUrls.length} URLs únicas encontradas`);
      return uniqueUrls;
    } catch (error) {
      logger.error("❌ Error al extraer URLs", { error });
      throw error;
    }
  }

  /**
   * Maneja la paginación si existe
   * Muchos sitios tienen botones "Siguiente" o scroll infinito
   * Por ahora, implementamos solo la primera página
   * TODO: Implementar scroll infinito o siguiente página
   */
  async hasNextPage(): Promise<boolean> {
    try {
      // Buscar si existe un botón de "siguiente" o "cargar más"
      const nextButton = await this.page.$(
        'button:has-text("Cargar más"), a:has-text("Siguiente")',
      );
      return nextButton !== null;
    } catch (error) {
      logger.warn("⚠️ No se pudo verificar si hay más páginas", { error });
      return false;
    }
  }

  /**
   * Hace scroll hasta el final de la página
   * Útil para sitios con scroll infinito que cargan más contenido
   */
  async scrollToBottom(): Promise<void> {
    try {
      logger.info("📜 Haciendo scroll hasta el final de la página...");

      let previousHeight = 0;
      let currentHeight = await this.page.evaluate(
        () => document.body.scrollHeight,
      );

      // Seguimos scrolleando hasta que no cargue más contenido
      while (previousHeight !== currentHeight) {
        previousHeight = currentHeight;

        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        // Esperamos a que cargue el nuevo contenido
        await this.page.waitForTimeout(6000);

        currentHeight = await this.page.evaluate(
          () => document.body.scrollHeight,
        );
      }

      logger.info("✅ Scroll completado");
    } catch (error) {
      logger.error("❌ Error al hacer scroll", { error });
      throw error;
    }
  }
}
