/**
 * ORDEXA — Order form → Google Sheet logger
 * --------------------------------------------------------
 * This script receives order requests posted from the website's
 * order form and appends them as a new row in your "Ordexa Orders"
 * Google Sheet.
 *
 * SETUP (one-time, ~5 minutes):
 * 1. Open the "Ordexa Orders" spreadsheet:
 *    https://docs.google.com/spreadsheets/d/19CAaK0NJ43nukXfR2WgJ96jXttgzWrZPGWBotkKRIzU/edit
 * 2. Open script.google.com, click New project (works even if the sheet's menu
 *    sends you to AppSheet — this script opens the sheet by its ID).
 * 3. Delete anything in the editor and paste this whole file in.
 * 4. Click Deploy → New deployment.
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: "Ordexa order webhook" (optional).
 *    - Execute as: Me.
 *    - Who has access: Anyone.
 *    - Click Deploy, and authorize when Google asks (it's your own script).
 * 5. Copy the "Web app URL" you're given — it looks like:
 *    https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec
 * 6. Paste that URL into script.js as CONFIG.sheetWebhookUrl.
 * 7. Re-upload/redeploy the website. Done — every order submitted
 *    on the site will now also appear as a new row in this sheet.
 *
 * If you ever change the form's fields, update the `data.xxx` lines
 * below to match, and the headers in row 1 of the sheet.
 */

// Lets you open the web app URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput("Ordexa order webhook is live.");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = SpreadsheetApp.openById("19CAaK0NJ43nukXfR2WgJ96jXttgzWrZPGWBotkKRIzU");
    var sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];

    // Add headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Phone", "Product / Jumia Link", "Notes", "Service Fee Quoted (KSh)"]);
    }

    // Accept JSON (text/plain body) or normal form fields
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (x) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.phone || "",
      data.product || "",
      data.notes || "",
      ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/**
 * RUN THIS ONCE from the editor (select "testSetup" in the dropdown, click Run).
 * It forces Google's permission prompt and writes a test row.
 * If a row appears in the sheet, the backend works.
 */
function testSetup() {
  doPost({ postData: { contents: JSON.stringify({
    timestamp: new Date().toISOString(), name: "TEST (delete me)",
    phone: "0700000000", product: "Setup test", notes: "from testSetup()"
  }) } });
}
