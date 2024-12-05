interface FontOptions {
  subsets?: string[];
  display?: string;
  weight?: string[] | string;
}

export function Inter(_options: FontOptions) {
  return {
    className: 'inter',
    style: {
      fontFamily: 'Inter',
    },
  };
}
