import { Page } from "playwright";
import { Smartphone } from "../types";
import logger from "../utils/logger";
import { config } from "../config";

/**
 * Módulo para extraer datos detallados de un smartphone desde su página individual
 * Usa selectores CSS/XPath para encontrar cada campo específico
 */
export class KimovilDetailPage {
  constructor(private page: Page) {}

  /**
   * Navega a la página de detalle de un smartphone específico
   */
  async navigateToDetail(url: string): Promise<void> {
    try {
      logger.info(`🌐 Navegando a: ${url}`);
      await this.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: config.timeouts.navigation,
      });

      // Esperamos a que la página cargue completamente
      await this.page.waitForTimeout(1500);
    } catch (error) {
      logger.error(`❌ Error al navegar a ${url}`, { error });
      throw error;
    }
  }

  /**
   * Extrae todos los datos del smartphone de la página actual
   * Usa bloques try/catch individuales para cada campo, así si uno falla, seguimos con los demás
   */
  async extractSmartphoneData(url: string): Promise<Smartphone> {
    logger.info("🔍 Extrayendo datos del smartphone...");

    const smartphone: Smartphone = {
      marca: await this.extractMarca(),
      modelo: await this.extractModelo(),
      procesador: await this.extractProcesador(),
      tipoPantalla: await this.extractTipoPantalla(),
      ram: await this.extractRam(),
      almacenamiento: await this.extractAlmacenamiento(),
      camaraPrincipal: await this.extractCamaraPrincipal(),
      camaraFrontal: await this.extractCamaraFrontal(),
      bateria: await this.extractBateria(),
      precio: await this.extractPrecio(),
      url: url,
      fechaExtraccion: new Date().toISOString(),
    };

    logger.info(`✅ Datos extraídos: ${smartphone.marca} ${smartphone.modelo}`);
    return smartphone;
  }

  /**
   * Verifica en el DOM si el smartphone tiene más de 3 años de antigüedad
   * buscando el año en la fecha de presentación o lanzamiento.
   */
  async isOlderThan3Years(): Promise<boolean> {
    try {
      const labels = ["Presentación", "Fecha de presentación", "Release Date", "Lanzamiento"];
      const fecha = await this.extractSpecByLabel(labels);
      
      if (fecha) {
        // Buscamos un año de 4 dígitos en el texto
        const yearMatch = fecha.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          const year = parseInt(yearMatch[1], 10);
          const currentYear = new Date().getFullYear();
          if (currentYear - year >= 3) {
            logger.warn(`⚠️ Teléfono con 3 o más años detectado (Año: ${year}).`);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      logger.warn("⚠️ Error al verificar antigüedad del teléfono", { error });
      return false;
    }
  }

  /**
   * Extrae la marca del smartphone
   * Kimovil suele tener la marca como parte del título o en un breadcrumb
   */
  private async extractMarca(): Promise<string> {
    try {
      // Estrategia 1: buscar en el título (ej: "Samsung Galaxy S23")
      const title = await this.extractSpecByLabel(["Marca"]);
      if (title) {
        // Extraemos la primera palabra (normalmente es la marca)
        const marca = title.split(" ")[0];
        return marca || "N/A";
      }
      return "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer la marca", { error });
      return "N/A";
    }
  }

  /**
   * Extrae el modelo completo del smartphone
   */
  private async extractModelo(): Promise<string> {
    try {
      // Estrategia 1: Extraer el título completo del h1 o del link principal
      const modelo = await this.extractTextContent("#sec-start");
      return modelo || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer el modelo", { error });
      return "N/A";
    }
  }

  /**
   * Extrae el procesador
   * Busca en la tabla de especificaciones por palabras clave como "Procesador", "CPU", "Chipset"
   */
  private async extractProcesador(): Promise<string> {
    try {
      const procesador = await this.extractTextContent(
        "#margin > div.kiui-sticky-sidebar-wrapper.lay-wrapper.k-sticky-sidebar-right > div > article > section.kc-container.white.container-sheet-hardware > div.wrapper > table:nth-child(3) > tbody > tr:nth-child(1) > td",
      );
      return procesador || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer el procesador", { error });
      return "N/A";
    }
  }

  /**
   * Extrae el tipo de pantalla (AMOLED, IPS, LCD, etc.)
   */
  private async extractTipoPantalla(): Promise<string> {
    try {
      const pantalla = await this.extractTextContent(
        '//*[@id="margin"]/div[3]/div/article/section[2]/div/table[4]/tbody/tr[2]/td',
      );
      return pantalla || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer el tipo de pantalla", { error });
      return "N/A";
    }
  }

  /**
   * Extrae la RAM
   */
  private async extractRam(): Promise<string> {
    try {
      const ram = await this.extractSpecByLabel(["RAM", "Memoria RAM"]);
      return ram || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer la RAM", { error });
      return "N/A";
    }
  }

  /**
   * Extrae el almacenamiento interno
   */
  private async extractAlmacenamiento(): Promise<string> {
    try {
      const storage = await this.extractTextContent(
        '//*[@id="margin"]/div[3]/div/article/section[3]/div[1]/table[5]/tbody/tr[1]/td',
      );
      return storage || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer el almacenamiento", { error });
      return "N/A";
    }
  }

  /**
   * Extrae los megapixeles de la cámara principal
   */
  private async extractCamaraPrincipal(): Promise<string> {
    try {
      const camera = await this.extractTextContent(
        '//*[@id="margin"]/div[3]/div/article/section[4]/div/div[1]/div[1]/table/tbody/tr[2]/td',
      );
      return camera || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer la cámara principal", { error });
      return "N/A";
    }
  }

  /**
   * Extrae los megapixeles de la cámara frontal
   */
  private async extractCamaraFrontal(): Promise<string> {
    try {
      const camera = await this.extractTextContent(
        '//*[@id="margin"]/div[3]/div/article/section[4]/div/div[2]/div/table/tbody/tr[1]/td',
      );
      return camera || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer la cámara frontal", { error });
      return "N/A";
    }
  }

  /**
   * Extrae la capacidad de la batería
   */
  private async extractBateria(): Promise<string> {
    try {
      const battery = await this.extractTextContent(
        '//*[@id="margin"]/div[3]/div/article/section[7]/div/table[1]/tbody/tr[1]/td/a/div',
      );
      return battery || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer la batería", { error });
      return "N/A";
    }
  }

  /**
   * Extrae el precio
   * Kimovil muestra precios desde distintas tiendas, tomamos el más bajo
   */
  private async extractPrecio(): Promise<string> {
    try {
      const precio = await this.extractTextContent(
        '.price, .best-price, [itemprop="price"]',
      );
      return precio || "N/A";
    } catch (error) {
      logger.warn("⚠️ No se pudo extraer el precio", { error });
      return "N/A";
    }
  }

  /**
   * Función auxiliar: busca una especificación por su etiqueta (ej: "Procesador")
   * Kimovil usa tablas o listas con estructura tipo: <label>Procesador</label><value>Snapdragon 8 Gen 2</value>
   */
  private async extractSpecByLabel(labels: string[]): Promise<string | null> {
    try {
      // Intentamos encontrar el elemento que contiene alguna de las labels
      for (const label of labels) {
        // Estrategia 1: Buscar usando XPath (más flexible para buscar por texto)
        const xpath = `//dt[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${label.toLowerCase()}')]/following-sibling::dd[1]`;
        const element = await this.page.locator(`xpath=${xpath}`).first();

        if ((await element.count()) > 0) {
          const text = await element.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }

        // Estrategia 2: Buscar en estructura tipo tabla (th + td)
        const xpathTable = `//th[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${label.toLowerCase()}')]/following-sibling::td[1]`;
        const elementTable = await this.page
          .locator(`xpath=${xpathTable}`)
          .first();

        if ((await elementTable.count()) > 0) {
          const text = await elementTable.textContent();
          if (text && text.trim()) {
            return text.trim();
          }
        }
      }

      return null;
    } catch (error) {
      logger.debug(`No se encontró especificación para: ${labels.join(", ")}`, {
        error,
      });
      return null;
    }
  }

  /**
   * Función auxiliar: extrae el texto de un elemento usando un selector CSS
   */
  private async extractTextContent(selector: string): Promise<string | null> {
    try {
      const element = await this.page.locator(selector).first();
      if ((await element.count()) > 0) {
        const text = await element.textContent();
        return text?.trim() || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
