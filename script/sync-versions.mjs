import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dependencyFields = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
];

const readJson = async filePath => JSON.parse(await readFile(filePath, 'utf8'));

const isWorkspacePackageName = name =>
  typeof name === 'string' && (name.startsWith('@metorial/') || name === 'metorial');

const expandWorkspacePattern = async pattern => {
  if (!pattern.endsWith('/*')) {
    return [path.join(rootDir, pattern, 'package.json')];
  }

  let workspaceDir = path.join(rootDir, pattern.slice(0, -2));

  try {
    let entries = await readdir(workspaceDir, { withFileTypes: true });

    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(workspaceDir, entry.name, 'package.json'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const getPackageJsonPaths = async () => {
  let rootPackageJson = await readJson(path.join(rootDir, 'package.json'));
  let workspacePatterns = rootPackageJson.workspaces ?? [];
  let packageJsonPaths = await Promise.all(workspacePatterns.map(expandWorkspacePattern));

  return packageJsonPaths.flat();
};

const getWorkspaceVersions = async packageJsonPaths => {
  let versions = new Map();

  for (let packageJsonPath of packageJsonPaths) {
    try {
      let packageJson = await readJson(packageJsonPath);
      let { name, version } = packageJson;

      if (isWorkspacePackageName(name) && version) {
        versions.set(name, version);
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue;
      }

      throw error;
    }
  }

  return versions;
};

const syncManifest = (packageJson, workspaceVersions) => {
  let changed = false;

  for (let field of dependencyFields) {
    let dependencies = packageJson[field];

    if (!dependencies) {
      continue;
    }

    for (let [name, currentRange] of Object.entries(dependencies)) {
      let workspaceVersion = workspaceVersions.get(name);

      if (!workspaceVersion) {
        continue;
      }

      let nextRange = `^${workspaceVersion}`;

      if (currentRange !== nextRange) {
        dependencies[name] = nextRange;
        changed = true;
      }
    }
  }

  return changed;
};

const writePackageJson = async (packageJsonPath, packageJson) => {
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
};

const runSyncPass = async packageJsonPaths => {
  let workspaceVersions = await getWorkspaceVersions(packageJsonPaths.slice(1));
  let updatedFiles = [];

  for (let packageJsonPath of packageJsonPaths) {
    let packageJson = await readJson(packageJsonPath);

    if (!syncManifest(packageJson, workspaceVersions)) {
      continue;
    }

    await writePackageJson(packageJsonPath, packageJson);
    updatedFiles.push(path.relative(rootDir, packageJsonPath));
  }

  return updatedFiles;
};

const main = async () => {
  let rootPackageJsonPath = path.join(rootDir, 'package.json');
  let packageJsonPaths = [rootPackageJsonPath, ...(await getPackageJsonPaths())];
  let allUpdatedFiles = [];
  let pass = 0;
  let maxPasses = packageJsonPaths.length + 1;

  while (pass < maxPasses) {
    pass += 1;

    let updatedFiles = await runSyncPass(packageJsonPaths);

    if (updatedFiles.length === 0) {
      break;
    }

    allUpdatedFiles.push(...updatedFiles);
  }

  if (pass >= maxPasses) {
    throw new Error(`Version sync did not converge after ${maxPasses} pass(es).`);
  }

  if (allUpdatedFiles.length === 0) {
    console.log('All local package versions are already in sync.');
    return;
  }

  let uniqueUpdatedFiles = [...new Set(allUpdatedFiles)];

  console.log(
    `Updated ${uniqueUpdatedFiles.length} package.json file(s) in ${pass} pass(es):`
  );

  for (let filePath of uniqueUpdatedFiles) {
    console.log(`- ${filePath}`);
  }
};

await main();
