import * as fs from 'fs';
import * as path from 'path';
import { Smartphone } from '../types';
import { config } from '../config';
import logger from './logger';

/**
 * Convierte un array de Smartphones a formato CSV y lo guarda en disco
 * Si el archivo ya existe, lo sobreescribe
 */
export async function saveToCSV(smartphones: Smartphone[]): Promise<void> {
  try {
    // Definimos las columnas del CSV
    const headers = [
      'Marca',
      'Modelo',
      'Procesador',
      'Tipo de Pantalla',
      'RAM',
      'Almacenamiento',
      'Cámara Principal (MP)',
      'Cámara Frontal (MP)',
      'Batería (mAh)',
      'Precio',
      'URL',
      'Fecha de Extracción'
    ];

    // Construimos las filas del CSV
    const rows = smartphones.map(phone => [
      escapeCsvValue(phone.marca),
      escapeCsvValue(phone.modelo),
      escapeCsvValue(phone.procesador),
      escapeCsvValue(phone.tipoPantalla),
      escapeCsvValue(phone.ram),
      escapeCsvValue(phone.almacenamiento),
      escapeCsvValue(phone.camaraPrincipal),
      escapeCsvValue(phone.camaraFrontal),
      escapeCsvValue(phone.bateria),
      escapeCsvValue(phone.precio),
      escapeCsvValue(phone.url),
      escapeCsvValue(phone.fechaExtraccion)
    ]);

    // Armamos el contenido completo: headers + rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Nos aseguramos de que la carpeta de output exista
    const outputDir = path.dirname(config.output.csvPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Escribimos el archivo
    fs.writeFileSync(config.output.csvPath, csvContent, 'utf-8');
    
    logger.info(`✅ CSV guardado exitosamente: ${config.output.csvPath}`, {
      totalSmartphones: smartphones.length
    });
  } catch (error) {
    logger.error('❌ Error al guardar el CSV', { error });
    throw error;
  }
}

/**
 * Escapa valores para CSV (maneja comas, comillas y saltos de línea)
 */
function escapeCsvValue(value: string): string {
  if (!value) return '""';
  
  // Si contiene coma, comilla doble o salto de línea, lo envolvemos en comillas
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escapamos las comillas dobles duplicándolas
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

/**
 * Agrega un smartphone individual al CSV (modo append)
 * Útil si queremos ir guardando en tiempo real
 */
export async function appendToCSV(smartphone: Smartphone): Promise<void> {
  try {
    const outputDir = path.dirname(config.output.csvPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Si el archivo no existe, creamos el header primero
    if (!fs.existsSync(config.output.csvPath)) {
      const headers = 'Marca,Modelo,Procesador,Tipo de Pantalla,RAM,Almacenamiento,Cámara Principal (MP),Cámara Frontal (MP),Batería (mAh),Precio,URL,Fecha de Extracción\n';
      fs.writeFileSync(config.output.csvPath, headers, 'utf-8');
    }

    // Construimos la fila
    const row = [
      escapeCsvValue(smartphone.marca),
      escapeCsvValue(smartphone.modelo),
      escapeCsvValue(smartphone.procesador),
      escapeCsvValue(smartphone.tipoPantalla),
      escapeCsvValue(smartphone.ram),
      escapeCsvValue(smartphone.almacenamiento),
      escapeCsvValue(smartphone.camaraPrincipal),
      escapeCsvValue(smartphone.camaraFrontal),
      escapeCsvValue(smartphone.bateria),
      escapeCsvValue(smartphone.precio),
      escapeCsvValue(smartphone.url),
      escapeCsvValue(smartphone.fechaExtraccion)
    ].join(',');

    // Agregamos al final del archivo
    fs.appendFileSync(config.output.csvPath, row + '\n', 'utf-8');
    
    logger.info(`📝 Smartphone agregado al CSV: ${smartphone.marca} ${smartphone.modelo}`);
  } catch (error) {
    logger.error('❌ Error al agregar smartphone al CSV', { error, smartphone });
    throw error;
  }
}
