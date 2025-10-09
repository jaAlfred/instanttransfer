const { google } = require('googleapis');

const SHEET_ID = '1KI2MGru1__zMP8kHvCCA0HE3mM-03HhT3gMj5rajuZ8';
const SHEET_NAME = 'Sheet1';

// ساخت credentials از environment variables نتلیفای
const CREDENTIALS = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
};

exports.handler = async (event) => {
  try {
    const records = JSON.parse(event.body);
    console.log("📤 داده‌ها برای ارسال به شیت:", records);

    // احراز هویت با JWT
    const auth = new google.auth.JWT(
      CREDENTIALS.client_email,
      null,
      CREDENTIALS.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    for (const record of records) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:A`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            new Date().toISOString(),
            record.company || '',
            record.account || '',
            record.name || '',
            record.sheba || '',
            record.destBank || '',
            record.amount || ''
          ]]
        }
      });
    }

    console.log("✅ داده‌ها با موفقیت به Google Sheet ارسال شدند!");
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success" })
    };
  } catch (error) {
    console.error("❌ خطا در اتصال به Google Sheets:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
