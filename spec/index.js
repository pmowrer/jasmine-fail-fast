import {exec} from 'child_process';

describe('a suite with a failing spec', () => {
  describe('running without fail-fast', () => {
    it('runs all tests', done => {
      exec('./node_modules/.bin/jasmine spec/vanilla.js', (err, stdout) => {
        expect(stdout).toMatch(/Finished in 2./);
        done();
      });
    });
  });

  describe('running with fail-fast', () => {
    it('skips the remaining test(s) after the first failure', done => {
      exec('./node_modules/.bin/jasmine spec/failfast.js', (err, stdout) => {
        expect(stdout).toMatch(/Finished in 0.0/);
        done();
      });
    });
  });
});
