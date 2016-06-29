
describe('entry point', function() {
  it('should load the entry point without error', function() {
    require('../src/index');
    return Promise.resolve();
  });
});
