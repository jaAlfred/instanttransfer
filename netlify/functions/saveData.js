// netlify/functions/saveData.js
const { google } = require('googleapis');

// اطلاعات شیت
const SHEET_ID = '1KI2MGru1__zMP8kHvCCA0HE3mM-03HhT3gMj5rajuZ8';
const SHEET_NAME = 'Sheet1'; // نام شیت خودت رو اینجا بذار

// اعتبارنامه‌های سرویس (محتوای فایل JSON دانلود‌شده)
const CREDENTIALS = {
  "type": "service_account",
  "project_id": "transaction-474012",
  "private_key_id": "55ab6641aa8923ab8ef11e3abfc4e01102b45dc0",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDvXj6f0+pLWO3I\nAPj32k459dTlxaNiUf84B4wqLMIJDz29cSAk1royzN33SP9+VRo1lBPL5YAkEDzd\ngg0ygd9t+FqvDZviTpdUD2fx1Qp7ah0xHG25DtPo9sqZIzzDQWEXjuKoMW1U5ra0\ntGVu0HVe1Q3ygFRg94c1Cvm/fyEGc1xxqyrzCGu4gl9t6Io+VEzrcMNWNm/XnMUg\n9JwLaiP8yxcZdLhbZDzfwRO7AMObdcsaMrsUR5OxNY00mv0lTvBoVX3q1VLsolPO\nafIhiRVxcuwepG3snx0AiGXC/vln4HLojpYq9FXex4R/R90VDe5ZCnWySniIaVCd\nfyOjaPgBAgMBAAECggEAHBEkbbA2/jvAsd1vU/ychI5PNtv8QuiTcPntlPpnjBFl\n72Mm3jrxXUiJVFgSYTlQV+zzf0p7Qn9G68A2lPAGh0oCNBl36ErH0rr1uLT+xCbW\nom4PbY4QCfZ6Hge0Nb7iSBVgfVFCXRyqWrj2Vc6KnKKFvqQOgMo1Z+JQE4SwFiXR\npipnzss87lQFjuewzCnL2MP/OqKE25beG0LMlMp2BzCLSXOClEG4jrHWTTPqYNeO\nwIaiMiYI6aH1UyHIJ+6b164lC0eTYb69iywHb2+BvQWag0akWGxPBuVwuSDEl7cJ\nNikTOucVRTqG2AGMVrSvgyNpL1acyrY0IuBnmOYbMwKBgQD8pWvU+GqEF1npRn8n\nC5qQBdmRK9Pq3++nC0NRqCvB6L8ljdvDfsfCc8Evge7FQ/DYK99nv2QiVmAn6/cP\n6T5xbaqYxtDuMG85dxWWHa19fmR76bfZL2G2ZPpkgTqA1t8AuSaKkAfRzbhpoi5w\ny0z21Mk8CCFompylalktMnxxZwKBgQDyi7M4BfEmBirH14RQoWyZcum7Kgse8LkJ\njyQlLFMPdHzcioWEUZ2zSpberMMNwfFEA5VhIXpAnHMN/6ErMPIJvPzKJHI9jCPv\nfF8/3bckd1WLpQlgc3YV/39K+mSWIgy5p0bRhfWFgWIe3DhX6IKL0aU0tZO+0MzK\nWHVZsINiVwKBgQC8AFy9nh2lLbs6W7tC0t+xTKkZ3gNURE+RflAZ84qcQRX8XBOs\n5irACGM5dva21FfkhME58rIQ2zWyf2TZ8jcFMRZBmbDfjis2F+d4TZ1MRUGA8+pb\nM2cC0yGAqKlgNoS7hQupEITBGtSfxo/IX4BmLPGSOnqh3Gu0q+6wM2FnAQKBgQCW\n5Y0RjLjT5EBXZmDeXR+YdCKwG98hV7h3FwPw0Ju4YMuR1ehtQu2u7vff/3G2rHNy\n0hvsewx5CByYl/JoUaIzps1K4dPlMLvmseT8ce8QE+I35+xmgk70Lqm+Nvu/X920\n3zoy/nmanr0x3+Z54qDdZge3PER4EaVnOhOAQk3rLwKBgHuZivV1jTL/NMLr4QOL\nHxqbmLEc9Hch+sDtA4ee21Hs2rfPe939v0jVpY8lu9i5EwFyK56PaQJkDOoU58h2\n/H1OuH9liL1CLQeS/yNSkMaevalZ2OOcQSawuKsHpHLwSMzqFBLCT84gkKUSIHTW\n+BIlT2ZX+Se2XkZGd7tGJFbv\n-----END PRIVATE KEY-----\n",
  "client_email": "netlify-sheets-writer@transaction-474012.iam.gserviceaccount.com",
  "client_id": "102417095148155623253",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/netlify-sheets-writer%40transaction-474012.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}


exports.handler = async (event) => {
  try {
    const records = JSON.parse(event.body);

    // احراز هویت با Google
    const auth = new google.auth.JWT(
      CREDENTIALS.client_email,
      null,
      CREDENTIALS.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // داده‌ها رو به شیت اضافه کن
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'success', message: 'داده‌ها در Google Sheet ذخیره شد!' })
    };
  } catch (error) {
    console.error('خطا:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};