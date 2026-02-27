const fs = require("fs");
const path = require("path");

const stubDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "@types",
  "mapbox__point-geometry"
);

if (fs.existsSync(stubDir)) {
  const indexPath = path.join(stubDir, "index.d.ts");
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, "export {};\n");
  }
}
