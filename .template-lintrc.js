module.exports = {
  plugins: ["ember-template-lint-plugin-discourse"],
  extends: "discourse:recommended",
  rules: {
    "simple-unless": 'off',
  }
};
