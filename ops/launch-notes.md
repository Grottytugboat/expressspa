# Express Spa implementation notes

## Site

27 substantive pages, including five services, ten service areas, four guides, quote form, estimate planner, retailer support and spa covers. Generated using `python3 scripts/generate.py`; static output lives in `public/`. `node scripts/prepare.mjs` copies retained original image paths for compatibility. WebP assets are used for page photography.

Actual five Google reviews were verified through the connected Google Business account on 8 November 2026. The old unsupported AggregateRating and generic Melbourne CBD coordinates have been removed. No new customer stories or local depots are invented.

## Enquiries

Private Vercel Blob store: expressspa-enquiries (Sydney). Runtime uses the project-connected storage credential. No secret values belong in the repository. API stores the enquiry before notifying Mark. Email is optional. Up to three locally compressed JPEG access photos are retained privately and attached to Mark’s notification. Optional customer acknowledgement is transactional and replies to Mark.

Required runtime configuration: `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN` (or supported project Blob identity), `LEAD_ACTION_SECRET`, `CRON_SECRET`. Existing sender is retained: Express Spa Deliveries <tim@sondersites.com>. A verified Express Spa sending identity can replace it after email-domain setup; customer replies already go to Mark.

One- and three-day reminders go to Mark, not directly to customers. Contacted/Closed stops reminders; Quoted restarts the reminder clock. Signed email links expire after 30 days and require a confirmation POST. A daily Vercel cron runs at 21:00 UTC (8am AEDT / 7am AEST).

## Estimate configuration — awaiting Mark

Set `TRUCK_RATE_PER_KM`, `LABOUR_RATE_PER_HOUR`, `CRANE_RATE_PER_LIFT`, `MINIMUM_JOB_CHARGE`, `PRICING_GST` (inclusive/exclusive), and only then `PRICING_CONFIRMED=true`. Until confirmed, the estimator collects planning inputs and hands them to Mark without inventing a price. Crane default is 55 internally, based on Tim’s note; it is not advertised as a final price. Confirm kilometre basis, crew-hour basis, number of lifts and GST before enabling.

## Social

Zernio profile: Express Spa Deliveries. Google Business location is connected via the existing authorised Google grant. Facebook page 61553929876812 exists but was not returned by the existing Meta grant; it needs the page owner’s connection/permission. Do not post Express Spa content to Tim’s or Sonder’s accounts. Instagram is not yet established for this brand.

## Still dependent on Mark

Truck/labour rates, GST, lift unit/minimums, product photos and live cover stock/prices, recent delivery photos with suburb/context. Email sent 8 November 2026. Search Console verification and sitemap submission should be checked against the production domain after release. Submitting a sitemap is not a guarantee of indexing or rankings.
