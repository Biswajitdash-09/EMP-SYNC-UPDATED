
/**
 * Company Settings Service
 * Handles company information storage and retrieval
 */

export interface CompanySettings {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
}

const COMPANY_SETTINGS_KEY = 'company-settings';

/**
 * Get company settings
 */
export const getCompanySettings = (): CompanySettings | null => {
  try {
    const stored = localStorage.getItem(COMPANY_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading company settings:', error);
    return null;
  }
};

/**
 * Store company settings
 */
export const storeCompanySettings = (settings: CompanySettings): void => {
  try {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify({
      ...settings,
      createdAt: settings.createdAt || new Date().toISOString()
    }));
    console.log('✅ Company settings stored:', settings);
  } catch (error) {
    console.error('Error storing company settings:', error);
  }
};

/**
 * Update company settings
 */
export const updateCompanySettings = (updates: Partial<CompanySettings>): void => {
  const existing = getCompanySettings();
  const updated = existing ? { ...existing, ...updates } : {
    ...updates,
    name: updates.name || 'Company Name',
    createdAt: new Date().toISOString()
  } as CompanySettings;
  
  storeCompanySettings(updated);
};
