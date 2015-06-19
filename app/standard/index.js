
console.log('This is the "standard" app.');
console.log(__dirname);
console.log(__filename);


var fs = require('fs');
fs.mountSync('/my-app/app', {
    "hello-world.js": 'console.log("Hello world!");'
});
require('../hello-world.js');


console.log("Now let's load additional features.");
fs.mount('/my-app', 'https://127.0.0.1:1234/layers/feature.json', function() {
    require('../feature/print-time');
});


var Module = require('module');
Module.async = function(args) {
    args[1]('module ' + args[0]);
};

require('test', function(test) {
    console.log(test);
});