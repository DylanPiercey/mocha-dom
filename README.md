<h1 align="center">
  <!-- Logo -->
  <br/>
  mocha-dom
	<br/>

  <!-- Language -->
  <a href="http://typescriptlang.org">
    <img src="https://img.shields.io/badge/%3C%2F%3E-typescript-blue.svg" alt="TypeScript"/>
  </a>
  <!-- Format -->
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with prettier"/>
  </a>
  <!-- CI -->
  <a href="https://github.com/dylanpiercey/mocha-dom/actions/workflows/ci.yml">
    <img src="https://github.com/dylanpiercey/mocha-dom/actions/workflows/ci.yml/badge.svg" alt="Build status"/>
  </a>
  <!-- Coverage -->
  <a href="https://codecov.io/gh/dylanpiercey/mocha-dom">
    <img src="https://codecov.io/gh/dylanpiercey/mocha-dom/branch/main/graph/badge.svg?token=2911ea0b-0733-4a30-9986-591ed205b1b1"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/mocha-dom">
    <img src="https://img.shields.io/npm/v/mocha-dom.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/mocha-dom">
    <img src="https://img.shields.io/npm/dm/mocha-dom.svg" alt="Downloads"/>
  </a>
</h1>

Run Mocha tests in an isolated JSDOM environment.

# Why

- Allows modules to run in a _pure_ JSDOM environment that does not pollute node's globals and will not interfere with your server tests. Works by using [jsdom-context-require](https://github.com/mlrawlings/jsdom-context-require).
- Avoids needing to bring in a bundler for your test suites, popular require hooks work fine, while still having clear separation for server and browser tests.
- Easy to setup!

# Installation

```console
npm install jsdom mocha-dom -D
```

# Example

When running the Mocha CLI, pass `--require mocha-dom`.
By default this will cause _all_ tests loaded to run in a JSDOM environment.
You can configure this to instead match a glob of test files via a root level [`.mochadomrc` config file](#config-file).

```console
mocha --require mocha-dom
```

# JSDOM API

In your tests a global `jsdom` object is exposed that maps to the [JSDOM Object API](https://github.com/jsdom/jsdom#jsdom-object-api).

This allows you to configure JSDOM during your tests, for example to update the URL you could use the following:

```js
jsdom.reconfigure({ url: "https://example.com/" });
```

Note if the `url` is constant, it would be better to set via the [config file](#config-file).

# Config file

You can configure this to instead match a glob of test files via a root level [`.mochadomrc.js` config file].
The config file can have any extension supported by node, by default `.js` or `.json`.

```js
module.exports = {
  // The test files that should be loaded into the JSDOM environment.
  // Defaults to include every test file, example below shows matching a subset
  // of test files.
  files: "**/*.browser.test.js",

  // The initial HTML to load into the document,
  // below is the default value.
  html: "<!DOCTYPE html><html><head></head><body></body></html>",

  // Everything else is forwarded to JSDOM.
  // See: https://github.com/jsdom/jsdom#customizing-jsdom
  url: "https://example.com/",
};
```

## Config auto completion

If using a `.mochadomrc.js` file you can import the `defineConfig` helper, like so:

```js
module.exports = require("mocha-dom").defineConfig({
  files: "...",
});
```

If using TypeScript you can enable config auto completion by using creating a `.mochadomrc.ts` file like the following:

```ts
import type { Config } from "mocha-dom";

export default {
  files: "...",
} as Config;
```

Both of these are optional, but will provide autocompletion for the various config options.

## Using with frameworks

For frameworks which do not rely on compiling different code for the browser, existing require/register hooks will work fine. For example, to use React just be sure to run Mocha with `@babel/register`, `esbuild-register`, `@swc/register` or similar and things will just work.

For frameworks which _do_ compile to different code in the browser or server, you can add their require/register hooks within the `.mochadomrc` file. When doing so you can usually provide the output target as an option. Any require hooks added via the `.mochadomrc` only apply to tests that match the `files` option. This means you can use server require/register hooks normally, and just add browser specific ones in the `.mochadomrc`.

Below are some example `.mochadomrc` configs for frameworks which have browser specific compiled output.

### [Marko](https://markojs.com)

```js
require("@marko/compiler/register")({ output: "dom" });

module.exports = {
  files: "**/*.browser.test.js",
};
```

### [Svelte](https://svelte.dev)

```js
require("svelte/register")({ generate: "dom" });

module.exports = {
  files: "**/*.browser.test.js",
};
```

### [Solid](https://www.solidjs.com/)

```js
require("@babel/register", {
  extensions: [".jsx"],
  plugins: ["solid"],
});

module.exports = {
  files: "**/*.browser.test.js",
};
```
