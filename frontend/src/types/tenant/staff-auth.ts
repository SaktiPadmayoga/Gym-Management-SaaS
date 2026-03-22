import * as z from "zod";

export const LoginBranchSchema = z.object({
    id:          z.string(),
    name:        z.string(),
    branch_code: z.string().optional(),
    address:     z.string().nullable().optional(),
    city:        z.string().nullable().optional(),
    role:        z.string(),
});

export type LoginBranchData = z.infer<typeof LoginBranchSchema>;

export interface StaffLoginRequest {
    email:    string;
    password: string;
}

export interface StaffLoginResponse {
    token:          string;
    staff:          any;
    branches:       LoginBranchData[];
    global_role:    "owner" | "staff";
    dashboard_path: string;
}

export interface ChangePasswordRequest {
    current_password:          string;
    new_password:              string;
    new_password_confirmation: string;
}

export interface SelectedBranch {
    id:           string;
    name:         string;
    branch_code?: string;
    address:      string | null;
    city?:        string | null;
    role:         string;
}