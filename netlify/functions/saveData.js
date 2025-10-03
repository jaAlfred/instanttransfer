exports.handler = async (event) => {
  console.log("داده‌ها:", event.body); // این خط رو حتماً نگه دار
  
  // بقیه کد Google Sheets رو موقتاً غیرفعال کن
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "logged" })
  };
};