
const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const packagesDir = join(__dirname, '../packages');

const packages = readdirSync(packagesDir).filter((name) => {
  const packagePath = join(packagesDir, name);
  return statSync(packagePath).isDirectory();
});

packages.forEach((pkg) => {
  const distDir = join(packagesDir, pkg, 'dist');
  try {
    process.chdir(distDir);
    console.log(`Packing ${pkg}...`);
    execSync('npm pack', { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to pack ${pkg}:`, error);
  }
});