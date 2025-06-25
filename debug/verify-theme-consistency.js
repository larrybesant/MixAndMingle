// Theme Consistency Verification Script
// Run this in browser console to verify all pages use consistent dark theme

console.log("🎨 Verifying Theme Consistency...");

const pages = [
  { name: "Landing Page", url: "/" },
  { name: "Login Page", url: "/login" },
  { name: "Signup Page", url: "/signup" },
  { name: "Setup Profile Page", url: "/setup-profile" },
  { name: "Dashboard Page", url: "/dashboard" },
];

const expectedDarkThemeClasses = [
  "bg-gradient-to-br",
  "from-black",
  "via-purple-900",
  "via-gray-900",
  "to-black",
  "text-white",
];

// Check current page theme
function checkCurrentPageTheme() {
  const body = document.body;
  const main = document.querySelector("main");
  const container = document.querySelector('[class*="min-h-screen"]');

  const element = container || main || body;
  if (!element) {
    console.log("❌ No main container found");
    return false;
  }

  const classes = element.className;
  console.log("🔍 Current page classes:", classes);

  // Check for dark theme indicators
  const hasDarkBg =
    classes.includes("bg-black") ||
    classes.includes("bg-gradient-to-br from-black") ||
    classes.includes("bg-gray-900");

  const hasLightText =
    classes.includes("text-white") || document.querySelector(".text-white");

  const hasNoLightBg =
    !classes.includes("bg-white") &&
    !classes.includes("from-purple-50") &&
    !classes.includes("to-pink-50");

  console.log("✅ Dark background:", hasDarkBg);
  console.log("✅ Light text:", hasLightText);
  console.log("✅ No light background:", hasNoLightBg);

  return hasDarkBg && hasLightText && hasNoLightBg;
}

// Main verification
const isThemeConsistent = checkCurrentPageTheme();

if (isThemeConsistent) {
  console.log("🎉 Theme consistency: PASSED");
  console.log("✅ Page uses consistent dark theme");
} else {
  console.log("❌ Theme consistency: FAILED");
  console.log("⚠️ Page may have theme inconsistencies");
}

console.log("\n📋 Manual Testing Guide:");
console.log("1. Visit each page:", pages.map((p) => p.url).join(", "));
console.log("2. Verify all pages have dark backgrounds");
console.log("3. Check that text is light colored (white/gray)");
console.log("4. Ensure no bright/light backgrounds appear");
console.log("5. Confirm smooth visual transitions between pages");

// Export for further testing
window.themeChecker = {
  checkCurrentPageTheme,
  pages,
  expectedDarkThemeClasses,
};
