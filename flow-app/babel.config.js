module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Disable Reanimated plugin for now (we'll add it in Phase 3)
          unstable_transformProfile: 'hermes-stable',
          reanimated: false,
        },
      ],
    ],
    plugins: [],
  };
};
