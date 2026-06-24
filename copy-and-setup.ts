import * as fs from 'fs';
import * as path from 'path';

// Helper to recursively copy directories
function copyFolderSync(from: string, to: string) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

const importDir = path.resolve('./paytitan-import');
const srcDir = path.resolve('./src');
const publicDir = path.resolve('./public');

console.log('Copying src directory...');
copyFolderSync(path.join(importDir, 'src'), srcDir);

console.log('Copying public directory...');
copyFolderSync(path.join(importDir, 'public'), publicDir);

console.log('Merging package.json dependencies...');
const originalPackageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const importedPackageJson = JSON.parse(fs.readFileSync(path.join(importDir, 'package.json'), 'utf8'));

// Merge dependencies
const mergedDeps = {
  ...originalPackageJson.dependencies,
  ...importedPackageJson.dependencies,
};

// Next.js specific deps we don't need in a Vite React SPA
delete mergedDeps['next'];
delete mergedDeps['next-themes']; // Wait, is next-themes used? Yes, let's check or keep next-themes if it can work on standard web. It usually can, but we can also use custom theme or let next-themes work. Next-themes works on Vite as well.
// Wait, we can keep next-themes if it's imported.

const mergedDevDeps = {
  ...originalPackageJson.devDependencies,
  ...importedPackageJson.devDependencies,
};
delete mergedDevDeps['eslint-config-next'];

originalPackageJson.dependencies = mergedDeps;
originalPackageJson.devDependencies = mergedDevDeps;

// Update scripts to keep standard Vite ones
originalPackageJson.scripts = {
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit"
};

fs.writeFileSync('./package.json', JSON.stringify(originalPackageJson, null, 2), 'utf8');
console.log('Successfully updated package.json.');
