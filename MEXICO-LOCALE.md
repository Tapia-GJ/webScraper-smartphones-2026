# 🇲🇽 Configuración de Localización Mexicana

## Cómo Funciona

El scraper ahora está configurado para **simular que navegas desde México**, lo que hace que Kimovil te muestre:
- ✅ Precios en **pesos mexicanos (MXN)** en lugar de euros
- ✅ Idioma en español de México (es-MX)
- ✅ Zona horaria de México (America/Mexico_City)
- ✅ Geolocalización de Ciudad de México

---

## Configuración Aplicada

### 1. **Locale y Zona Horaria**

En `src/config/index.ts`:
```typescript
locale: 'es-MX',                    // Español de México
timezone: 'America/Mexico_City',    // Zona horaria CDMX
```

### 2. **Geolocalización (Coordenadas de CDMX)**

En `src/index.ts`, `src/debug.ts`, y `src/test-selectors.ts`:
```typescript
geolocation: { longitude: -99.1332, latitude: 19.4326 }, // Ciudad de México
permissions: ['geolocation']
```

### 3. **Cookie de Moneda (La Clave)**

Kimovil guarda la preferencia de moneda en una cookie llamada `kmvcurrency`. La configuración fuerza el valor a `MXN`:

```typescript
currencyCookie: {
  name: 'kmvcurrency',     // Nombre de la cookie
  value: 'MXN',            // Código ISO de pesos mexicanos
  domain: '.kimovil.com',
  path: '/'
}
```

Esta cookie se agrega **antes** de navegar a cualquier página:
```typescript
await context.addCookies([{
  name: config.currencyCookie.name,
  value: config.currencyCookie.value,
  domain: config.currencyCookie.domain,
  path: config.currencyCookie.path
}]);
```

---

## Cómo Cambiar a Otra Moneda/País

Si querés configurar el scraper para otro país (ej: Colombia, Argentina, España), solo tenés que cambiar estos valores en `src/config/index.ts`:

### Ejemplo: Colombia (COP - Pesos Colombianos)

```typescript
locale: 'es-CO',                          // Español de Colombia
timezone: 'America/Bogota',               // Zona horaria Bogotá

currencyCookie: {
  name: 'kmvcurrency',
  value: 'COP',                           // Pesos colombianos
  domain: '.kimovil.com',
  path: '/'
},
```

Y en los archivos TypeScript (index.ts, debug.ts, test-selectors.ts), cambiá la geolocalización:
```typescript
geolocation: { longitude: -74.0721, latitude: 4.7110 }, // Bogotá
```

### Ejemplo: Argentina (ARS - Pesos Argentinos)

```typescript
locale: 'es-AR',                          // Español de Argentina
timezone: 'America/Argentina/Buenos_Aires',

currencyCookie: {
  name: 'kmvcurrency',
  value: 'ARS',                           // Pesos argentinos
  domain: '.kimovil.com',
  path: '/'
},
```

Geolocalización:
```typescript
geolocation: { longitude: -58.3816, latitude: -34.6037 }, // Buenos Aires
```

### Ejemplo: España (EUR - Euros)

```typescript
locale: 'es-ES',                          // Español de España
timezone: 'Europe/Madrid',

currencyCookie: {
  name: 'kmvcurrency',
  value: 'EUR',                           // Euros
  domain: '.kimovil.com',
  path: '/'
},
```

Geolocalización:
```typescript
geolocation: { longitude: -3.7038, latitude: 40.4168 }, // Madrid
```

---

## Códigos de Moneda ISO 4217 (Más Comunes)

| País | Código | Moneda |
|------|--------|--------|
| México | MXN | Peso mexicano |
| Colombia | COP | Peso colombiano |
| Argentina | ARS | Peso argentino |
| Chile | CLP | Peso chileno |
| Perú | PEN | Sol |
| España | EUR | Euro |
| Estados Unidos | USD | Dólar estadounidense |
| Brasil | BRL | Real brasileño |

Lista completa: https://en.wikipedia.org/wiki/ISO_4217

---

## Verificar Que Funciona

Ejecutá:
```bash
npm run test-selectors
```

En los resultados, el campo **Precio** debería mostrar la moneda configurada. Por ejemplo:
- México: `MX$ 13943`
- Colombia: `$ 3.800.000` (COP)
- España: `550 €`

---

## Notas Técnicas

### ¿Por qué la cookie es necesaria?

Aunque configuramos la geolocalización (coordenadas GPS) y el locale (es-MX), Kimovil **no cambia automáticamente la moneda solo por eso**. El sitio usa una cookie llamada `kmvcurrency` para recordar tu preferencia de moneda. Al inyectar esta cookie antes de navegar, forzamos a Kimovil a mostrar los precios en la moneda que queremos.

### ¿Qué pasa si Kimovil no tiene precios en esa moneda?

Si la moneda configurada no está disponible para un producto específico, Kimovil puede mostrar "No disponible" o caer de nuevo a euros (EUR). Esto es normal y depende de qué tiendas tienen stock de ese modelo.

---

## Troubleshooting

### Problema: Los precios siguen apareciendo en euros

**Causa:** La cookie no se está aplicando correctamente o el dominio es incorrecto.

**Solución:**
1. Verifica que el dominio sea `.kimovil.com` (con el punto al inicio)
2. Asegurate de que la cookie se agrega **antes** de navegar (ver línea `await context.addCookies(...)`)
3. Ejecuta `npm run debug` y abre las DevTools > Application > Cookies para verificar que la cookie `kmvcurrency` esté presente

### Problema: La geolocalización no funciona

**Causa:** El sitio no usa geolocalización para determinar la moneda.

**Solución:** Kimovil usa la **cookie** principalmente, no la geolocalización. Asegurate de que la cookie `kmvcurrency` esté configurada correctamente.

---

¡Listo! Ahora tu scraper está completamente localizado para México. Podés ejecutar `npm run start` y todos los precios se guardarán en pesos mexicanos (MXN) en el CSV final.
