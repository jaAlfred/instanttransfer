const fs = require('fs').promises;
const crypto = require('crypto');

exports.handler = async (event, context) => {
  try {
    console.log("Received event:", event);
    console.log("Request body:", event.body);

    if (!event.body) {
      console.log("No body in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "درخواست نامعتبر است: بدنه درخواست خالی است." })
      };
    }

    const { currentPassword, newUsername, newPassword } = JSON.parse(event.body);
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

    // مسیر فایل credentials.json
    const credentialsFile = './credentials.json';
    
    // خواندن اطلاعات فعلی
    let credentials = { username: "sadra", passwordHash: "9218b0b811fc79481d8f7d077346ecf94cfd77d2d764099f5376972701504a63" };
    try {
      const data = await fs.readFile(credentialsFile, 'utf8');
      credentials = JSON.parse(data);
    } catch (error) {
      console.log("No credentials file found, using default credentials");
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
    
    // ذخیره اطلاعات جدید (فقط در محیط محلی کار می‌کند)
    try {
      await fs.writeFile(credentialsFile, JSON.stringify(credentials, null, 2));
      console.log("Credentials updated successfully");
    } catch (error) {
      console.error("Error writing credentials file:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: "خطا در ذخیره اطلاعات: " + error.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "اطلاعات با موفقیت تغییر کرد." })
    };
  } catch (error) {
    console.error("Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "خطا در سرور: " + error.message })
    };
  }
};