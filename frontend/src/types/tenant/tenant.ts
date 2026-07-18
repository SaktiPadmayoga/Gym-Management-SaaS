import * as z from "zod";

export const BranchSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string().nullable().optional(),
    is_main: z.boolean(),
});

export const SubscriptionInfoSchema = z.object({
    id: z.string(),
    status: z.string(),
    billing_cycle: z.string(),
    current_period_ends_at: z.string().nullable().optional(),
    plan_name: z.string(),
    plan_code: z.string().nullable().optional(),
});

export const TenantCurrentSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo_url: z.string().nullable().optional(),
    status: z.string(),
    owner_name: z.string(),
    owner_email: z.string(),
    max_branches: z.number(),
    current_branch_count: z.number(),
    subscription_ends_at: z.string().nullable().optional(),
    trial_ends_at: z.string().nullable().optional(),
    subscription: SubscriptionInfoSchema.nullable().optional(),
    current_branch: BranchSchema.nullable().optional(),
    branches: z.array(BranchSchema),
    current_domain_id: z.string().nullable().optional(),
    landing_page: z.object({
        hero_title: z.string(),
        hero_subtitle: z.string(),
        hero_cta_text: z.string(),
        hero_image_url: z.string().nullable().optional(),
        show_about: z.boolean(),
        about_description: z.string(),
        about_image_url_1: z.string().nullable().optional(),
        about_image_url_2: z.string().nullable().optional(),
        show_classes: z.boolean(),
        programs: z.array(z.object({
            title: z.string(),
            description: z.string(),
            image_url: z.string().nullable().optional(),
        })).nullable().optional(),
        show_locations: z.boolean(),
        branch_info: z.array(z.object({
            id: z.string(),
            hours: z.string().nullable().optional(),
            phone: z.string().nullable().optional(),
            email: z.string().nullable().optional(),
            features: z.array(z.string()).nullable().optional(),
        })).nullable().optional(),
        show_pricing: z.boolean(),
        show_faq: z.boolean(),
        faqs: z.array(z.object({
            q: z.string(),
            a: z.string(),
        })).nullable().optional(),
        testimonials: z.array(z.object({
            name: z.string(),
            role: z.string(),
            text: z.string(),
            avatar_url: z.string().nullable().optional(),
        })).nullable().optional(),
        footer: z.object({
            description: z.string().nullable().optional(),
            instagram: z.string().nullable().optional(),
            facebook: z.string().nullable().optional(),
            twitter: z.string().nullable().optional(),
            whatsapp: z.string().nullable().optional(),
        }).nullable().optional(),
    }).optional(),
});

export type BranchData = z.infer<typeof BranchSchema>;
export type TenantCurrentData = z.infer<typeof TenantCurrentSchema>;