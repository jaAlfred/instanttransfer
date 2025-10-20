exports.handler = async (event, context) => {
     try {
       // چک کردن هدر Authorization یا توکن توی کوکی‌ها
       const { user } = context.clientContext || {};
       if (!user) {
         return {
           statusCode: 401,
           body: JSON.stringify({ success: false, message: "لطفاً ابتدا وارد شوید." }),
           headers: {
             "Location": "/index.html",
             "Cache-Control": "no-cache"
           }
         };
       }

       // اگه کاربر لاگین کرده، اجازه دسترسی به form.html می‌دیم
       return {
         statusCode: 200,
         body: "",
         headers: {
           "x-netlify-original-pathname": "/form.html"
         }
       };
     } catch (error) {
       console.error("Error in check-auth:", error);
       return {
         statusCode: 500,
         body: JSON.stringify({ success: false, message: "خطا در سرور: " + error.message })
       };
     }
   };