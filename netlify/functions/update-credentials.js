const crypto = require('crypto');

exports.handler = async (event, context) => {
  try {
    console.log("Starting update-credentials function");
    console.log("Received event:", JSON.stringify(event, null, 2));
    console.log("Request body:", event.body);

    // لود پویای @netlify/blobs
    const { getStore } = await import('@netlify/blobs');

    // چک کردن متغیرهای محیطی
    const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;
    if (!siteID || !token) {
      console.error("Missing environment variables for Netlify Blobs");
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: "خطا: متغیرهای محیطی Netlify Blobs تنظیم نشده‌اند." })
      };
    }

    if (!event.body) {
      console.log("No body in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "درخواست نامعتبر است: بدنه درخواست خالی است." })
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "خطا در پردازش درخواست: فرمت JSON نامعتبر است." })
      };
    }

    const { currentPassword, newUsername, newPassword } = parsedBody;
    console.log("Parsed currentPassword:", currentPassword);
    console.log("Parsed newUsername:", newUsername);
    console.log("Parsed newPassword:", newPassword);

    if (!currentPassword || !newUsername || !newPassword) {
      console.log("Missing required fields");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "همه فیلدها الزامی هستند." })
      };
    }

    // دسترسی به Netlify Blobs
    let store;
    try {
      store = getStore({ name: 'credentials-store', siteID, token });
      console.log("Successfully accessed Netlify Blobs store");
    } catch (error) {
      console.error("Error accessing Blobs store:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: "خطا در دسترسی به Netlify Blobs: " + error.message })
      };
    }

    // خواندن اطلاعات فعلی
    let credentials = { username: "sadra", passwordHash: "9218b0b811fc79481d8f7d077346ecf94cfd77d2d764099f5376972701504a63" };
    try {
      const data = await store.get('credentials', { type: 'json' });
      if (data) {
        credentials = data;
      }
      console.log("Current credentials:", credentials);
    } catch (error) {
      console.log("No credentials found in Blobs, using default credentials");
    }

    // هش کردن رمز عبور فعلی
    const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
    console.log("Input current password hash:", hashedCurrentPassword);

    // بررسی رمز عبور فعلی
    if (hashedCurrentPassword !== credentials.passwordHash) {
      console.log("Invalid current password");
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "رمز عبور فعلی اشتباه است." })
      };
    }

    // هش کردن رمز عبور جدید
    const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
    console.log("New password hash:", hashedNewPassword);

    // به‌روزرسانی اطلاعات
    credentials = { username: newUsername, passwordHash: hashedNewPassword };
    
    // ذخیره اطلاعات جدید در Netlify Blobs
    try {
      await store.setJSON('credentials', credentials);
      console.log("Credentials updated successfully in Blobs");
    } catch (error) {
      console.error("Error writing to Blobs:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: "خطا در ذخیره اطلاعات در Blobs: " + error.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "اطلاعات با موفقیت تغییر کرد." })
    };
  } catch (error) {
    console.error("Server error in update-credentials:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "خطا در سرور: " + error.message })
    };
  }
};