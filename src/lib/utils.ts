import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um CPF ou CNPJ com máscara
 * 
 * @param {string} document - Documento sem máscara (11 dígitos para CPF, 14 para CNPJ)
 * @param {string} type - Tipo do cliente ('pessoa_fisica' ou 'pessoa_juridica')
 * 
 * @returns {string} Documento formatado com máscara
 * 
 * @example
 * formatDocument('12345678900', 'pessoa_fisica') // '123.456.789-00'
 * formatDocument('12345678000100', 'pessoa_juridica') // '12.345.678/0001-00'
 */
export function formatDocument(
  document: string,
  type: 'pessoa_fisica' | 'pessoa_juridica'
): string {
  if (!document) return '';

  // Remove caracteres não numéricos
  const cleaned = document.replace(/\D/g, '');

  if (type === 'pessoa_fisica') {
    // CPF: XXX.XXX.XXX-XX
    if (cleaned.length !== 11) return document;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ: XX.XXX.XXX/XXXX-XX
    if (cleaned.length !== 14) return document;
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

