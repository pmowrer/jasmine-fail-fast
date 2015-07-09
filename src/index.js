import _ from 'lodash';

// Jasmine doesn't yet have an option to fail fast. This "reporter" is a workaround for the time
// being, making Jasmine essentially skip all tests after the first failure.
// https://github.com/jasmine/jasmine/issues/414
// https://github.com/juliemr/minijasminenode/issues/20
export default function() {
  let specs = [];
  let suites = [];

  // Use specFilter to gather references to all specs.
  jasmine.getEnv().specFilter = spec => {
    specs.push(spec);
    return true;
  };

  // Wrap jasmine's describe function to gather references to all suites.
  jasmine.getEnv().describe = _.wrap(jasmine.getEnv().describe,
    (describe, ...args) => {
      let suite = describe.apply(null, args);
      suites.push(suite);
      return suite;
    });

  return {
    specDone(result) {
      // Hacky workaround to facilitate "fail fast". Disable all specs (basically `xit`), then
      // remove references to all before/after functions, else they'll still run. Disabling the
      // suites themselves does not appear to have an effect.
      if (result.status === 'failed') {
        specs.forEach(spec => spec.disable());

        suites.forEach(suite => {
          suite.beforeFns = [];
          suite.afterFns = [];
          suite.beforeAllFns = [];
          suite.afterAllFns = [];
        });
      }
    }
  };
}
