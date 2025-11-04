import { maskName } from './nameMasking';

describe('maskName', () => {
  it('should mask a typical 2-word name', () => {
    expect(maskName('Mariange Thok')).toBe('Mari**** Th**');
  });

  it('should mask a 4-word name', () => {
    expect(maskName('Nur Aisyah Binte Rahman')).toBe('Nu* Ais*** Bin** Rah***');
  });

  it('should handle single-character names', () => {
    expect(maskName('A')).toBe('A');
    expect(maskName('A B')).toBe('A B');
  });

  it('should handle 2-character names', () => {
    expect(maskName('Li')).toBe('L*');
    expect(maskName('Ng Wei')).toBe('N* We*');
  });

  it('should handle 3-character names', () => {
    expect(maskName('Tan')).toBe('Ta*');
    expect(maskName('Lim Ah Kow')).toBe('Li* A* Ko*');
  });

  it('should handle very long names', () => {
    expect(maskName('Christopher')).toBe('Chri*******');
    expect(maskName('Alexandria')).toBe('Alex******');
  });

  it('should handle empty string', () => {
    expect(maskName('')).toBe('');
  });

  it('should handle names with extra spaces', () => {
    expect(maskName('  Maria   Santos  ')).toBe('Mar** San***');
  });

  it('should handle single word names', () => {
    expect(maskName('Maria')).toBe('Mar**');
  });

  it('should show exactly 4 characters for names longer than 8 characters', () => {
    expect(maskName('Elizabeth')).toBe('Eliz*****');
  });

  it('should show half the characters (rounded up) for names 4-7 characters', () => {
    expect(maskName('John')).toBe('Jo**'); // 4 chars: show 2 (half)
    expect(maskName('Sarah')).toBe('Sar**'); // 5 chars: show 3 (ceil(5/2))
    expect(maskName('Robert')).toBe('Rob***'); // 6 chars: show 3 (half)
    expect(maskName('Michael')).toBe('Mich***'); // 7 chars: show 4 (ceil(7/2))
  });

  it('should handle common Singapore names', () => {
    expect(maskName('Tan Ah Kow')).toBe('Ta* A* Ko*');
    expect(maskName('Lim Siew Hong')).toBe('Li* Si** Ho**');
    expect(maskName('Kumar Selvam')).toBe('Kum** Sel***'); // Kumar: 5 chars, show 3 (ceil(5/2))
    expect(maskName('Siti Nurhaliza')).toBe('Si** Nurh*****'); // Siti: 4 chars, show 2; Nurhaliza: 9 chars, show 4 (capped)
  });

  it('should handle foreign worker names', () => {
    expect(maskName('Maria Elena Santos')).toBe('Mar** Ele** San***');
    expect(maskName('Muhammad Ali')).toBe('Muha**** Al*');
  });
});
