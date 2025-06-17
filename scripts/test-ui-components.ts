console.log("🎨 TESTING UI COMPONENTS")
console.log("========================")

const fs = require("fs")
const path = require("path")

// Test UI component files
const uiComponents = [
  "button.tsx",
  "card.tsx",
  "input.tsx",
  "avatar.tsx",
  "badge.tsx",
  "dialog.tsx",
  "dropdown-menu.tsx",
  "label.tsx",
  "select.tsx",
  "toast.tsx",
]

console.log("📁 Checking UI component files...")
const missingComponents = []

uiComponents.forEach((component) => {
  const filePath = path.join(process.cwd(), "components", "ui", component)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${component}: Present`)

    // Check if file has content
    const content = fs.readFileSync(filePath, "utf8")
    if (content.length < 100) {
      console.log(`⚠️  ${component}: File too small (may be incomplete)`)
    }
  } else {
    console.log(`❌ ${component}: Missing`)
    missingComponents.push(component)
  }
})

// Test page components
console.log("\n📄 Checking page components...")
const pageComponents = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/dashboard/page.tsx",
  "app/discover/page.tsx",
  "app/go-live/page.tsx",
]

pageComponents.forEach((page) => {
  const filePath = path.join(process.cwd(), page)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${page}: Present`)

    // Check for common React patterns
    const content = fs.readFileSync(filePath, "utf8")
    if (content.includes("export default")) {
      console.log(`  ✅ Has default export`)
    } else {
      console.log(`  ⚠️  Missing default export`)
    }

    if (content.includes("use client") || content.includes("use server")) {
      console.log(`  ✅ Has Next.js directive`)
    }
  } else {
    console.log(`❌ ${page}: Missing`)
  }
})

// Test import statements
console.log("\n📦 Testing common imports...")
try {
  const mainPagePath = path.join(process.cwd(), "app", "page.tsx")
  if (fs.existsSync(mainPagePath)) {
    const content = fs.readFileSync(mainPagePath, "utf8")

    // Check for problematic imports
    if (content.includes('from "firebase"')) {
      console.log("⚠️  Firebase import found (should be removed)")
    }

    if (content.includes("@/lib/supabase")) {
      console.log("✅ Supabase import found")
    }

    if (content.includes("lucide-react")) {
      console.log("✅ Lucide icons import found")
    }

    if (content.includes("@/components/ui")) {
      console.log("✅ UI components import found")
    }
  }
} catch (error) {
  console.log(`❌ Import test failed: ${error.message}`)
}

// Summary
console.log("\n📊 UI COMPONENT SUMMARY")
console.log("=======================")
console.log(`Total components checked: ${uiComponents.length}`)
console.log(`Missing components: ${missingComponents.length}`)

if (missingComponents.length === 0) {
  console.log("🎉 All UI components present!")
} else {
  console.log("❌ Missing components:")
  missingComponents.forEach((comp) => console.log(`  - ${comp}`))
}
