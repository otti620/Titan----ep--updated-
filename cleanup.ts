import * as fs from 'fs';
import * as path from 'path';

function deleteFolderRecursive(directoryPath: string) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

console.log('Cleaning up paytitan-import directory...');
deleteFolderRecursive(path.resolve('./paytitan-import'));

console.log('Cleaning up Next.js specific files inside src...');
const filesToDelete = [
  './src/app/layout.tsx',
  './src/app/loading.tsx',
  './src/app/not-found.tsx'
];

filesToDelete.forEach(file => {
  const resolved = path.resolve(file);
  if (fs.existsSync(resolved)) {
    fs.unlinkSync(resolved);
    console.log(`Deleted ${file}`);
  }
});

console.log('Cleaning up Next.js API directory...');
deleteFolderRecursive(path.resolve('./src/app/api'));

console.log('Cleanup finished!');
