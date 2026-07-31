const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    { ignores: ["node_modules"] },
    {
        files: ["**/*.js"],
        ...js.configs.recommended,
        languageOptions: {
            sourceType: "commonjs",
            globals: globals.node
        }
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: globals.jest
        }
    }
];
