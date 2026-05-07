export interface Role {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    is_active: boolean;
    permissions: string[];
}

export interface RoleCreateRequest {
    name: string;
    display_name: string;
    description?: string;
    is_active: boolean;
    permissions: string[];
}

export interface RoleWithKeyword {
    search: string;
}

export const AVAILABLE_PERMISSIONS = [
    { id: 'pos', label: 'Point of Sale' },
    { id: 'members', label: 'Members Management' },
    { id: 'check_ins', label: 'Check-ins' },
    { id: 'bookings', label: 'Class Bookings' },
    { id: 'pt_sessions', label: 'PT Sessions' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'staff', label: 'Staff Management' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'master_data', label: 'Master Data' },
];