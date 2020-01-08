module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "globals": {
        "window": true,
        "define": true,
        "require": true,
        "module": true,
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "es6": true,
        },
        "sourceType": "module"
    },
    "plugins": [
        "babel",
        "prettier"
    ],
    "rules": {
        "indent": ["error", 2],
        "linebreak-style": [ "error", "unix" ],
        "quotes": [ "error", "single" ],
        "semi": [ "error", "always"],
        "max-len": [2, { "code": 100 } ],
    }
};