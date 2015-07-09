## jasmine-fail-fast
Allow Jasmine tests to "fail-fast", exiting on the first failure instead of running all tests no matter what. This can save a great deal of time running slow, expensive tests, such as Protractor e2e tests.

This module is a workaround to address the need for a fail-fast option in Jasmine, a feature that has been requested for years:

* https://github.com/jasmine/jasmine/issues/414
* https://github.com/juliemr/minijasminenode/issues/20

### Usage
This module is implemented as a Jasmine reporter. Add to the global Jasmine environment like so:

```javascript
var failFast = require('jasmine-fail-fast');

jasmine.getEnv().addReporter(failFast());
```
