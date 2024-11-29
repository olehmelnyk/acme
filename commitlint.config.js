module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 200],
    'footer-max-line-length': [2, 'always', 200],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', ['sentence-case']],
    'type-enum': [
      2,
      'always',
      [
        'feat',      // New feature
        'fix',       // Bug fix
        'docs',      // Documentation only changes
        'style',     // Changes that do not affect the meaning of the code
        'refactor',  // A code change that neither fixes a bug nor adds a feature
        'perf',      // A code change that improves performance
        'test',      // Adding missing tests or correcting existing tests
        'build',     // Changes that affect the build system or external dependencies
        'ci',        // Changes to our CI configuration files and scripts
        'chore',     // Other changes that don't modify src or test files
        'revert',    // Reverts a previous commit
        'security',  // Security improvements or vulnerability fixes
        'temp',      // Temporary changes or work in progress
        'translation', // Internationalization and localization changes
        'changeset', // Changes related to version management and changelogs
      ],
    ],
  },
};
