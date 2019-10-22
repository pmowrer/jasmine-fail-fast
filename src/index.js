import _ from 'lodash';

let refs;
let failed;
let handleFailure;

// Jasmine doesn't yet have an option to fail fast. This "reporter" is a workaround for the time
// being, making Jasmine essentially skip all tests after the first failure.
// https://github.com/jasmine/jasmine/issues/414
// https://github.com/juliemr/minijasminenode/issues/20
export function init(alreadyFailed = false, onFailure) {
  refs = getSpecReferences();

  if (alreadyFailed) xEverything(refs)
  failed = alreadyFailed
  handleFailure = onFailure

  return {
    specDone(result) {
      if (result.status === 'failed') {
        shutItDown()
      }
    }
  };
}

export function shutItDown() {
  console.log([
    '| ',
    '|  🔥     🚀',
    '| 💥💥💥',
    '| 🔥🔥 FAIL FAST 🔥💥',
    '| 💥🌶',
    '|  🔥',
    '| 💥',
    '| ',
    ].join('\n'))
  disableSpecs(refs);
  if (failed || !handleFailure) return
  failed = true
  handleFailure()
}


/**
 * Searches through the spec tree for a suite whose description is tagged @sequence
 * AND which contains the test result that failed.
 *
 * If a failed @sequence suite is found, it disables just that suite, so that the
 * rest of the spec tree can proceed.
 *
 * @param {TestResult} result - the failing test
 */
function disableSpecSequence(result) {
  const { rootSuites } = refs
  rootSuites.find(function(suite) {
    const sequence = findSequenceForResult(result, suite)
    if (sequence) {
      disableSuite(sequence)
      return true
    }
  })
}

/**
 * Find a test suite that was tagged `isSequence = true` during init, and which
 * contains the failing test provided. Recursively searches all child suites
 *
 * @param {TestResult} result - the failing test
 * @param {TestSuite} suite - a parent suite to search
 * @return {TestSuite} - The highest parent suite that is marked @sequence and which
 *    contains the failing test
 */
function findSequenceForResult(result, suite) {
  const sequence = __findSequenceForResult(result, suite)
  if (typeof sequence !== 'boolean') return sequence
}

/**
 * Helper function that does all work of the above, except may return true or
 * false if either the matching test is not found or it's not within a sequence.
 */
function __findSequenceForResult(result, suite) {
  if (suite.description === result.description) {
    return true
  }
  if (!suite.children) return false
  for(var i=0; i<suite.children.length; i++) {
    const match = findSequenceForResult(result, suite.children[i])
    if (match === false) {
      continue
    } else if (match === true && suite.isSequence) {
      return suite
    } else if (match === true) {
      return true
    } else {
      return match
    }
  }
  return false
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
  const specs = [];
  const suites = [];
  const rootSuites = [];

  // var proc = jasmine.getEnv().process
  // proc.removeAllListeners('unhandledRejection');
  // proc.removeAllListeners('uncaughtException');
  // proc.on('unhandledRejection', uncaught);
  // proc.on('uncaughtException', uncaught);

  // function uncaught(weirdness) {
  //   proc.removeAllListeners('unhandledRejection');
  //   proc.removeAllListeners('uncaughtException');
  //   var error = new Error('this is fucking bad')
  //   console.log(error.message)
  //   console.error(error.stack)
  // }

  // Use specFilter to gather references to all specs.
  jasmine.getEnv().specFilter = spec => {
    specs.push(spec);
    return true;
  };


  // Wrap jasmine's describe function to gather references to all suites.
  jasmine.getEnv().describe = _.wrap(jasmine.getEnv().describe,
    (describe, ...args) => {
      let suite = describe.apply(null, args);
      const [ description ] = args
      if (description.match(/@sequence/)) suite.isSequence = true;
      if (!suite.parentSuite.description) rootSuites.push(suite);
      suites.push(suite);
      return suite;
    });

  return {
    specs,
    suites,
    rootSuites,
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

  refs.suites.forEach(disableSuite);
}

function disableSuite(suite) {
    suite.children.forEach(function (spec) {
      spec.markedPending = true
      if (spec.children) disableSuite(spec)
    })
    suite.markedPending = true
    suite.beforeFns = [];
    suite.afterFns = [];
    suite.beforeAllFns = [];
    suite.afterAllFns = [];
}
