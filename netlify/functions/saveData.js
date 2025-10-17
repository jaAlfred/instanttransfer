const { google } = require('googleapis');
const moment = require('jalali-moment');

// تابع تبدیل به تاریخ شمسی
function toPersianDate(gregorianDate) {
  return moment(gregorianDate).locale('fa').format('YYYY-MM-DD');
}

// تابع تبدیل اعداد انگلیسی به فارسی
function toPersianDigits(number) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return number.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

exports.handler = async (event) => {
  try {
    // Parse incoming data
    const data = JSON.parse(event.body);
    console.log('📤 داده‌ها برای ارسال به شیت:', data);

    // Google Sheets credentials
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    console.log('🔧 private_key تصحیح شد');

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1KI2MGru1__zMP8kHvCCA0HE3mM-03HhT3gMj5rajuZ8';

    // Get current date in Persian format
    const today = toPersianDate(new Date());

    // Read existing rows to count parts for today
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!H:H', // ستون تاریخ
    });
    const rows = getRows.data.values || [];
    const todayRows = rows.filter(row => row[0] === today);
    const partNumber = todayRows.length + 1; // شماره پارت برای امروز

    // Prepare data with part number and Persian date
    const values = data.map(item => [
      item.company,
      item.account,
      item.name,
      item.sheba,
      item.destBank,
      toPersianDigits(item.amount), // تبدیل amount به اعداد فارسی
      partNumber, // شماره پارت
      today // تاریخ شمسی
    ]);

    // Append data to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1:H', // شامل ستون‌های جدید
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'داده‌ها با موفقیت ذخیره شدند' })
    };
  } catch (error) {
    console.error('❌ خطا در اتصال به Google Sheets:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'خطا در ذخیره داده‌ها در Google Sheets' })
    };
  }
};