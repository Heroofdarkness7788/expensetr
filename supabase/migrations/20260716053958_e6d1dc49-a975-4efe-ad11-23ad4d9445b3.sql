
-- Lock down SECURITY DEFINER functions: revoke PUBLIC/anon EXECUTE,
-- grant only to roles that actually need to call them.

-- Trigger-only functions: no direct callers needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_expense_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_receipt_jobs_owner_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_report_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Role-check helpers: used in RLS policies. Need authenticated EXECUTE.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.manages(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manages(uuid) TO authenticated, service_role;

-- App setting getter: used inside handle_new_user trigger only
REVOKE ALL ON FUNCTION public.get_app_setting(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_setting(text) TO service_role;

-- RPCs called by signed-in users (perform their own auth checks internally)
REVOKE ALL ON FUNCTION public.set_app_setting(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_app_setting(text, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.apply_policy_violations(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_policy_violations(uuid, jsonb) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.record_audit(text, uuid, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit(text, uuid, text, jsonb) TO authenticated, service_role;
