export default function() {
  describe('Pass-fail-pass', () => {
    it('passes', () => {
      expect(true).toBeTruthy();
    });

    it('fails', () => {
      expect(true).toBeFalsy();
    });

    it('passes slowly', (done) => {
      setTimeout(() => {
        expect(true).toBeTruthy();
        done();
      }, 2000);
    });
  });
}
