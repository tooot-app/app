const Base = 4

export const StyleConstants = {
  Font: {
    Size: { S: 14, M: 16, L: 18 },
    LineHeight: { S: 18, M: 21, L: 26 },
    Weight: { Normal: '400' as '400', Bold: '600' as '600' }
  },
  FontStyle: {
    S: { fontSize: 14, lineHeight: 18 },
    M: { fontSize: 16, lineHeight: 21 },
    L: { fontSize: 20, lineHeight: 26 }
  },

  Spacing: {
    XS: Base,
    S: Base * 2,
    M: Base * 4,
    L: Base * 6,
    XL: Base * 10,
    Global: { PagePadding: Base * 4 }
  },

  Avatar: { XS: 32, S: 40, M: 48, L: 96 }
}
