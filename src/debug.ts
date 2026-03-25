import { chromium } from "playwright-extra";
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from "./config";

// Activamos el plugin de Stealth para evadir Cloudflare
chromium.use(stealthPlugin());

/**
 * SCRIPT DE DEBUG - Inspección manual del DOM
 *
 * Este script abre el navegador, navega a una página de detalle específica de Kimovil,
 * y se DETIENE para que puedas inspeccionar manualmente el DOM con las DevTools del navegador.
 *
 * Usalo así:
 * 1. Ejecuta: npm run debug
 * 2. El navegador se abre y se queda esperando (no cierra automáticamente).
 * 3. Haz click derecho > "Inspeccionar elemento" en el navegador para ver el HTML real.
 * 4. Identifica los selectores CSS/XPath correctos para cada campo.
 * 5. Actualiza los selectores en src/pages/KimovilDetail.ts
 */

async function debugDOM() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    userAgent: config.userAgent,
    viewport: { width: 1920, height: 1080 },
    locale: config.locale,           // Español de México (es-MX)
    timezoneId: config.timezone,     // Zona horaria de México
    geolocation: { longitude: -99.1332, latitude: 19.4326 }, // Ciudad de México
    permissions: ['geolocation']
  });

  const page = await context.newPage();

  // Agregar cookie para forzar la moneda a pesos mexicanos (MXN)
  await context.addCookies([{
    name: config.currencyCookie.name,
    value: config.currencyCookie.value,
    domain: config.currencyCookie.domain,
    path: config.currencyCookie.path
  }]);

  // Navega a una página de detalle de ejemplo
  const testUrl = "https://www.kimovil.com/es/donde-comprar-poco-f8-ultra";
  console.log(`🔍 Navegando a: ${testUrl} (Moneda: MXN 🇲🇽)`);

  await page.goto(testUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  console.log("\n" + "=".repeat(80));
  console.log("📋 INSTRUCCIONES DE DEBUG:");
  console.log("=".repeat(80));
  console.log("1. El navegador está abierto y esperando.");
  console.log("2. Usa las DevTools (F12) para inspeccionar el DOM.");
  console.log("3. Busca los elementos que contienen:");
  console.log('   - Marca (ej: "POCO")');
  console.log('   - Modelo (ej: "F8 Ultra")');
  console.log('   - Procesador (ej: "Snapdragon 8 Elite")');
  console.log('   - Pantalla (ej: "AMOLED")');
  console.log('   - RAM (ej: "12 GB")');
  console.log('   - Almacenamiento (ej: "512 GB")');
  console.log('   - Cámara Principal (ej: "64 MP")');
  console.log('   - Cámara Frontal (ej: "20 MP")');
  console.log('   - Batería (ej: "5000 mAh")');
  console.log("   - Precio");
  console.log("4. Anota los selectores CSS o XPath de cada uno.");
  console.log(
    "5. Actualiza src/pages/KimovilDetail.ts con los selectores correctos.",
  );
  console.log(
    '\n💡 TIP: Haz click derecho en un elemento > "Copy" > "Copy selector" o "Copy XPath"',
  );
  console.log("=".repeat(80));
  console.log("\n⏸️  Presiona Ctrl+C para cerrar el navegador y terminar.");

  // Mantener el navegador abierto indefinidamente para inspección manual
  await new Promise(() => {}); // Never resolves
}

debugDOM().catch(console.error);
