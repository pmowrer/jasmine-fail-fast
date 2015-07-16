# jasmine-fail-fast [![build status](https://travis-ci.org/Updater/jasmine-fail-fast.svg?branch=master)](https://travis-ci.org/Updater/jasmine-fail-fast)

Allow Jasmine tests to "fail-fast", exiting on the first failure instead of running all tests no matter what. This can save a great deal of time running slow, expensive tests, such as Protractor e2e tests.

This module is a workaround to address the need for a fail-fast option in Jasmine, a feature that has been requested for years:

* https://github.com/jasmine/jasmine/issues/414
* https://github.com/juliemr/minijasminenode/issues/20

Inspired by https://github.com/goodeggs/jasmine-bail-fast, which doesn't seem to be working with Jasmine 2.x.

## Usage
This module is implemented as a Jasmine reporter. Add to the global Jasmine environment like so:

```javascript
var failFast = require('jasmine-fail-fast');
jasmine.getEnv().addReporter(failFast.init());
```

### Examples

#### Protractor
In the Protractor conf file:

```javascript
onPrepare: function() {
  ...
  var failFast = require('jasmine-fail-fast');
  jasmine.getEnv().addReporter(failFast.init());
  ...
}
```

#### As a Jasmine helper
Create a new .js file within the [helpers](http://jasmine.github.io/2.3/node.html#section-9) [folder](http://jasmine.github.io/2.3/node.html#section-Load_configuration_from_a_file_or_from_an_object.):

```javascript
//<path-to-helpers>/fail-fast.js
var failFast = require('jasmine-fail-fast');
jasmine.getEnv().addReporter(failFast.init());
```
#### grunt-contrib-jasmine
Set up as a helper, [optionally overriding the default helpers path](https://github.com/gruntjs/grunt-contrib-jasmine#optionshelpers).
