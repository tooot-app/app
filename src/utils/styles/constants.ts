const Base = 4

export const StyleConstants = {
  Font: {
    Size: { S: 14, M: 16, L: 18 },
    LineHeight: { S: 18, M: 22, L: 30 },
    Weight: { Bold: '600' as '600' }
  },
  FontStyle: {
    S: { fontSize: 14, lineHeight: 18 },
    M: { fontSize: 16, lineHeight: 22 },
    L: { fontSize: 20, lineHeight: 30 }
  },

  Spacing: {
    XS: Base,
    S: Base * 2,
    M: Base * 4,
    L: Base * 6,
    XL: Base * 10,
    Global: { PagePadding: Base * 4 }
  },

  Avatar: { S: 36, M: 52, L: 104 }
}
