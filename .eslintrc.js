module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "jw",
  "rules": {
    "indent": [
        2,
        2
    ],
    "linebreak-style": [
        2,
        "unix"
    ]
  },
  ecmaFeatures: {
    experimentalObjectRestSpread: true
  }
};
