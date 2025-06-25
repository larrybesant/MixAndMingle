/**
 * Signup Page Visual Diagnostic
 * Run this in browser console on /signup page to check styling issues
 */

console.log("🎨 SIGNUP PAGE VISUAL DIAGNOSTIC");
console.log("================================");

function diagnoseSignupPage() {
  // Check if page is loaded
  const signupForm = document.querySelector("form");
  const signupContainer = document.querySelector("div");

  console.log("📋 Page Elements Check:");
  console.log("Form found:", !!signupForm);
  console.log("Container found:", !!signupContainer);

  // Check Tailwind CSS
  const testDiv = document.createElement("div");
  testDiv.className = "bg-black text-white p-4";
  testDiv.style.display = "none";
  document.body.appendChild(testDiv);

  const computedStyle = window.getComputedStyle(testDiv);
  const isTailwindWorking = computedStyle.backgroundColor === "rgb(0, 0, 0)";

  console.log("🎨 Tailwind CSS Working:", isTailwindWorking);

  if (!isTailwindWorking) {
    console.error("❌ Tailwind CSS not loading properly");
  }

  document.body.removeChild(testDiv);

  // Check specific signup page elements
  const elements = {
    "Username Input": document.querySelector(
      'input[placeholder*="username" i]',
    ),
    "Email Input": document.querySelector('input[type="email"]'),
    "Password Input": document.querySelector('input[type="password"]'),
    "Language Select": document.querySelector('[role="combobox"]'),
    "Submit Button": document.querySelector('button[type="submit"]'),
    "Google Button": document.querySelector('button:not([type="submit"])'),
  };

  console.log("🔍 Form Elements:");
  Object.entries(elements).forEach(([name, element]) => {
    console.log(
      `${element ? "✅" : "❌"} ${name}: ${element ? "Found" : "Missing"}`,
    );
    if (element) {
      const style = window.getComputedStyle(element);
      console.log(`   Background: ${style.backgroundColor}`);
      console.log(`   Color: ${style.color}`);
      console.log(`   Border: ${style.border}`);
    }
  });

  // Check for CSS loading issues
  const stylesheets = Array.from(document.styleSheets);
  console.log("📄 Stylesheets loaded:", stylesheets.length);

  // Check for hydration issues
  const reactRoot =
    document.getElementById("__next") || document.querySelector("#root");
  console.log("⚛️ React root found:", !!reactRoot);

  // Look for console errors
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => {
    errors.push(args.join(" "));
    originalError(...args);
  };

  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log("❌ Console Errors:");
      errors.forEach((error) => console.log(`  • ${error}`));
    } else {
      console.log("✅ No console errors detected");
    }
  }, 1000);

  // Visual recommendations
  console.log("\n💡 Recommendations:");

  if (!isTailwindWorking) {
    console.log("1. Refresh the page to reload CSS");
    console.log("2. Check if globals.css is properly imported");
    console.log("3. Verify Tailwind config is correct");
  }

  if (!signupForm) {
    console.log("1. The signup form might not be rendering");
    console.log("2. Check for JavaScript errors preventing render");
  }

  if (signupForm && isTailwindWorking) {
    console.log("✅ Page structure looks good!");
    console.log("The issue might be:");
    console.log("• Theme/color scheme not matching expectations");
    console.log("• Layout positioning issues");
    console.log("• Component styling conflicts");
  }
}

// Run diagnostic
diagnoseSignupPage();

// Fix function for common issues
window.fixSignupStyling = function () {
  console.log("🔧 Attempting to fix styling issues...");

  // Force reload CSS
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    const href = link.href;
    link.href = "";
    setTimeout(() => (link.href = href), 10);
  });

  // Add fallback styles if needed
  const fallbackStyles = `
    .signup-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .signup-form {
      background: rgba(0, 0, 0, 0.8);
      padding: 2rem;
      border-radius: 0.5rem;
      width: 100%;
      max-width: 400px;
    }
    .signup-input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 0.25rem;
      color: white;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.textContent = fallbackStyles;
  document.head.appendChild(styleElement);

  console.log("✅ Fallback styles added");
};

console.log("\n🛠️ Available Commands:");
console.log("• diagnoseSignupPage() - Run diagnostic again");
console.log("• fixSignupStyling() - Apply fallback styles");
console.log("• location.reload() - Refresh page");
