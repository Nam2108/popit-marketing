const SHEET_NAME = "Leads";

function doGet() {
  return jsonResponse({ ok: true, service: "POPIT lead webhook" });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const sheet = getLeadsSheet();

    sheet.appendRow([
      new Date(),
      clean(payload.name),
      clean(payload.phone),
      clean(payload.email),
      clean(payload.service),
      clean(payload.message),
      clean(payload.submittedAt)
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function getLeadsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["Received At", "Name", "Phone", "Email", "Service", "Message", "Submitted At"]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function clean(value) {
  return String(value || "").trim();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
