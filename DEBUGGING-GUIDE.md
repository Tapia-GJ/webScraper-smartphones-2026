# 🎓 Guía de Depuración: Cómo Ajustar Selectores CSS/XPath

## El Problema Actual

Si ejecutaste el scraper (`npm run start`) y viste que todos los campos aparecen como `N/A`, es porque **los selectores CSS/XPath que escribí inicialmente son genéricos** y no coinciden con la estructura real del DOM de Kimovil.

**Esto es NORMAL y es parte del aprendizaje.** Los sitios web reales no siguen estándares; cada uno tiene su propia estructura HTML. La habilidad clave de un scraper exitoso es saber **inspeccionar el DOM y ajustar los selectores**.

---

## Paso 1: Ejecutar el Modo Debug

Abrí tu terminal en la carpeta del proyecto y ejecutá:

```bash
npm run debug
```

Esto va a:
1. Abrir un navegador Chromium con las DevTools activadas
2. Navegar a una página de ejemplo de Kimovil (ej: POCO F8 Ultra)
3. Detenerse ahí para que puedas inspeccionar el DOM manualmente

**El navegador va a quedarse abierto esperando. No lo cierres todavía.**

---

## Paso 2: Inspeccionar el DOM (La Parte Clave)

Ahora necesitás identificar dónde están realmente los datos en el HTML de Kimovil. Seguí estos pasos:

### 2.1 Abrir las DevTools

Si no se abrieron automáticamente, presioná **F12** en el navegador.

### 2.2 Encontrar el Modelo del Smartphone

1. En la página de Kimovil, vas a ver el nombre completo del celular (ej: "POCO F8 Ultra") en algún lugar visible.
2. Hacé **click derecho** sobre ese texto → **"Inspeccionar elemento"** (o "Inspect").
3. El panel de DevTools te va a mostrar exactamente qué etiqueta HTML contiene ese texto.

**Ejemplo:**
```html
<h1 class="phonename">POCO F8 Ultra</h1>
```

4. Ahora hacé click derecho sobre esa línea en las DevTools → **"Copy" → "Copy selector"**.
5. Esto te da el selector CSS exacto. Por ejemplo: `h1.phonename`

### 2.3 Encontrar el Procesador

1. Buscá visualmente en la página dónde dice el procesador (ej: "Snapdragon 8 Elite").
2. Hacé click derecho sobre ese texto → "Inspeccionar elemento".
3. Kimovil probablemente use una estructura tipo tabla o lista de definiciones. Ejemplo:

```html
<dl>
  <dt>Procesador</dt>
  <dd>Snapdragon 8 Elite</dd>
</dl>
```

4. En este caso, el selector XPath sería:
```
//dt[contains(text(), "Procesador")]/following-sibling::dd[1]
```

Esto significa: "Busca un `<dt>` que contenga el texto 'Procesador', y dame el primer `<dd>` que esté después de él".

### 2.4 Repetir para Todos los Campos

Hacé lo mismo para:
- **RAM** (ej: "12 GB")
- **Almacenamiento** (ej: "512 GB")
- **Batería** (ej: "5000 mAh")
- **Cámara Principal** (ej: "64 MP + 12 MP + 5 MP")
- **Cámara Frontal** (ej: "20 MP")
- **Tipo de Pantalla** (ej: "AMOLED")
- **Precio** (probablemente esté en una clase tipo `.price` o `.best-price`)

---

## Paso 3: Actualizar los Selectores en el Código

Una vez que tenés los selectores correctos, abrí el archivo:

```
src/pages/KimovilDetail.ts
```

### 3.1 Actualizar el Modelo

Buscá la función `extractModelo()` (alrededor de la línea 58). Cambiá el selector por el que encontraste:

```typescript
private async extractModelo(): Promise<string> {
  try {
    // CAMBIA ESTO por tu selector
    const modelo = await this.extractTextContent('h1.phonename'); // <-- Reemplaza con tu selector
    return modelo || 'N/A';
  } catch (error) {
    logger.warn('⚠️ No se pudo extraer el modelo', { error });
    return 'N/A';
  }
}
```

### 3.2 Actualizar el Procesador, RAM, etc.

Para los campos que usan la función `extractSpecByLabel()`, actualizá las **labels** (etiquetas) que buscan. Por ejemplo, si en Kimovil dice "CPU" en lugar de "Procesador":

```typescript
private async extractProcesador(): Promise<string> {
  try {
    // AGREGA o CAMBIA las labels según lo que viste en el DOM
    const procesador = await this.extractSpecByLabel(['CPU', 'Procesador', 'Chipset']);
    return procesador || 'N/A';
  } catch (error) {
    logger.warn('⚠️ No se pudo extraer el procesador', { error });
    return 'N/A';
  }
}
```

### 3.3 Si `extractSpecByLabel` No Funciona (Caso Avanzado)

Si Kimovil **no** usa una estructura de tabla (`<dt>/<dd>` o `<th>/<td>`), vas a tener que crear una lógica custom. Ejemplo:

```typescript
private async extractProcesador(): Promise<string> {
  try {
    // Selector directo si el procesador está en una clase específica
    const element = await this.page.locator('.spec-processor').first();
    if (await element.count() > 0) {
      const text = await element.textContent();
      return text?.trim() || 'N/A';
    }
    return 'N/A';
  } catch (error) {
    logger.warn('⚠️ No se pudo extraer el procesador', { error });
    return 'N/A';
  }
}
```

---

## Paso 4: Probar Nuevamente

Guardá los cambios en `KimovilDetail.ts` y ejecutá:

```bash
npm run start
```

Ahora el scraper debería extraer los datos reales en lugar de `N/A`.

---

## 🔍 Trucos y Consejos

### Selector CSS vs XPath: ¿Cuándo usar cada uno?

- **CSS Selector:** Usa cuando el elemento tiene una clase o ID fijo.
  ```typescript
  await page.locator('.price').textContent();
  ```

- **XPath:** Usa cuando necesitás buscar por texto o navegar relaciones complejas.
  ```typescript
  await page.locator('xpath=//dt[contains(text(), "RAM")]/following-sibling::dd').textContent();
  ```

### ¿Cómo saber si un selector funciona?

En las DevTools, presioná **Ctrl+F** en el panel de Elements y pegá tu selector. Si encuentra el elemento, el selector es correcto.

### ¿Qué pasa si un campo a veces aparece y a veces no?

Exactamente por eso usamos bloques `try/catch` individuales. Si un celular viejo no tiene el dato de "Cámara Frontal", el scraper pone `N/A` y sigue con el siguiente campo.

---

## 📚 Recursos

- **Playwright Locators:** https://playwright.dev/docs/locators
- **CSS Selectors Cheatsheet:** https://devhints.io/css
- **XPath Cheatsheet:** https://devhints.io/xpath

---

**Próximos Pasos:**
1. Ajusta los selectores usando esta guía
2. Ejecuta `npm run start` de nuevo
3. Verifica el archivo `output/smartphones.csv` para confirmar que los datos se extraen correctamente
4. Si algunos campos siguen en `N/A`, repite el proceso de depuración para esos campos específicos

¡Dale que podés! Esta es la habilidad más importante del scraping.
