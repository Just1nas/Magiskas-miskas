select cron.schedule('instagram-refresh-every-5-min','*/5 * * * *', $job$
select net.http_post(
 url := 'https://bksezjoyymvhrlideciq.supabase.co/functions/v1/instagram-refresh',
 headers := '{"Content-Type":"application/json","apikey":"sb_publishable_Y7PqiSvwqp1_TmlKpKRdxA_o8UInJRe","Authorization":"Bearer sb_publishable_Y7PqiSvwqp1_TmlKpKRdxA_o8UInJRe"}'::jsonb,
 body := '{}'::jsonb,
 timeout_milliseconds := 120000
);
$job$);
