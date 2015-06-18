# `portable.js` Intro Tut

First install `portable.js` globally using `npm`.

    npm i -g portable-js
    
This will install a command line tool `portable.js` (or `pjs` for convenience) you will use to package your apps.

To begin, in your project's folder you will have to create a `portable.js` manifest file that describes how to bundle your files.
 
Let's say you have a project `my-app`, with a typical node.js folder structure:

    my-app/
        app/
            standard/
                index.js
            feature/
                print-time.js
        node_modules/
            ...
        package.json
        portable.js
        
In `portable.js` manifest you have to define 3 variables: `dest`, `layer`, and `bundle`.

 - `dest` is simply the destination folder where the output will be saved.
 - `layer` defines the 'layers' or files that you want to package together.
 - `bundle` specifies the final output target, be it a browser app or a node.js app.
 
Let's start by creating a layer with the core functionality of our app. Edit your `portable.js` file to as follows:

```javascript
module.exports = {

    // The output folder.
    dest: './dist',
    
    // A collection of layers to build.
    layer: {
    
        // A layer named "standard".
        standard: {
            // The root folder where to start to look for files.
            src: './',
            // An array or a string of globs to match files,
            // which will be included in the layer.
            glob: [
                'app/standard/**/*.js',
                'node_modules/**/*.+(js|json)',
            ]
        }
    }
};
```

In your project's folder run this command to create your layers.

    portable.js layer
    
In `./dist` folder you will see a `.json` file containing the files you included in your layer. Now lets use that layer
to create a web app, add to your `portable.js` a bundle definition:

```javascript
module.exports = {
    dest: './dist',
    layer: {
        standard: {
            src: './',
            glob: [
                'app/standard/**/*.js',
                'node_modules/**/*.+(js|json)',
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
    }
};
```

Now run `portable.js bundle` command and you are *done*. Your freshly baked app is now available at [`./dist/app.js`](./dist/app.js).
All you need to do is include it in your HTML page with `<script src="./dist/app.js"></script>`.

To make your workflow more efficient, you can use the `server` command which will watch your folders and rebuild the
bundles automatically as you modify your files and instead of rewriting the bundle files in the `./dist` folder your
bundles will be served by a HTTP server. Specify a port you want to use for the server in the manifest file:

```javascript
module.exports = {
    dest: './dist',
    layer: {
        standard: {
            src: './',
            glob: [
                'app/standard/**/*.js',
                'node_modules/**/*.+(js|json)',
            ]
        }
    },
    bundle: {
        app: {
            target: 'browser-micro',
            volumes: [
                ['/my-app', 'standard']
            ],
            props: {
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
```

Start the server with the `server` command:

    portable.js server
    
Now in your HTML file specify the URL of the bundle as `<script src="https://127.0.0.1/bundles/app.js"></script>`.

*portable.js* creates an in-memory file system out of your layers. For example, you can print the location of your
current file, just as you do in node.js:

```javascript
console.log(__dirname);
// /my-app/app/standard
console.log(__filename);
// /my-app/app/standard/index.js
```

The `fs` module has two functions `fs.mountSync` and `fs.mount` that allow you to mount more files to your in-memory
file system.

 - `fs.mountSync(mountpoint: string, layer: {[s: string]: string})` where `mountpoint` is the root location of a layer
 that will be mounted, and `layer` is a JSON dictionary of relative file paths to file contents.
 - `fs.mount(mountpoint: string, url: string, callback: () => void)` is similar to `fs.mountSync` but instead you specify an URL
 of a `.json` file (a layer) which will be mounted, the callback parameter is a function that will be called when the
 layer has been downloaded and mounted.

For example, you can do:

```javascript
var fs = require('fs');
fs.mountSync('/my-app/app', {
    "hello-world.js": 'console.log("Hello world!");'
});
require('../hello-world.js');
// Hello world!
```
    
Let's say we have a feature in our app that we don't want to include in our main bundle, but we want to download that
code on-demand. For that we create a new layer and use `fs.mount` function to mount that layer when needed.

In your `portable.js` manifest you will create a new layer:

```javascript
module.exports = {
    // ...
    layer: {
        // ...
        
        // A layer named "feature".
        feature: {
            src: './',
            glob: 'app/feature/**/*.js'
        }
    },
    
    // ...
};
```

Now we can load that layer when needed like so:

```javascript
var fs = require('fs');
fs.mount('/my-app', 'https://127.0.0.1:1234/layers/feature.json', function() {
    require('../feature/print-time');
});
```
