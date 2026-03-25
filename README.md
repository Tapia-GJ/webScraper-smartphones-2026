# Web Scraper de Smartphones con Playwright + TypeScript

## 📚 Proyecto Educativo: Aprende Web Scraping Profesional

Este proyecto es un **web scraper completo** construido para extraer datos de smartphones (modelo, procesador, RAM, batería, etc.) desde **Kimovil**, usando **Playwright** (motor de navegador automatizado) y **TypeScript** (tipado fuerte).

**Objetivo educativo:** Aprender los conceptos clave de cómo construir un bot/scraper profesional, entender la estructura de un proyecto real, y dominar la depuración de fallas comunes (timeouts, cambios de UI, reintentos).

---

## 🏗️ Arquitectura del Proyecto

```
scraper-smarthphones-last3years/
├── src/
│   ├── config/
│   │   └── index.ts         # Configuración centralizada (URLs, timeouts, reintentos)
│   ├── types/
│   │   └── index.ts         # Interfaces TypeScript (Smartphone, ScrapingResult)
│   ├── utils/
│   │   ├── logger.ts        # Sistema de logs profesional (winston)
│   │   └── csvWriter.ts     # Escritura de CSV con escape de caracteres
│   ├── pages/
│   │   ├── KimovilList.ts   # Extracción de URLs de la lista
│   │   └── KimovilDetail.ts # Extracción de datos individuales de cada smartphone
│   ├── index.ts             # Orquestador principal (punto de entrada)
│   └── debug.ts             # Script de depuración para inspeccionar el DOM
├── output/                  # Carpeta donde se guarda el CSV generado
├── logs/                    # Logs de ejecución (errores y eventos)
├── package.json
├── tsconfig.json
└── README.md
```

### **Separación de Responsabilidades (Clean Architecture)**

- **`config/`**: Todas las URLs, tiempos máximos y configuración en un solo lugar. Si cambia la URL o necesitás ajustar el timeout, tocás un solo archivo.
- **`types/`**: Contratos de datos usando interfaces TypeScript. El compilador te obliga a mantener la consistencia.
- **`utils/`**: Lógica reutilizable (logs y escritura de archivos).
- **`pages/`**: Page Object Model (POM). Cada "página" del sitio tiene su propio módulo con los selectores y lógica de extracción.

---

## 🚀 Cómo Usar Este Scraper

### 1. Instalar Dependencias

```bash
npm install
```

Esto instala:
- **Playwright**: Motor de automatización de navegadores (Chromium, Firefox, WebKit)
- **TypeScript**: Compilador y sistema de tipado
- **Winston**: Logger profesional
- **ts-node**: Para ejecutar TypeScript directamente sin compilar

### 2. **🇲🇽 Configuración de Localización (México)**

El scraper está configurado por defecto para **México**:
- ✅ Precios en **pesos mexicanos (MXN)**
- ✅ Idioma: Español de México (es-MX)
- ✅ Zona horaria: America/Mexico_City
- ✅ Geolocalización: Ciudad de México

**Para cambiar a otro país** (Colombia, Argentina, España, etc.), lee el archivo **`MEXICO-LOCALE.md`** que explica cómo modificar la configuración.

### 3. Ejecutar el Scraper Completo

```bash
npm run start
```

Esto va a:
1. Abrir un navegador Chromium (visible, en modo lento para que lo veas)
2. Navegar a la lista de Kimovil con los filtros aplicados
3. Extraer todas las URLs de smartphones
4. Visitar cada URL, extraer los datos (marca, modelo, procesador, **precio en MXN**, etc.)
5. Guardar los resultados en `output/smartphones.csv`

**NOTA:** La primera ejecución puede tardar unos minutos (depende de cuántos smartphones haya en la lista).

### 3. Modo Debug (Inspección Manual del DOM)

```bash
npm run debug
```

Este comando es **FUNDAMENTAL para aprender a depurar**. Abre el navegador en una página de ejemplo de Kimovil y se detiene, dejándote inspeccionar el HTML real con las DevTools del navegador.

**¿Por qué es importante?**
Los sitios web cambian constantemente. Si los selectores CSS/XPath dejan de funcionar, usás este modo para:
1. Ver exactamente cómo está estructurado el DOM
2. Identificar los selectores correctos (click derecho > "Inspeccionar elemento")
3. Actualizar los selectores en `src/pages/KimovilDetail.ts`

---

## 🔍 Conceptos Clave que Vas a Aprender

### 1. **Async/Await y Promesas**

