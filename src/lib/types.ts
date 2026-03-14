
/**
 * ========================================
 * Types from Accounts API Documentation
 * ========================================
 */

export interface User {
  id: number;
  email: string;
  is_verify: boolean;
}

export interface OwnerProfile {
  business_name: string;
  logo: string | null;
  logo_url: string | null;
  nom: string;
  prenom: string;
  phone_contact: string;
  whatsapp_contact: string;
  pays: string;
  ville: string;
  quartier: string;
  main_goal: 'collect_leads' | 'analytics' | 'marketing';
  is_complete: boolean;
}

export interface ProfileStatus {
  pass_onboading: boolean;
  is_complete: boolean;
  missing_fields: string[];
  completion_percentage: number;
  has_business_name: boolean;
  has_logo: boolean;
  has_main_goal: boolean;
  has_contact: boolean;
  has_location: boolean;
}


/**
 * ==================================================
 * Types from WiFi Marketing Platform Documentation
 * ==================================================
 */

export interface FormSchema {
  id: number;
  name: string;
  schema: {
    fields: FormField[];
  };
  public_key: string;
  version: number;
  is_default: boolean;
  double_opt_enable: boolean;
  preferred_channel: 'email' | 'phone';
  integration_snippet: string;
  created_at: string; // ISO 8601
  updated_at: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'choice' | 'boolean';
  required: boolean;
  placeholder?: string;
  choices?: string[];
}

export interface Lead {
  id: number;
  mac_address: string;
  email: string | null;
  phone: string | null;
  payload: Record<string, any>;
  client_token: string;
  is_verified: boolean;
  recognition_level: number;
  created_at: string;
  last_seen: string;
}

export interface AnalyticsSummary {
  total_leads: number;
  leads_this_week: number;
  verified_leads: number;
  return_rate: number;
  top_clients: TopClient[];
  leads_by_hour: HourlyData[];
}

export interface TopClient {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  mac_address: string;
  recognition_level: number;
  loyalty_percentage: number;
  last_seen: string;
  created_at: string;
  is_verified: boolean;
}

export interface HourlyData {
  hour: string; // ISO 8601
  count: number;
}
