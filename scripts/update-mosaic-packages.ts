/* eslint-disable no-console */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type DistTagType = 'prerelease' | 'latest';

type PackageDistTags = {
  [tag in DistTagType]: string;
};

type PackageInfoT = {
  'dist-tags': PackageDistTags;
};

function runYarnCommand(args: string[], wsPath?: string): string {
  const stdout = execFileSync(
    process.platform === 'win32' ? 'yarn.cmd' : 'yarn',
    args,
    { cwd: wsPath },
  );

  return stdout.toString();
}

function getPackageDistTags(packageName: string): PackageDistTags {
  // With Yarn 2+, we have to use `yarn npm info <package name> --json` to get a pretty broad payload for each package.
  // It's only in this payload that we can find the `prerelease` and `latest` tags.
  // Access path goes as .dist-tags.prerelease and .dist-tags.latest in the JSON.
  const stdout = runYarnCommand(['npm', 'info', packageName, '--json']);
  const distTags = eval(`(${stdout})`) as PackageInfoT;
  return distTags['dist-tags'];
}

function updateMosaicDeps(
  packageJson: any,
  dependencyType: 'dependencies' | 'devDependencies',
  tag: DistTagType,
): void {
  const dependencies = Object.keys(packageJson[dependencyType] ?? {});
  const mosaicDependencies = dependencies.filter((d) =>
    d.startsWith('@axinom/mosaic-'),
  );

  if (mosaicDependencies.length === 0) {
    return;
  }

  console.log(` | ${dependencyType}`);
  for (const packageName of mosaicDependencies) {
    const distTags = getPackageDistTags(packageName);
    const currentVersion = packageJson[dependencyType][packageName];
    const newVersion = distTags[tag];
    if (currentVersion !== newVersion) {
      console.log(` |  ${packageName}@${currentVersion} > ${newVersion}`);
      packageJson[dependencyType][packageName] = newVersion;
    }
  }
}

function updatePackageJson(wsPath: string, tag: DistTagType): void {
  const packageJsonPath = path.join(wsPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  updateMosaicDeps(packageJson, 'dependencies', tag);
  updateMosaicDeps(packageJson, 'devDependencies', tag);

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * This script updates all `@axinom/mosaic-*` packages in all workspaces to the `prerelease` tag (by default).
 * It is also possible to use `latest`.
 */
function run(tag: DistTagType = 'prerelease'): void {
  updatePackageJson('.', tag); // We can use . since there are no separate workspaces.
  console.log('Updating yarn.lock');
  runYarnCommand(['install']);
}

function main(): void {
  const argv = process.argv.slice(2);
  const tag: DistTagType = (argv[0] as DistTagType) ?? 'prerelease';

  run(tag);

  console.log('Done.');
}

main();
