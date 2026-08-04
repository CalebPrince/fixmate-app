const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Native build output (Gradle/CMake temp dirs) churns files fast enough to
 * race Metro's watcher and crash it — keep it out of the watch scope entirely.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      /android\/(app\/)?(build|\.cxx|\.gradle)\/.*/,
      /ios\/build\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
