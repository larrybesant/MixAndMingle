const madge = require("madge")
const path = require("path")
const fs = require("fs")

async function findUnusedDependencies() {
  console.log("Analyzing project dependencies...")

  // Get the list of dependencies from package.json
  const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"))
  const dependencies = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })

  // Create a dependency graph of your project
  const result = await madge(path.join(__dirname, ".."), {
    baseDir: path.join(__dirname, ".."),
    excludeRegExp: [/node_modules/, /\.next/, /\.git/, /\.vscode/, /public/],
    fileExtensions: ["js", "jsx", "ts", "tsx"],
  })

  // Get all modules used in your project
  const usedModules = new Set()
  Object.values(result.obj()).forEach((deps) => {
    deps.forEach((dep) => {
      // Extract the module name (first part of the path)
      const moduleName = dep.split("/")[0]
      if (!dep.startsWith(".")) {
        usedModules.add(moduleName)
      }
    })
  })

  // Find dependencies that are not used
  const unusedDependencies = dependencies.filter((dep) => !usedModules.has(dep))

  console.log("\nPotentially unused dependencies:")
  if (unusedDependencies.length === 0) {
    console.log("No unused dependencies found!")
  } else {
    unusedDependencies.forEach((dep) => {
      console.log(`- ${dep}`)
    })
    console.log("\nNote: This is a basic analysis and might have false positives.")
    console.log("Some dependencies might be used indirectly or via dynamic imports.")
  }
}

findUnusedDependencies().catch((err) => {
  console.error("Error analyzing dependencies:", err)
})
