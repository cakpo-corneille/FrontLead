
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
  pass_onboarding: boolean;
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

export type ConflictStrategy = 'ALLOW' | 'REQUIRE_OTP';

export interface FormSchema {
  id: number;
  name: string;
  schema: {
    fields: FormField[];
  };
  public_key: string;
  version: number;
  enable: boolean;
  /** Active la vérification OTP (SMS) sur les soumissions du widget. */
  opt: boolean;
  /**
   * Stratégie appliquée quand un email/téléphone soumis appartient
   * déjà à un client existant sur un autre appareil.
   * - ALLOW : laisser passer (alerte loggée uniquement)
   * - REQUIRE_OTP : exiger un code OTP envoyé au client existant
   */
  conflict_strategy: ConflictStrategy;
  integration_snippet: string;
  tracking_snippet?: {
    full: string;
    logout: string;
  };
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  logo_url: string | null;
  button_label: string;
  media_host: string | null;
}

/**
 * Alerte créée quand un email ou téléphone soumis correspond à un client
 * existant mais provient d'une adresse MAC différente.
 */
export type ConflictField = 'email' | 'phone';
export type ConflictAlertStatus = 'PENDING' | 'RESOLVED' | 'IGNORED';

export interface ConflictAlert {
  id: number;
  existing_client: number;
  existing_client_email: string | null;
  existing_client_phone: string | null;
  existing_client_first_name: string | null;
  existing_client_last_name: string | null;
  conflict_field: ConflictField;
  offending_payload: Record<string, any>;
  offending_mac: string;
  status: ConflictAlertStatus;
  created_at: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'choice' | 'boolean';
  required: boolean;
  placeholder?: string;
  choices?: string[];
}

export interface ClientDevice {
  id: number;
  mac_address: string;
  user_agent: string;
  first_seen: string;
  last_seen: string;
}

export interface Lead {
  id: number;
  mac_address: string;
  email: string | null;
  phone: string | null;
  first_name: string;
  last_name: string;
  payload: Record<string, any>;
  client_token: string;
  is_verified: boolean;
  recognition_level: number;
  tags: string[];
  notes: string | null;
  user_agent: string;
  devices: ClientDevice[];
  sessions_count: number;
  created_at: string;
  last_seen: string;
}

export interface AnalyticsSummary {
  total_leads: number;
  period_leads: number;
  period_verified_leads: number;
  period_return_rate: number;
  top_clients: TopClient[];
  leads_series: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  label: string;
  count: number;
}

export interface TopClient {
  id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
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
  hour: string;
  count: number;
}

/**
 * ==================================================
 * Types from Tracking API (sessions Wi-Fi MikroTik)
 * ==================================================
 */


export interface TicketPlan {
  id: number;
  name: string;
  price_fcfa: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectionSession {
  id: number;
  session_key: string;
  mac_address: string;
  ip_address: string | null;
  ticket_id: string | null;
  mikrotik_session_id: string | null;
  started_at: string;
  ended_at: string | null;
  last_heartbeat: string | null;
  uptime_seconds: number;
  bytes_downloaded: number;
  bytes_uploaded: number;
  status: 'connecté' | 'expiré' | 'déconnecté';
  duration_seconds: number;
  duration_human: string;
  session_timeout_seconds: number | null;
  total_mb: number;
  download_mb: number;
  upload_mb: number;
  plan_name: string | null;
  plan_price_fcfa: number | null;
  plan_duration_minutes: number | null;
  client: number;
  client_email: string | null;
  client_phone: string | null;
  client_first_name: string | null;
  client_last_name: string | null;
}

export interface SessionOverview {
  total_sessions: number;
  sessions_today: number;
  sessions_this_week: number;
  sessions_this_month: number;
  active_sessions: number;
  avg_session_seconds: number;
  total_mb: number;
  estimated_revenue_today_fcfa: number;
  estimated_revenue_week_fcfa: number;
  estimated_revenue_month_fcfa: number;
}

export interface SessionsByDay {
  labels: string[];
  data: number[];
}

export interface SessionsByHour {
  labels: number[];
  data: number[];
}

export interface TopSessionClient {
  client_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  mac_address: string;
  sessions_count: number;
  total_seconds: number;
  total_mb: number;
}
