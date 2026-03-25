/**
 * Interface que representa los datos de un smartphone extraídos del scraper
 * Todos los campos son obligatorios pero pueden ser "N/A" si no se encuentran
 */
export interface Smartphone {
  marca: string;
  modelo: string;
  procesador: string;
  tipoPantalla: string;
  ram: string;
  almacenamiento: string;
  camaraPrincipal: string;  // Megapixeles de la cámara trasera
  camaraFrontal: string;    // Megapixeles de la cámara frontal
  bateria: string;          // Capacidad en mAh
  precio: string;
  url: string;              // URL de donde se extrajo el dato
  fechaExtraccion: string;  // Timestamp de cuándo se hizo el scraping
}

/**
 * Resultado del proceso de scraping con metadatos
 */
export interface ScrapingResult {
  success: boolean;
  smartphone?: Smartphone;
  error?: string;
  retries?: number;
}
