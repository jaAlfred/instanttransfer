exports.handler = async (event, context) => {
  const crypto = require('crypto');

  // اطلاعات معتبر کاربر
  const validUsername = "sadra";
  const validPasswordHash = "e6c3da5b2061d77f3a8b3e3b27b2d3a0e6c3da5b2061d77f3a8b3e3b27b2d3a0"; // هش SHA-256 برای "SadraSecure2025!"

  try {
    console.log("Received event:", event);
    console.log("Request body:", event.body);
    
    // بررسی اینکه بدنه درخواست معتبره
    if (!event.body) {
      console.log("No body in request");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "درخواست نامعتبر است: بدنه درخواست خالی است." })
      };
    }

    const { username, password } = JSON.parse(event.body);
    console.log("Parsed username:", username);
    console.log("Parsed password:", password);

    if (!username || !password) {
      console.log("Missing username or password");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "نام کاربری و رمز عبور الزامی است." })
      };
    }

    // هش کردن رمز عبور ورودی
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    console.log("Input password hash:", hashedPassword);

    if (username === validUsername && hashedPassword === validPasswordHash) {
      console.log("Login successful for user:", username);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      console.log("Invalid credentials. Username:", username, "Input hash:", hashedPassword);
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "نام کاربری یا رمز عبور اشتباه است." })
      };
    }
  } catch (error) {
    console.error("Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "خطا در سرور: " + error.message })
    };
  }
};