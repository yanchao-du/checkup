import * as strategyModule from '../../strategies/corppass.strategy';

describe('CorpPassStrategy module', () => {
  it('exports a CorpPassStrategy class', () => {
    expect(strategyModule.CorpPassStrategy).toBeDefined();
  });
});
