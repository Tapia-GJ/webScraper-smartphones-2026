# Web Scraper de Smartphones con Playwright + TypeScript

## 📚 Proyecto Educativo: Aprende Web Scraping Profesional

Este proyecto es un **web scraper completo** construido para extraer datos de smartphones (modelo, procesador, RAM, batería, etc.) desde **Kimovil**, usando **Playwright** (motor de navegador automatizado) y **TypeScript** .

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

## 🤝 Contribuciones

Este es un proyecto educativo. Si encontrás bugs o mejoras, abrí un issue o haz un pull request.
