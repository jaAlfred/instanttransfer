const { getStore } = require('@netlify/blobs');
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

    // دسترسی به Netlify Blobs
    const store = getStore({ name: 'credentials-store' });
    
    // خواندن اطلاعات
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

    // هش کردن رمز عبور ورودی
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    console.log("Input password hash:", hashedPassword);

    if (username === credentials.username && hashedPassword === credentials.passwordHash) {
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