Todo el scraping es asíncrono (esperamos a que las páginas carguen). Fijate cómo usamos `async/await` en cada función:

```typescript
async function navigateToList(): Promise<void> {
  await this.page.goto(config.kimovilBaseUrl, {
    waitUntil: 'domcontentloaded',
    timeout: config.timeouts.navigation
  });
}
```

### 2. **Selectores CSS y XPath**

Para extraer datos del DOM, necesitamos "selectores" que identifiquen los elementos HTML. Por ejemplo:

```typescript
// CSS Selector
const modelo = await page.locator('h1.name').textContent();

// XPath (más potente para buscar por texto)
const procesador = await page.locator('xpath=//dt[contains(text(), "Procesador")]/following-sibling::dd').textContent();
```

### 3. **Manejo de Errores y Reintentos**

En scraping real, las páginas fallan (timeouts, conexiones lentas). Implementamos un sistema de **reintentos automáticos con backoff exponencial**:

```typescript
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < maxRetries) {
        await sleep(delayMs * attempt); // Espera progresivamente más tiempo
      }
    }
  }
  throw new Error('Todos los reintentos fallaron');
}
```

### 4. **Resiliencia ante Cambios de UI**

Si mañana Kimovil cambia la clase CSS de un elemento, el scraper no debería explotar completamente. Por eso usamos bloques `try/catch` individuales para cada campo:

```typescript
private async extractProcesador(): Promise<string> {
  try {
    const procesador = await this.extractSpecByLabel(['Procesador', 'CPU', 'Chipset']);
    return procesador || 'N/A';
  } catch (error) {
    logger.warn('⚠️ No se pudo extraer el procesador', { error });
    return 'N/A'; // No rompe todo, solo marca como N/A
  }
}
```

### 5. **Logs Profesionales**

Usamos **Winston** para registrar todo lo que hace el bot. Los logs se guardan en:
- `logs/combined.log`: Todos los eventos
- `logs/error.log`: Solo errores

Esto es CRÍTICO para depurar cuando algo falla a las 3 AM.

---

## 🛠️ Cómo Depurar Fallas Comunes

### ❌ Problema: "El scraper devuelve N/A en todos los campos"

**Causa:** Los selectores CSS/XPath no están encontrando los elementos en el DOM.

**Solución:**
1. Ejecuta `npm run debug`
2. Con el navegador abierto, presiona F12 para abrir las DevTools
3. Haz click derecho en el elemento que querés extraer > "Inspeccionar elemento"
4. Copia el selector CSS o XPath correcto
5. Actualiza los selectores en `src/pages/KimovilDetail.ts`

### ❌ Problema: "TimeoutError: Waiting for selector timed out"

**Causa:** El elemento tardó más del tiempo máximo en aparecer (o no existe).

**Solución:**
1. Aumenta el timeout en `src/config/index.ts`:
   ```typescript
   timeouts: {
     element: 20000, // De 10s a 20s
   }
   ```
2. O verifica que el selector sea correcto (puede que el elemento haya cambiado de clase/id).

### ❌ Problema: "403 Forbidden o Cloudflare Block"

**Causa:** El sitio detectó que sos un bot (demasiadas requests rápidas).

**Solución:**
1. Aumenta el tiempo entre requests en `src/config/index.ts`:
   ```typescript
   timeouts: {
     betweenRequests: 5000 // De 3s a 5s
   }
   ```
2. Cambia el User-Agent a uno más reciente.

---

## 📖 Recursos para Seguir Aprendiendo

- **Playwright Docs:** https://playwright.dev/
- **Selectores CSS:** https://developer.mozilla.org/es/docs/Web/CSS/CSS_Selectors
- **XPath Tutorial:** https://www.w3schools.com/xml/xpath_intro.asp
- **Winston (Logger):** https://github.com/winstonjs/winston

---

## 🎯 Próximos Pasos

1. **Ajusta los selectores** usando `npm run debug` para que extraiga datos reales
2. **Agrega filtros por fecha** (solo celulares de los últimos 3 años)
3. **Implementa GSMArena** como segunda fuente de datos (siguiendo la misma arquitectura)
4. **Agrega una base de datos SQLite** para almacenar los datos en lugar de CSV

---

## 🤝 Contribuciones

Este es un proyecto educativo. Si encontrás bugs o mejoras, abrí un issue o hacé un pull request.

---

**Autor:** Proyecto de aprendizaje de web scraping profesional  
**Licencia:** MIT
