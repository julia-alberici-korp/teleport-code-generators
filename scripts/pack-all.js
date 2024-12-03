const { execSync } = require('child_process');
const { readdirSync, statSync, readFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const packagesDir = join(__dirname, '../packages');

const packages = readdirSync(packagesDir).filter((name) => {
  const packagePath = join(packagesDir, name);
  if (statSync(packagePath).isDirectory()) {
    const packageJsonPath = join(packagePath, 'package.json');
    if (statSync(packageJsonPath).isFile()) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      return packageJson.name && packageJson.name.includes('viasoft');
    }
  }
  return false;
});

const publishDir = join(__dirname, '../viasoft-publish');
if (!existsSync(publishDir)) {
  mkdirSync(publishDir);
}

packages.forEach((pkg) => {
  const distDir = join(packagesDir, pkg, 'dist');
  try {
    process.chdir(distDir);
    console.log(`Packing ${pkg}...`);
    execSync(`npm pack --pack-destination ${publishDir}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to pack ${pkg}:`, error);
  }
});