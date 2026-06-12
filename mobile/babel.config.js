module.exports = function (api) {
  // api.env() must be called before api.cache() — calling env() after cache(true)
  // throws 'Caching has already been configured'.
  const isTest = api.env('test');
  api.cache(!isTest); // Cache in all environments except test (env changes cache key)

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: isTest ? 'react' : 'nativewind' }],
    ],
    plugins: isTest ? [] : [
      'react-native-reanimated/plugin',
    ],
  };
};
