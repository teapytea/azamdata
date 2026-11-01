revoke execute on function public.claim_extension_pairing(text, text, text) from public;
revoke execute on function public.claim_extension_pairing(text, text, text) from anon;
revoke execute on function public.claim_extension_pairing(text, text, text) from authenticated;
grant execute on function public.claim_extension_pairing(text, text, text) to service_role;
