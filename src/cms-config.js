// Browser-safe publishable key; permissions are enforced by Supabase RLS.
// Optional build variables allow using a separate staging project.
export const cmsUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bksezjoyymvhrlideciq.supabase.co';
export const cmsKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y7PqiSvwqp1_TmlKpKRdxA_o8UInJRe';
export const cmsConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cmsUrl) && cmsKey.startsWith('sb_publishable_');
