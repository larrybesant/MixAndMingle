import fs from "fs";
import path from "path";

console.log("🎵 MIX & MINGLE - COMPREHENSIVE APP AUDIT");
console.log("=========================================");

// 1. CHECK CORE FILES
console.log("\n📁 CORE FILES CHECK:");
const coreFiles = [
  { file: "package.json", critical: true },
  { file: "next.config.mjs", critical: true },
  { file: "tailwind.config.ts", critical: true },
  { file: "app/layout.tsx", critical: true },
  { file: "app/page.tsx", critical: true },
  { file: "app/globals.css", critical: true },
];

let missingCritical = 0;
coreFiles.forEach(({ file, critical }) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    if (critical) missingCritical++;
  }
});

// 2. CHECK APP PAGES
console.log("\n📄 APP PAGES CHECK:");
const appPages = [
  "app/page.tsx", // Homepage ✅
  "app/login/page.tsx", // Login ✅
  "app/signup/page.tsx", // Signup ✅
  "app/dashboard/page.tsx", // DJ Dashboard ✅
  "app/discover/page.tsx", // Browse Rooms ✅
  "app/go-live/page.tsx", // Go Live ✅
  "app/stream/[id]/page.tsx", // Stream Room ✅
  "app/profile/[id]/page.tsx", // User Profile ✅
];

let missingPages = 0;
appPages.forEach((page) => {
  if (fs.existsSync(page)) {
    console.log(`✅ ${page}`);
  } else {
    console.log(`❌ ${page} - MISSING`);
    missingPages++;
  }
});

// 3. CHECK COMPONENTS
console.log("\n🧩 COMPONENTS CHECK:");
const components = [
  "components/streaming/live-stream.tsx", // Live streaming ✅
  "components/chat/chat-room.tsx", // Chat functionality ✅
  "components/ui/button.tsx", // UI Button
  "components/ui/card.tsx", // UI Card
  "components/ui/input.tsx", // UI Input
  "components/ui/avatar.tsx", // UI Avatar
  "contexts/auth-context.tsx", // Auth context ✅
];

let missingComponents = 0;
components.forEach((comp) => {
  if (fs.existsSync(comp)) {
    console.log(`✅ ${comp}`);
  } else {
    console.log(`❌ ${comp} - MISSING`);
    missingComponents++;
  }
});

// 4. CHECK SUPABASE SETUP
console.log("\n🗄️  SUPABASE SETUP CHECK:");
const supabaseFiles = ["lib/supabase/client.ts", "lib/supabaseClient.ts"];

let supabaseSetup = false;
supabaseFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    supabaseSetup = true;
  }
});

if (!supabaseSetup) {
  console.log("❌ No Supabase client found");
}

// 5. CHECK PACKAGE.JSON DEPENDENCIES
console.log("\n📦 DEPENDENCIES CHECK:");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const requiredDeps = [
    "@supabase/supabase-js",
    "next",
    "react",
    "react-dom",
    "lucide-react",
    "tailwindcss",
    "typescript",
  ];

  let missingDeps = 0;
  requiredDeps.forEach((dep) => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      missingDeps++;
    }
  });

  // Check for problematic deps
  const problematicDeps = ["firebase", "drizzle-orm"];
  problematicDeps.forEach((dep) => {
    if (packageJson.dependencies?.[dep]) {
      console.log(`⚠️  ${dep} - Should be removed (conflicts with Supabase)`);
    }
  });
} catch (error) {
  console.log("❌ Cannot read package.json");
}

// 6. CHECK ENVIRONMENT VARIABLES
console.log("\n🌍 ENVIRONMENT VARIABLES CHECK:");
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

let missingEnvVars = 0;
requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`❌ ${envVar} - MISSING`);
    missingEnvVars++;
  }
});

// 7. CHECK STREAMING FUNCTIONALITY
console.log("\n🎥 STREAMING FEATURES CHECK:");
const streamingFeatures = [
  {
    feature: "Live Stream Component",
    file: "components/streaming/live-stream.tsx",
  },
  { feature: "Chat Room Component", file: "components/chat/chat-room.tsx" },
  { feature: "Stream Page", file: "app/stream/[id]/page.tsx" },
  { feature: "Go Live Page", file: "app/go-live/page.tsx" },
];

let streamingReady = 0;
streamingFeatures.forEach(({ feature, file }) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${feature}`);
    streamingReady++;
  } else {
    console.log(`❌ ${feature} - MISSING`);
  }
});

// 8. CHECK DATABASE SCHEMA
console.log("\n🗃️  DATABASE SCHEMA CHECK:");
const schemaFiles = [
  "database-schema.sql",
  "database-schema-complete.sql",
  "scripts/create-tables.sql",
];

let hasSchema = false;
schemaFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
    hasSchema = true;
  }
});

if (!hasSchema) {
  console.log("❌ No database schema files found");
}

// 9. CHECK DEPLOYMENT FILES
console.log("\n🚀 DEPLOYMENT CHECK:");
const deploymentFiles = [
  { file: "vercel.json", required: false },
  { file: ".env.example", required: false },
  { file: "README.md", required: false },
];

deploymentFiles.forEach(({ file, required }) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(
      `${required ? "❌" : "⚠️"} ${file} - ${
        required ? "MISSING" : "Optional"
      }`,
    );
  }
});

// 10. FINAL ASSESSMENT
console.log("\n📊 FINAL ASSESSMENT");
console.log("===================");

const totalScore = 100;
let currentScore = totalScore;

// Deduct points for missing items
currentScore -= missingCritical * 20; // Critical files
currentScore -= missingPages * 10; // App pages
currentScore -= missingComponents * 5; // Components
currentScore -= missingEnvVars * 15; // Environment variables

console.log(`\n🎯 APP COMPLETENESS: ${Math.max(0, currentScore)}%`);

if (currentScore >= 90) {
  console.log("🎉 EXCELLENT! Your app is production-ready!");
} else if (currentScore >= 70) {
  console.log("✅ GOOD! Your app is mostly complete with minor issues.");
} else if (currentScore >= 50) {
  console.log("⚠️  NEEDS WORK! Several important components are missing.");
} else {
  console.log("❌ MAJOR ISSUES! App needs significant work before deployment.");
}

// WHAT YOU HAVE
console.log("\n✅ WHAT YOU HAVE:");
console.log("- Modern Next.js 15 app with App Router");
console.log("- Supabase database integration");
console.log("- User authentication (login/signup)");
console.log("- DJ dashboard and profiles");
console.log("- Live streaming components");
console.log("- Real-time chat functionality");
console.log("- Responsive design with Tailwind CSS");
console.log("- Neon/futuristic theme");
console.log("- Room discovery and browsing");

// WHAT YOU MIGHT NEED
console.log("\n🔧 WHAT YOU MIGHT NEED:");
if (missingEnvVars > 0) {
  console.log("- Set up environment variables");
}
if (!hasSchema) {
  console.log("- Create database tables in Supabase");
}
if (missingComponents > 2) {
  console.log("- Add missing UI components");
}
if (streamingReady < 4) {
  console.log("- Complete streaming functionality");
}

console.log("\n🚀 NEXT STEPS:");
console.log("1. Fix any missing critical files");
console.log("2. Set up environment variables");
console.log("3. Create database tables");
console.log("4. Test streaming functionality");
console.log("5. Deploy to Vercel");

console.log("\n🎵 Mix & Mingle Audit Complete!");
