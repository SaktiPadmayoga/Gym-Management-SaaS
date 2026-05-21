// ─── Master Permission (from API) ──────────────────────────────────────────

export interface Permission {
    id: string;
    group: string;         // "members", "pos", "reports"
    name: string;          // "members.view", "members.manage"
    display_name: string;  // "View Members"
    action: 'view' | 'manage';
}

export interface PermissionGroup {
    group: string;
    label: string;
    permissions: Permission[];
}

// ─── Access Level ──────────────────────────────────────────────────────────

export type AccessLevel = 'none' | 'view' | 'manage';

// ─── Role ──────────────────────────────────────────────────────────────────

export interface Role {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    is_active: boolean;
    permissions: string[];        // ["members.view", "pos.manage", ...]
    permission_ids: string[];     // UUID array
}

export interface RoleCreateRequest {
    name: string;
    display_name: string;
    description?: string;
    is_active: boolean;
    permission_ids?: string[];
}

export interface UpdateAccessLevelRequest {
    group: string;
    level: AccessLevel;
}

// ─── Group Labels for UI ──────────────────────────────────────────────────

export const RESOURCE_GROUP_LABELS: Record<string, string> = {
    pos:         'Point of Sale',
    members:     'Members Management',
    check_ins:   'Check-ins',
    bookings:    'Bookings',
    pt_sessions: 'PT Sessions',
    schedules:   'Schedules',
    staff:       'Staff Management',
    reports:     'Reports',
    settings:    'Settings',
    memberships: 'Memberships',
    master_data: 'Master Data',
};

export const RESOURCE_GROUP_ICONS: Record<string, string> = {
    pos:         '💰',
    members:     '👥',
    check_ins:   '🕐',
    bookings:    '📅',
    pt_sessions: '🏋️',
    schedules:   '📆',
    staff:       '👨‍💼',
    reports:     '📊',
    settings:    '⚙️',
    memberships: '🎫',
    master_data: '📋',
};