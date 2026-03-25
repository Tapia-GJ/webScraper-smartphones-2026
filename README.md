# Smartphone Web Scraper with Playwright + TypeScript

## 📚 Educational Project: Learn Professional Web Scraping

This project is a **complete web scraper** built to extract smartphone data (model, processor, RAM, battery, etc.) from **Kimovil**, using **Playwright** (an automated browser engine) and **TypeScript**.

**Educational goal:** Learn the key concepts behind building a professional bot/scraper, understand the structure of a real project, and master debugging common failures (timeouts, UI changes, retries).

---

## 🏗️ Project Architecture

```
scraper-smarthphones-last3years/
├── src/
│   ├── config/
│   │   └── index.ts         # Centralized configuration (URLs, timeouts, retries)
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces (Smartphone, ScrapingResult)
│   ├── utils/
│   │   ├── logger.ts        # Professional logging system (winston)
│   │   └── csvWriter.ts     # CSV writing with character escaping
│   ├── pages/
│   │   ├── KimovilList.ts   # URL extraction from the listing
│   │   └── KimovilDetail.ts # Extraction of individual data for each smartphone
│   ├── index.ts             # Main orchestrator (entry point)
│   └── debug.ts             # Debug script to inspect the DOM
├── output/                  # Folder where the generated CSV is saved
├── logs/                    # Execution logs (errors and events)
├── package.json
├── tsconfig.json
└── README.md
```

### **Separation of Responsibilities (Clean Architecture)**

- **`config/`**: All URLs, maximum wait times, and configuration in one place. If the URL changes or you need to adjust a timeout, you only touch one file.
- **`types/`**: Data contracts using TypeScript interfaces. The compiler forces you to keep consistency.
- **`utils/`**: Reusable logic (logging and file writing).
- **`pages/`**: Page Object Model (POM). Each site "page" has its own module with selectors and extraction logic.

---

## 🚀 How to Use This Scraper

### 1. Install Dependencies

```bash
npm install
```

This installs:

- **Playwright**: Browser automation engine (Chromium, Firefox, WebKit)
- **TypeScript**: Compiler and type system
- **Winston**: Professional logger
- **ts-node**: To run TypeScript directly without compiling

### 2. **🇲🇽 Localization Settings (Mexico)**

The scraper is configured by default for **Mexico**:

- Prices in **Mexican pesos (MXN)**
- Language: Mexican Spanish (es-MX)
- Time zone: America/Mexico_City
- Geolocation: Mexico City

**To switch to another country** (Colombia, Argentina, Spain, etc.), read **`MEXICO-LOCALE.md`**, which explains how to modify the configuration.

### 3. Run the Full Scraper

```bash
npm run start
```

This will:

1. Open a Chromium browser (visible, in slow mode so you can watch it)
2. Navigate to the Kimovil listing with the applied filters
3. Extract all smartphone URLs
4. Visit each URL and extract the data (brand, model, processor, **price in MXN**, etc.)
5. Save the results to `output/smartphones.csv`

**NOTE:** The first run may take a few minutes (depending on how many smartphones are in the listing).

## 🤝 Contributions

This is an educational project. If you find bugs or improvements, open an issue or submit a pull request.
