// common/validators/phone-number.validator.ts

/**
 * Validation des numéros de téléphone pour l'Afrique de l'Ouest
 *
 * Pays supportés :
 * - 🇧🇫 Burkina Faso : +226 (8 chiffres)
 * - 🇨🇮 Côte d'Ivoire : +225 (10 chiffres)
 * - 🇲🇱 Mali : +223 (8 chiffres)
 * - 🇸🇳 Sénégal : +221 (9 chiffres)
 * - 🇹🇬 Togo : +228 (8 chiffres)
 * - 🇧🇯 Bénin : +229 (8 chiffres)
 * - 🇳🇪 Niger : +227 (8 chiffres)
 * - 🇬🇳 Guinée : +224 (9 chiffres)
 */

/**
 * Regex pour valider les numéros de téléphone d'Afrique de l'Ouest
 * Format acceptés :
 * - Avec indicatif international : +226XXXXXXXX, 00226XXXXXXXX
 * - Sans indicatif (format local) : XXXXXXXX
 */
export const WEST_AFRICA_PHONE_REGEX = /^(\+|00)?(221|223|224|225|226|227|228|229)\d{8,10}$|^\d{8,10}$/;

/**
 * Message d'erreur pour la validation
 */
export const WEST_AFRICA_PHONE_ERROR_MESSAGE =
  'Le numéro de téléphone doit être un numéro valide d\'Afrique de l\'Ouest (Burkina Faso, Côte d\'Ivoire, Mali, Sénégal, Togo, Bénin, Niger, Guinée)';

/**
 * Configuration des pays d'Afrique de l'Ouest
 */
export const WEST_AFRICA_COUNTRIES = {
  BF: { name: 'Burkina Faso', code: '+226', digits: 8, flag: '🇧🇫' },
  CI: { name: 'Côte d\'Ivoire', code: '+225', digits: 10, flag: '🇨🇮' },
  ML: { name: 'Mali', code: '+223', digits: 8, flag: '🇲🇱' },
  SN: { name: 'Sénégal', code: '+221', digits: 9, flag: '🇸🇳' },
  TG: { name: 'Togo', code: '+228', digits: 8, flag: '🇹🇬' },
  BJ: { name: 'Bénin', code: '+229', digits: 8, flag: '🇧🇯' },
  NE: { name: 'Niger', code: '+227', digits: 8, flag: '🇳🇪' },
  GN: { name: 'Guinée', code: '+224', digits: 9, flag: '🇬🇳' },
};

/**
 * Détecte le pays à partir d'un numéro de téléphone
 */
export function detectCountry(phoneNumber: string): string | null {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');

  for (const [countryCode, config] of Object.entries(WEST_AFRICA_COUNTRIES)) {
    if (cleaned.startsWith(config.code) || cleaned.startsWith(config.code.replace('+', '00'))) {
      return countryCode;
    }
  }

  return null;
}

/**
 * Formate un numéro de téléphone au format international
 * Exemples :
 * - "08090809" + code pays "BF" → "+22608090809"
 * - "0022608090809" → "+22608090809"
 * - "+22608090809" → "+22608090809"
 */
export function formatPhoneNumber(phoneNumber: string, defaultCountryCode?: string): string {
  // Nettoyer le numéro
  let cleaned = phoneNumber.replace(/[\s\-()]/g, '');

  // Si commence par 00, remplacer par +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  // Si commence déjà par +, retourner tel quel
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Sinon, ajouter l'indicatif du pays par défaut
  if (defaultCountryCode && WEST_AFRICA_COUNTRIES[defaultCountryCode]) {
    return WEST_AFRICA_COUNTRIES[defaultCountryCode].code + cleaned.replace(/^0+/, '');
  }

  // Si pas de code pays, retourner tel quel (sera validé par le regex)
  return cleaned;
}

/**
 * Valide un numéro de téléphone d'Afrique de l'Ouest
 */
export function isValidWestAfricaPhone(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  return WEST_AFRICA_PHONE_REGEX.test(cleaned);
}
