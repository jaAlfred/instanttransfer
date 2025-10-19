const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  try {
    console.log("Starting login function");
    console.log("Received event:", JSON.stringify(event, null, 2));
    console.log("Request body:", event.body);

    // چک کردن متغیرهای محیطی Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: "خطا: متغیرهای Supabase تنظیم نشده‌اند." })
      };
    }
    console.log("Supabase environment found:", { supabaseUrl, supabaseKey: supabaseKey.substring(0, 10) + "..." });

    // ایجاد کلاینت Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { username, password } = parsedBody;
    console.log("Parsed username:", username);
    console.log("Parsed password:", password);

    if (!username || !password) {
      console.log("Missing username or password");
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: "نام کاربری و رمز عبور الزامی است." })
      };
    }

    // خواندن اطلاعات از Supabase
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error || !data) {
      console.error("Error fetching credentials or no record found:", error);
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: "رکوردی با id=1 یافت نشد." })
      };
    }
    console.log("Current credentials:", data);

    // هش کردن رمز عبور ورودی
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    console.log("Input password hash:", hashedPassword);
    console.log("Stored password hash:", data.password_hash);

    if (username === data.username && hashedPassword === data.password_hash) {
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
    console.error("Server error in login:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "خطا در سرور: " + error.message })
    };
  }
};