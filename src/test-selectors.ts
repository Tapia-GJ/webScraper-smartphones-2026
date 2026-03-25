import { chromium } from "playwright-extra";
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from "./config";
import { KimovilDetailPage } from "./pages/KimovilDetail";

// Activamos el plugin de Stealth para evadir Cloudflare
chromium.use(stealthPlugin());

/**
 * TEST DE SELECTORES - Verifica qué datos se están extrayendo correctamente
 *
 * Este script ejecuta la extracción de datos en UNA SOLA página de prueba
 * y te muestra exactamente qué valores encontró para cada campo.
 *
 * Úsalo para verificar si tus selectores están funcionando sin tener que
 * esperar a que procese 81 smartphones.
 */

async function testSelectors() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    userAgent: config.userAgent,
    viewport: { width: 1920, height: 1080 },
    locale: config.locale, // Español de México (es-MX)
    timezoneId: config.timezone, // Zona horaria de México
    geolocation: { longitude: -99.1332, latitude: 19.4326 }, // Ciudad de México
    permissions: ["geolocation"],
  });

  const page = await context.newPage();

  // Agregar cookie para forzar la moneda a pesos mexicanos (MXN)
  await context.addCookies([
    {
      name: config.currencyCookie.name,
      value: config.currencyCookie.value,
      domain: config.currencyCookie.domain,
      path: config.currencyCookie.path,
    },
  ]);

  // URL de prueba (puedes cambiarla por cualquier smartphone de Kimovil)
  const testUrl = "https://www.kimovil.com/es/donde-comprar-oneplus-nord-5";

  console.log("\n" + "=".repeat(80));
  console.log("🧪 TEST DE SELECTORES (México 🇲🇽 - MXN)");
  console.log("=".repeat(80));
  console.log(`📱 Probando con: ${testUrl}\n`);

  try {
    const detailPage = new KimovilDetailPage(page);
    await detailPage.navigateToDetail(testUrl);

    console.log("🔍 Extrayendo datos...\n");

    const smartphone = await detailPage.extractSmartphoneData(testUrl);

    // Mostrar los resultados de forma visual
    console.log("📊 RESULTADOS DE LA EXTRACCIÓN:");
    console.log("=".repeat(80));

    const fields = [
      { label: "Marca", value: smartphone.marca },
      { label: "Modelo", value: smartphone.modelo },
      { label: "Procesador", value: smartphone.procesador },
      { label: "Tipo de Pantalla", value: smartphone.tipoPantalla },
      { label: "RAM", value: smartphone.ram },
      { label: "Almacenamiento", value: smartphone.almacenamiento },
      { label: "Cámara Principal", value: smartphone.camaraPrincipal },
      { label: "Cámara Frontal", value: smartphone.camaraFrontal },
      { label: "Batería", value: smartphone.bateria },
      { label: "Precio", value: smartphone.precio },
    ];

    fields.forEach((field) => {
      const status = field.value === "N/A" ? "❌" : "✅";
      console.log(`${status} ${field.label.padEnd(20)}: ${field.value}`);
    });

    console.log("=".repeat(80));

    // Contar cuántos campos se extrajeron correctamente
    const successCount = fields.filter((f) => f.value !== "N/A").length;
    const totalFields = fields.length;

    console.log(
      `\n📈 Tasa de éxito: ${successCount}/${totalFields} campos extraídos correctamente`,
    );

    if (successCount === 0) {
      console.log("\n⚠️  NINGÚN CAMPO SE EXTRAJO CORRECTAMENTE");
      console.log(
        "Esto significa que los selectores no están encontrando los elementos.",
      );
      console.log("\n💡 Pasos siguientes:");
      console.log("1. Ejecuta: npm run debug");
      console.log("2. Inspecciona el DOM manualmente (F12)");
      console.log("3. Actualiza los selectores en src/pages/KimovilDetail.ts");
      console.log("4. Vuelve a ejecutar: npm run test-selectors");
    } else if (successCount < totalFields) {
      console.log("\n⚠️  ALGUNOS CAMPOS FALTAN");
      console.log("Revisa los selectores de los campos marcados con ❌");
    } else {
      console.log("\n🎉 ¡PERFECTO! Todos los selectores están funcionando.");
      console.log("Ya puedes ejecutar el scraper completo: npm run start");
    }

    console.log("\n" + "=".repeat(80));
  } catch (error) {
    console.error("💥 Error durante la prueba:", error);
  } finally {
    console.log("\n⏳ Cerrando navegador en 5 segundos...");
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testSelectors().catch(console.error);
