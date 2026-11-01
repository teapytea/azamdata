# Personal OS Gmail bank sync

This Google Apps Script is the Gmail bridge required by BAB 10 of the project specification. It searches recent Gmail finance messages, sends them to the Personal OS ingest endpoint, and labels accepted threads as processed. The defaults are BCA (`bca@bca.co.id`), BSI (`mobile@bankbsi.co.id`), Shopee (`info@mail.shopee.co.id`), GoPay (`no-reply@customers.go-pay.co.id`), and Grab (`no-reply@grab.com`). Shopee is restricted to subjects matching `Pesanan #... Telah Dikirim`.

## One-time installation

1. In Personal OS Finance, configure the exact BCA and BSI sender addresses and generate a one-time ingest secret. The provider senders above are built in.
3. Create a Google Apps Script project and paste `Code.gs`.
4. In Project Settings, add the script property `PERSONAL_OS_SECRET` with the generated secret. The endpoint is already the project default; optionally set `PERSONAL_OS_ENDPOINT` to override it.
   The built-in addresses can be overridden with `BCA_SENDER`, `BSI_SENDER`, `SHOPEE_SENDER`, `GOPAY_SENDER`, or `GRAB_SENDER` only when a genuine message uses a different exact From address.
   The optional `SYNC_START_DATE` property defaults to `2026/01/01` and limits both scheduled sync and backfill.
5. Run `setup()` once and approve the Gmail and external-request permissions. It creates the labels and a daily trigger.
6. Run `backfillBankEmails()` once to import up to 250 historical messages per execution, starting at `SYNC_START_DATE`. Run it again only if the log reports 250 accepted messages.
7. Deploy the script as a Web app that executes as you and is accessible to `Anyone`. Save the `/exec` URL in Personal OS. The URL is kept private in your database and is called by an authenticated Supabase function, so refreshing Finance does not navigate away from the page.

The shared secret remains in Google Apps Script properties and is stored only as a SHA-256 hash in Supabase. Rotate it from Personal OS if it is ever exposed.

BSI is posted automatically when its strict parser succeeds. Shopee, GoPay, and Grab are initially collected as review evidence until several genuine templates have been validated and cross-source reconciliation can prevent duplicate expenses.
