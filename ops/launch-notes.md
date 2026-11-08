# Express Spa implementation notes

## Site

27 substantive pages, including five services, ten service areas, four guides, quote form, estimate planner, retailer support and spa covers. Generated using `python3 scripts/generate.py`; static output lives in `public/`. `node scripts/prepare.mjs` copies retained original image paths for compatibility. WebP assets are used for page photography.

Actual five Google reviews were verified through the connected Google Business account on 8 November 2026. The old unsupported AggregateRating and generic Melbourne CBD coordinates have been removed. No new customer stories or local depots are invented.

## Enquiries

Private Vercel Blob store: expressspa-enquiries (Sydney). Runtime uses the project-connected storage credential. No secret values belong in the repository. API stores the enquiry before notifying Mark. Email is optional. Up to three locally compressed JPEG access photos are retained privately and attached to Mark’s notification. Optional customer acknowledgement is transactional and replies to Mark.

Required runtime configuration: `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN` (or supported project Blob identity), `LEAD_ACTION_SECRET`, `CRON_SECRET`. Existing sender is retained: Express Spa Deliveries <tim@sondersites.com>. A verified Express Spa sending identity can replace it after email-domain setup; customer replies already go to Mark.

One- and three-day reminders go to Mark, not directly to customers. Contacted/Closed stops reminders; Quoted restarts the reminder clock. Signed email links expire after 30 days and require a confirmation POST. A daily Vercel cron runs at 21:00 UTC (8am AEDT / 7am AEST).

## Estimate configuration — updated 8 November 2026

Tim supplied rough rates: truck $1.50/km, crane $75/lift, labour $70/hour/person, plus GST. Travel is Croydon → customer location → Croydon. The standard labour allowance is two people for one hour; visitors can choose a preset or exact crew/time. Unsure about crane lifts allows two lifts, visibly disclosed. No minimum has been supplied, so no additional minimum is imposed.

A local Victorian suburb/postcode lookup avoids external address APIs. Suburb-based distance is an explicit approximation: locality-centre straight-line distance ×1.3 road allowance, rounded to 5 km, with a 5 km local allowance. It is not a measured driving route. Customers can override with approximate one-way kilometres, which are doubled for return travel. Interstate visitors use a distance override. Data: GeoNames via Elkfox, CC BY 3.0, attributed in the estimator.

Runtime configuration: TRUCK_RATE_PER_KM=1.50, LABOUR_RATE_PER_HOUR=70, CRANE_RATE_PER_LIFT=75, MINIMUM_JOB_CHARGE=0, PRICING_GST=exclusive, PRICING_CONFIRMED=true. Runtime overrides remain available for future changes. Rates and final crew/time can vary by job; the estimate is a guide and is passed into the enquiry, never auto-booked.

## Social

Zernio profile: Express Spa Deliveries. Google Business location is connected via the existing authorised Google grant. Facebook page 61553929876812 exists but was not returned by the existing Meta grant; it needs the page owner’s connection/permission. Do not post Express Spa content to Tim’s or Sonder’s accounts. Instagram is not yet established for this brand.

## Still dependent on Mark

Any minimum or special-job charges, product photos and live cover stock/prices, recent delivery photos with suburb/context. Email sent 8 November 2026. Search Console verification and sitemap submission should be checked against the production domain after release. Submitting a sitemap is not a guarantee of indexing or rankings.
