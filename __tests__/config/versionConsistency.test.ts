import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');

const readGradleValue = (pattern: RegExp, label: string): string => {
  const gradle = fs.readFileSync(
    path.join(root, 'android/app/build.gradle'),
    'utf8',
  );
  const match = gradle.match(pattern);
  if (!match) {
    throw new Error(`Could not find ${label} in android/app/build.gradle`);
  }
  return match[1];
};

describe('version consistency across package.json, app.config.js and build.gradle', () => {
  const pkgVersion: string = require(path.join(root, 'package.json')).version;
  const appConfig = require(path.join(root, 'app.config.js')).expo;
  const gradleVersionName = readGradleValue(
    /versionName\s+"([^"]+)"/,
    'versionName',
  );
  const gradleVersionCode = Number(
    readGradleValue(/versionCode\s+(\d+)/, 'versionCode'),
  );

  it('app.config.js version matches package.json version', () => {
    expect({ source: 'app.config.js', version: appConfig.version }).toEqual({
      source: 'app.config.js',
      version: pkgVersion,
    });
  });

  it('build.gradle versionName matches package.json version', () => {
    expect({ source: 'build.gradle', versionName: gradleVersionName }).toEqual({
      source: 'build.gradle',
      versionName: pkgVersion,
    });
  });

  it('app.config.js android.versionCode matches build.gradle versionCode', () => {
    expect({
      source: 'app.config.js',
      versionCode: appConfig.android.versionCode,
    }).toEqual({ source: 'app.config.js', versionCode: gradleVersionCode });
  });
});
