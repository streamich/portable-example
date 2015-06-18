
module.exports = {

  // The output folder.
  dest: './dist',

  // A collection of layers to build.
  layer: {
    // A layer named "standard".
    standard: {
      // The root folder where to start to look for files.
      src: './',
      // An array or a string of globs to match files, which will be included in the layer.
      glob: [
        'app/standard/**/*.js',
        'node_modules/**/*.+(js|json)'
      ]
    },
    // A layer named "feature".
    feature: {
      src: './',
      glob: [
        'app/feature/**/*.js'
      ]
    }
  },

  // A collection of bundles to create.
  bundle: {
    // A bundle named "app".
    app: {
      // Build an app for browser with minimal overhead.
      target: 'browser-micro',
      // Mount the "standard" layer you created at the "/my-app" folder.
      volumes: [
        ['/my-app', 'standard']
      ],
      // Provide parameters to the bundling function.
      props: {
        // Specify which file to run first when your app is loaded.
        argv: ['/my-app/app/standard/index.js']
      }
    }
  },

  // Server options.
  server: {
    // Port the server will bind to.
    port: 1234
  }

};
