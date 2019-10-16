import _ from 'lodash';

let refs;

// Jasmine doesn't yet have an option to fail fast. This "reporter" is a workaround for the time
// being, making Jasmine essentially skip all tests after the first failure.
// https://github.com/jasmine/jasmine/issues/414
// https://github.com/juliemr/minijasminenode/issues/20
export function init(alreadyFailed = false, onFailure) {
  refs = getSpecReferences();

  if (alreadyFailed) xEverything(refs)

  return {
    specDone(result) {
      if (result.status === 'failed') {
        disableSpecs(refs);
        if (alreadyFailed || !onFailure) return
        alreadyFailed = true
        onFailure()
      }
    }
  };
}

/**
 * Turn every call to describe into a (skipped) xdescribe, and same for it/xit.
 *
 * @return void
 */
export function xEverything() {
  jasmine.getEnv().describe = _.wrap(jasmine.getEnv().describe,
    (describe, ...args) => {
      let suite = describe.apply(null, args);
      suite.markedPending = true
      suite.result.pendingReason = 'failfast'
      return suite;
    });

  jasmine.getEnv().it = _.wrap(jasmine.getEnv().it,
    (it, ...args) => {
      let test = it.apply(null, args);
      test.markedPending = true
      test.result.pendingReason = 'failfast'
      return test;
    });
}

/**
 * Gather references to all jasmine specs and suites, through any (currently hacky) means possible.
 *
 * @return {Object} An object with `specs` and `suites` properties, arrays of respective types.
 */
export function getSpecReferences() {
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
    specs,
    suites
  };
}

/**
 * Hacky workaround to facilitate "fail fast". Disable all specs (basically `xit`), then
 * remove references to all before/after functions, else they'll still run. Disabling the
 * suites themselves does not appear to have an effect.
 */
export function disableSpecs() {
  if (!refs) {
    throw new Error('jasmine-fail-fast: Must call init() before calling disableSpecs()!');
  }

  refs.specs.forEach(spec => spec.disable());

  refs.suites.forEach(suite => {
    suite.beforeFns = [];
    suite.afterFns = [];
    suite.beforeAllFns = [];
    suite.afterAllFns = [];
  });
}
