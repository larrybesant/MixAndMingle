// Simple test for local signup
async function testSignup() {
  console.log("Testing local signup...\n");

  const testData = {
    email: "test@example.com",
    password: "TestPass123!",
    metadata: {
      full_name: "Test User",
      username: "testuser123",
    },
  };

  console.log("Sending data:", JSON.stringify(testData, null, 2));

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log("Response:", data);

    try {
      const jsonData = JSON.parse(data);
      console.log("Parsed JSON:", JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log("Response is not JSON");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run test
testSignup();
