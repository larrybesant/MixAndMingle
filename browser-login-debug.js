/**
 * Browser Login Debugging Script
 * Copy and paste this into your browser console on the login page
 * This will help us diagnose exactly what's happening
 */

console.log("🔧 Starting browser login debugging...");

// Test 1: Check if the page is loading correctly
console.log("1️⃣ Page environment check:");
console.log("- URL:", window.location.href);
console.log("- Title:", document.title);
console.log("- Login form exists:", !!document.querySelector('input[type="email"]'));
console.log("- Sign in button exists:", !!document.querySelector('button'));

// Test 2: Check Supabase client
console.log("\n2️⃣ Supabase client check:");
if (window.supabase) {
    console.log("✅ Supabase client available");
    console.log("- URL:", window.supabase.supabaseUrl);
} else {
    console.log("❌ Supabase client not found in window");
}

// Test 3: Check for React DevTools
console.log("\n3️⃣ React environment check:");
console.log("- React DevTools:", !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
console.log("- Next.js:", !!window.__NEXT_DATA__);

// Test 4: Network connectivity test
console.log("\n4️⃣ Testing network connectivity...");
fetch('/api/login-diagnostic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
    })
})
.then(response => response.json())
.then(data => {
    console.log("✅ API connectivity test result:", data);
})
.catch(error => {
    console.log("❌ API connectivity test failed:", error);
});

// Test 5: Create a manual login test function
window.debugLogin = async function(email = 'test@example.com', password = 'TestPassword123!') {
    console.log("\n🔐 Starting manual login test...");
    console.log("Email:", email);
    console.log("Password length:", password.length);
    
    try {
        // First create a test account
        console.log("📝 Creating test account...");
        const signupResponse = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                username: `test${Date.now()}`
            })
        });
        
        const signupData = await signupResponse.json();
        console.log("Signup result:", signupData);
        
        if (signupData.success) {
            // Now test login
            console.log("🔑 Testing login...");
            const loginResponse = await fetch('/api/login-diagnostic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const loginData = await loginResponse.json();
            console.log("Login result:", loginData);
            
            if (loginData.success) {
                console.log("✅ Manual login test successful!");
                return { success: true, userId: loginData.user_id };
            } else {
                console.log("❌ Manual login test failed:", loginData.error);
                return { success: false, error: loginData.error };
            }
        } else {
            console.log("❌ Account creation failed:", signupData.error);
            return { success: false, error: signupData.error };
        }
    } catch (error) {
        console.log("💥 Manual login test error:", error);
        return { success: false, error: error.message };
    }
};

// Test 6: Check for button click events
console.log("\n5️⃣ Setting up button click monitoring...");
const buttons = document.querySelectorAll('button');
buttons.forEach((button, index) => {
    button.addEventListener('click', function(e) {
        console.log(`🖱️ Button ${index} clicked:`, button.textContent);
        console.log("- Event:", e);
        console.log("- Button disabled:", button.disabled);
        console.log("- Button class:", button.className);
    });
});

// Test 7: Monitor form inputs
console.log("\n6️⃣ Setting up input monitoring...");
const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');

if (emailInput) {
    emailInput.addEventListener('input', function() {
        console.log("📧 Email input changed:", this.value);
    });
}

if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        console.log("🔑 Password input changed, length:", this.value.length);
    });
}

console.log("\n✅ Browser debugging setup complete!");
console.log("\n📋 INSTRUCTIONS:");
console.log("1. Try logging in normally and watch the console");
console.log("2. Or run: debugLogin('your-email@example.com', 'YourPassword123!')");
console.log("3. Or click the green 'Create & Login Test Account' button");
console.log("4. Report what messages you see in this console");

// Test 8: Check current state
console.log("\n7️⃣ Current page state:");
console.log("- Email field value:", emailInput?.value || 'not found');
console.log("- Password field value length:", passwordInput?.value?.length || 'not found');
console.log("- Sign in button text:", document.querySelector('button')?.textContent || 'not found');
