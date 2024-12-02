interface FontOptions {
  subsets?: string[];
  display?: string;
  weight?: string[] | string;
}

export function Inter(options: FontOptions) {
  return {
    className: 'inter',
    style: {
      fontFamily: 'Inter',
    },
  };
}
