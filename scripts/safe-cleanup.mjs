import { existsSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const shouldExecute = args.has('--execute');
const includeTypes = args.has('--remove-types');
const includeUnusedFunction = args.has('--remove-unused-create-order');

const removablePaths = [
  'dist',
  'node_modules',
  path.join('backend', 'node_modules'),
  path.join('src', 'assets', 'react.svg'),
  path.join('src', 'assets', 'vite.svg'),
];

const manualFollowUps = [
  {
    label: 'Unused function candidate',
    path: path.join('src', 'services', 'orderApi.js'),
    detail: 'Exported `createOrder` appears unused in the current frontend code. Review before removing.',
    enabled: includeUnusedFunction,
  },
  {
    label: 'Likely unnecessary JS-only type packages',
    path: 'package.json',
    detail: 'Consider removing `@types/react` and `@types/react-dom` if you want a leaner JS-only setup.',
    enabled: includeTypes,
  },
];

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const describePath = (relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);

  if (!existsSync(absolutePath)) {
    return { relativePath, exists: false, size: 0, absolutePath };
  }

  const stats = statSync(absolutePath);

  return {
    relativePath,
    exists: true,
    size: stats.size,
    isDirectory: stats.isDirectory(),
    absolutePath,
  };
};

const targets = removablePaths.map(describePath);
const existingTargets = targets.filter((target) => target.exists);

console.log('Safe Cleanup Report');
console.log(`Mode: ${shouldExecute ? 'EXECUTE' : 'DRY RUN'}`);
console.log('');

if (!existingTargets.length) {
  console.log('No removable targets found.');
} else {
  for (const target of existingTargets) {
    console.log(`- ${target.relativePath} (${target.isDirectory ? 'directory' : 'file'})`);
  }
}

console.log('');
console.log('Manual review items:');
for (const item of manualFollowUps) {
  console.log(`- ${item.label}: ${item.detail}`);
}

if (!shouldExecute) {
  console.log('');
  console.log('No files were removed. Re-run with `--execute` to perform the cleanup.');
  console.log('Optional flags:');
  console.log('- `--remove-types` to remind yourself to remove JS-only type packages');
  console.log('- `--remove-unused-create-order` to remind yourself to manually review that export');
  process.exit(0);
}

for (const target of existingTargets) {
  rmSync(target.absolutePath, { recursive: true, force: true });
  console.log(`Removed: ${target.relativePath}`);
}

console.log('');
console.log('Cleanup complete.');

if (includeUnusedFunction) {
  console.log('- Follow-up: manually review and remove `createOrder` from `src/services/orderApi.js` if you do not need manual orders.');
}

if (includeTypes) {
  console.log('- Follow-up: manually remove `@types/react` and `@types/react-dom` from `package.json` if you want to slim dependencies.');
}
