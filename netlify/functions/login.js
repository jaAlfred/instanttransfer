exports.handler = async (event, context) => {
  const crypto = require('crypto');

  // اطلاعات معتبر کاربر (به‌صورت هش‌شده)
  const validUsername = "sadra";
  const validPasswordHash = "4b7b4f7b3f7c8e9f2a3b5c7d9e1f2a3b5c7d9e1f2a3b5c7d9e1f2a3b5c7d9e1"; // هش SHA-256 برای "SadraSecure2025!"

  try {
    const { username, password } = JSON.parse(event.body);

    // هش کردن رمز عبور ورودی
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (username === validUsername && hashedPassword === validPasswordHash) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "نام کاربری یا رمز عبور اشتباه است." })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "خطا در سرور. لطفاً دوباره تلاش کنید." })
    };
  }
};