const withImages = require('next-images');

module.exports = withImages({
  trailingSlash: true,
  // #LAME https://github.com/nrwl/nx/issues/4182
  webpack(config) {
    // Prevent nx from adding an svg handler - stick to what is provided by
    // nextjs or that we have defined ourselves.
    config.module.rules.push = (...items) => {
      Array.prototype.push.call(config.module.rules, ...items.filter((item) => item.test.toString() !== '/\\.svg$/'));
    };

    return config;
  },
});
