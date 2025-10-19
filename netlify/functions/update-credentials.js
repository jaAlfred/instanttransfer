const crypto = require('crypto');
   const { createClient } = require('@supabase/supabase-js');

   exports.handler = async (event, context) => {
     try {
       console.log("Starting update-credentials function");
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

       // خواندن اطلاعات فعلی از Supabase
       let credentials = { id: 1, username: "sadra", password_hash: "9218b0b811fc79481d8f7d077346ecf94cfd77d2d764099f5376972701504a63" };
       try {
         const { data, error } = await supabase
           .from('credentials')
           .select('*')
           .eq('id', 1)
           .single();
         if (data) {
           credentials = data;
         }
         if (error) {
           console.error("Error fetching credentials:", error);
         }
         console.log("Current credentials:", credentials);
       } catch (error) {
         console.log("No credentials found in Supabase, using default credentials");
       }

       // هش کردن رمز عبور فعلی
       const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
       console.log("Input current password hash:", hashedCurrentPassword);
       console.log("Stored password hash:", credentials.password_hash);

       // بررسی رمز عبور فعلی
       if (hashedCurrentPassword !== credentials.password_hash) {
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
       const newCredentials = { username: newUsername, password_hash: hashedNewPassword };

       // ذخیره اطلاعات جدید در Supabase
       try {
         const { data, error } = await supabase
           .from('credentials')
           .update(newCredentials)
           .eq('id', 1)
           .select()
           .single();
         if (error) throw error;
         console.log("Credentials updated successfully in Supabase:", data);
       } catch (error) {
         console.error("Error updating credentials in Supabase:", error);
         return {
           statusCode: 500,
           body: JSON.stringify({ success: false, message: "خطا در ذخیره اطلاعات در Supabase: " + error.message })
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