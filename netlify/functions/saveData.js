// netlify/functions/saveData.js
exports.handler = async (event) => {
  console.log("داده‌ها دریافت شدند:", event.body);
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({ status: "success", message: "دریافت شد!" })
  };
};