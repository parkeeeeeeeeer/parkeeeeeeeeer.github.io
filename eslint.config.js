import eslintJs from '@eslint/js';
import globals from 'globals';

module.exports = {
    // This ensures ESLint knows what file types to lint
    overrides: [
      {
        files: ['*.js'],  // Lint both .js and .ts files
        parserOptions: {
          ecmaVersion: 2020,  // Enable modern JS features
          sourceType: 'module', // Enable ES6 module syntax
        },
        rules: {
          // You can customize your rules here or leave it as default
        },
      },
    ],
  };
  