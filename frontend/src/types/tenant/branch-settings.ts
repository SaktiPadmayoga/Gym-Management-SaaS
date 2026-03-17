import * as z from "zod";

/* =========================
 * ENUMS
 * ========================= */

export const SettingGroupEnum = z.enum([
    "appearance",
    "business",
    "operational",
    "membership",
    "notification",
    "security",
]);

export const SettingTypeEnum = z.enum([
    "string",
    "integer",
    "boolean",
    "json",
    "color",
]);

export type SettingGroup = z.infer<typeof SettingGroupEnum>;

/* =========================
 * SINGLE SETTING SCHEMA
 * ========================= */

export const BranchSettingItemSchema = z.object({
    id:        z.string().optional(),
    group:     SettingGroupEnum,
    key:       z.string(),
    value:     z.union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.string(), z.any()), z.null()]),
    type:      SettingTypeEnum,
    is_public: z.boolean().default(false),
});

export type BranchSettingItem = z.infer<typeof BranchSettingItemSchema>;

/* =========================
 * GROUPED SETTINGS SCHEMA
 * Struktur response dari GET /branches/{id}/settings
 * ========================= */

export const OperatingHoursSchema = z.record(
    z.string(),
    z.object({
        open:    z.string(),
        close:   z.string(),
        is_open: z.boolean(),
    })
);

export type OperatingHours = z.infer<typeof OperatingHoursSchema>;

// Appearance
export interface AppearanceSettings {
    primary_color: string;
    accent_color:  string;
    logo_url:      string | null;
}

// Business
export interface BusinessSettings {
    timezone:        string;
    currency:        string;
    currency_symbol: string;
    date_format:     string;
    language:        string;
}

// Operational
export interface OperationalSettings {
    operating_hours:     OperatingHours;
    max_capacity:        number;
    session_duration_min: number;
}

// Membership
export interface MembershipSettings {
    grace_period_days:   number;
    auto_renewal:        boolean;
    late_penalty_amount: number;
    freeze_allowed:      boolean;
    max_freeze_days:     number;
}

// Notification
export interface NotificationSettings {
    expiry_reminder_days:     number[];
    whatsapp_enabled:         boolean;
    email_enabled:            boolean;
    expiry_message_template:  string;
}

// Security
export interface SecuritySettings {
    max_login_attempt:   number;
    session_timeout_min: number;
    require_checkin_pin: boolean;
}

export interface AllBranchSettings {
    branch_id:    string;
    settings: {
        appearance?:  Record<string, { value: any; type: string; is_public: boolean }>;
        business?:    Record<string, { value: any; type: string; is_public: boolean }>;
        operational?: Record<string, { value: any; type: string; is_public: boolean }>;
        membership?:  Record<string, { value: any; type: string; is_public: boolean }>;
        notification?: Record<string, { value: any; type: string; is_public: boolean }>;
        security?:    Record<string, { value: any; type: string; is_public: boolean }>;
    };
}

/* =========================
 * UPDATE REQUEST
 * ========================= */

export interface UpdateSettingGroupPayload {
    [key: string]: any;
}

export interface UpdateSettingsBatchPayload {
    settings: Array<{
        key:       string;
        value:     any;
        group:     SettingGroup;
        type:      string;
        is_public?: boolean;
    }>;
}