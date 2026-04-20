const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const templatePath = path.join(repoRoot, 'widget-example', 'index.html')
const outputDir = path.join(repoRoot, '.dev')
const outputPath = path.join(outputDir, 'phone-island-dev.html')

const template = fs.readFileSync(templatePath, 'utf8')

const cssBlock = `    <!-- IMPORT THE WIDGET CSS -->
    <link
      rel="stylesheet"
      type="text/css"
      href="https://cdn.jsdelivr.net/gh/nethesis/phone-island@latest/dist-widget/index.widget.css"
    />`

const scriptBlock = `    <!-- IMPORT THE WIDGET JS -->
   <script
      type="text/javascript"
      src="https://cdn.jsdelivr.net/gh/nethesis/phone-island@latest/dist-widget/index.widget.js"
    ></script>

    <!-- INTEGRATION SCRIPT -->
    <script type="text/javascript" src="./index.js"></script>`

if (!template.includes(cssBlock) || !template.includes(scriptBlock)) {
  throw new Error('Dev host template markers not found in widget-example/index.html')
}

const devHost = template
  .replace(cssBlock, '')
  .replace(scriptBlock, `    <script type="module" src="../src/dev-widget-example.ts"></script>`)

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(outputPath, devHost)

console.log(`Generated dev host at ${path.relative(repoRoot, outputPath)}`)
