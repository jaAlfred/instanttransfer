const { google } = require('googleapis');

// برای تست local (اختیاری)
if (!process.env.NETLIFY) {
  require('dotenv').config();
}

exports.handler = async (event, context) => {
  try {
    // لاگ داده‌های ورودی
    console.log('📤 داده‌ها برای ارسال به شیت:', JSON.parse(event.body));

    const body = JSON.parse(event.body);
    const records = Array.isArray(body) ? body : [body]; // پشتیبانی از تک یا چند رکورد

    // لود credentials
    let credentials;
    try {
      if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
        throw new Error('GOOGLE_SHEETS_CREDENTIALS در متغیرهای محیطی یافت نشد');
      }
      credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      // تصحیح private_key
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
        console.log('🔧 private_key تصحیح شد');
      } else {
        throw new Error('private_key در credentials یافت نشد');
      }
    } catch (parseError) {
      console.error('❌ خطا در parse کردن credentials:', parseError);
      throw new Error('GOOGLE_SHEETS_CREDENTIALS نامعتبر است: ' + parseError.message);
    }

    // احراز هویت
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1KI2MGru1__zMP8kHvCCA0HE3mM-03HhT3gMj5rajuZ8'; // آیدی شیتت رو اینجا بذار

    // آماده‌سازی داده‌ها
    const values = records.map(rec => [
      rec.company,
      rec.account,
      rec.name,
      rec.sheba,
      rec.destBank,
      Number(rec.amount).toLocaleString('fa-IR')
    ]);

    // ارسال به شیت
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1:F', // تغییر به نام شیتت اگه فرق داره
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values },
    });

    console.log('✅ پاسخ از گوگل شیتس:', response.data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${records.length} رکورد با موفقیت اضافه شد!`,
        updatedRange: response.data.updates.updatedRange,
      }),
    };
  } catch (error) {
    console.error('❌ خطا در اتصال به Google Sheets:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'خطا در ارسال به گوگل شیتس: ' + error.message }),
    };
  }
};