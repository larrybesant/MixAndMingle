const https = require("https");

const data = JSON.stringify({
  email: "test@example.com",
  password: "TestPass123!",
  metadata: {
    full_name: "Test User",
    username: "testuser123",
  },
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/auth/signup",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

console.log("Sending request to signup API...");
console.log("Data:", data);

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let responseData = "";
  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    console.log("Response:", responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log("Parsed JSON:", JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log("Response is not JSON");
    }
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.write(data);
req.end();
