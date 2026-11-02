/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';

export interface ParsedPhoneResult {
  isValid: boolean;
  e164: string;
  formatted: string;
  country?: string;
  extractedName?: string;
}

/**
 * Parses raw pasted phone text, wa.me links, or inputs like "Aman +91 98765 43210".
 */
export function parsePhoneInput(input: string, defaultCountry: CountryCode = 'US'): ParsedPhoneResult {
  if (!input || !input.trim()) {
    return { isValid: false, e164: '', formatted: '' };
  }

  let text = input.trim();
  let extractedName: string | undefined = undefined;

  // Handle wa.me links: https://wa.me/14155552671 or wa.me/919876543210?text=...
  const waMatch = text.match(/wa\.me\/(?:\+)?(\d+)/i);
  if (waMatch) {
    text = '+' + waMatch[1];
  }

  // Check if string contains letters before numbers (e.g. "Rahul +919876543210" or "John Doe 415-555-1234")
  const nameNumberMatch = text.match(/^([a-zA-Z\s]+?)\s*([+]?[\d\s\-().]{7,})$/);
  if (nameNumberMatch) {
    extractedName = nameNumberMatch[1].trim();
    text = nameNumberMatch[2].trim();
  }

  // Clean obvious punctuation
  const cleanedDigits = text.replace(/[^\d+]/g, '');

  try {
    const phoneNumber = parsePhoneNumberFromString(cleanedDigits.startsWith('+') ? cleanedDigits : text, defaultCountry);
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        isValid: true,
        e164: phoneNumber.number, // E.164 e.g. +14155552671
        formatted: phoneNumber.formatInternational(),
        country: phoneNumber.country,
        extractedName,
      };
    }
  } catch {
    // fallback parsing
  }

  // Fallback for partial/semi-valid input
  const asYouType = new AsYouType(defaultCountry);
  const formatted = asYouType.input(text);
  const rawClean = cleanedDigits.startsWith('+') ? cleanedDigits : (cleanedDigits ? '+' + cleanedDigits : '');

  return {
    isValid: rawClean.length >= 8,
    e164: rawClean,
    formatted: formatted || text,
    extractedName,
  };
}

/**
 * Normalizes phone numbers to comparable digits-only representation.
 */
export function normalizePhoneForComparison(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Detects if a phone number matches any existing lead.
 */
export function findDuplicatePhone(
  targetPhone: string,
  leads: Array<{ id: string; whatsappNumber: string; fullName: string }>,
  excludeId?: string
) {
  const normTarget = normalizePhoneForComparison(targetPhone);
  if (!normTarget || normTarget.length < 6) return null;

  return leads.find(l => {
    if (excludeId && l.id === excludeId) return false;
    const normLead = normalizePhoneForComparison(l.whatsappNumber);
    if (!normLead) return false;
    return normLead.endsWith(normTarget) || normTarget.endsWith(normLead);
  }) || null;
}
