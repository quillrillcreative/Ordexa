# Ordexa Website

A static website for Ordexa, split into separate files so it's easy to maintain.

## Files
- `index.html` — page content and structure
- `styles.css` — layout, colors, typography, and responsive styles
- `script.js` — WhatsApp links, order form, mobile menu, testimonial carousel, and other page interactions
- `google-apps-script.gs` — script to paste into Google Apps Script so order-form submissions get logged to a Google Sheet (setup steps inside the file)
- `assets/ordexa-logo.png` — logo (used in the nav, footer, and hero chat card)
- `assets/favicon.png` — browser tab icon
- `assets/hero-photo.jpg` — hero photo
- `assets/jumia-box.jpg` — delivery/trust section photo
- `assets/headphones.jpg` — product photo shown in the hero's "Quality Headphones" card

## Before publishing
1. Open `script.js` and confirm `whatsapp:` holds Ordexa's real WhatsApp number in international format, digits only (currently `254700321523`, i.e. +254 700 321 523).
2. Confirm the proposed service prices and service boundaries before publishing.
3. Edit the testimonials in `script.js` (the `testimonials` array) with real customer quotes once you have them.
4. Review all text, spelling, phone number, email/contact details, service area, and links. Do not imply that Ordexa is affiliated with Jumia.
5. Test the site on an Android phone and desktop.

## Order form → Spreadsheet
The "Start Your Order" section (`#order`) on the site collects name, phone, product/Jumia link, and notes. On submit it:
1. Sends the data to a Google Sheet (if configured — see below).
2. Opens WhatsApp with the same details pre-filled, so you can confirm the order with the customer directly.

A spreadsheet has already been created for you: **[Ordexa Orders](https://docs.google.com/spreadsheets/d/19CAaK0NJ43nukXfR2WgJ96jXttgzWrZPGWBotkKRIzU/edit)**, with headers: Timestamp, Name, Phone, Product / Jumia Link, Notes, Service Fee Quoted (KSh).

To connect the form to it:
1. Open the spreadsheet link above.
2. Go to **Extensions → Apps Script**.
3. Paste in the contents of `google-apps-script.gs` (delete any starter code first).
4. **Deploy → New deployment → Web app** — set "Execute as: Me", "Who has access: Anyone" — then **Deploy** and authorize it.
5. Copy the Web app URL it gives you (ends in `/exec`).
6. Paste that URL into `script.js` as `CONFIG.sheetWebhookUrl`.
7. Re-publish the site. Every order submitted on the site will now also append a row to the sheet.

If `sheetWebhookUrl` is left blank, the form still works — it just skips the spreadsheet step and goes straight to WhatsApp.

## Preview locally
Open `index.html` in a browser. For best results, use a simple local web server or deploy the folder to a static host.

## Deployment
The folder can be deployed to a static host such as GitHub Pages, Netlify, or Vercel. No database is required beyond the Google Sheet above.

## Important
This is a front-end website. Orders are logged via the Google Sheet integration above and handed off to WhatsApp — it does not process payments or provide a customer dashboard.
