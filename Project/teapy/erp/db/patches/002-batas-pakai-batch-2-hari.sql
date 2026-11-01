-- Keputusan owner: batch boleh dipakai maksimal 2 hari sejak dibuat.
update app_settings set data = data || '{"batch_expiry_hours":48}'::jsonb where key = 'main';
update batches set expires_at = made_at + interval '48 hours' where drained_at is null;
