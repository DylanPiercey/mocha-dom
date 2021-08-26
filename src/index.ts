import path from "path";
import Mocha from "mocha";
import { makeRe } from "picomatch";
import createBrowser from "jsdom-context-require";

declare namespace globalThis {
  let jsdom: ReturnType<typeof createBrowser>;
}

declare global {
  const jsdom: ReturnType<typeof createBrowser>;
}

export type Config = Omit<
  Parameters<typeof createBrowser>[0],
  "extensions" | "dir"
> & {
  files?: string | string[];
};

export function defineConfig(config: Config) {
  return config;
}

const { files, ...browserConfig } = ((() => {
  const originalExtensions = { ...require.extensions };
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(path.resolve(".mochadomrc"));
    return {
      ...(config.default || config),
      extensions: { ...require.extensions },
    };
    // eslint-disable-next-line no-empty
  } catch {
  } finally {
    // Undo require hooks added by mochadomrc.
    for (const key in originalExtensions) {
      require.extensions[key] = originalExtensions[key];
    }

    for (const key in require.extensions) {
      if (!(key in originalExtensions)) {
        delete require.extensions[key];
      }
    }
  }
})() || {}) as Config;

const testFile = (() => {
  if (!files) {
    return () => true;
  } else if (Array.isArray(files)) {
    const regExps = files.map((file) => makeRe(file));
    return (file: string) => regExps.some((reg) => reg.test(file));
  } else {
    const regExp = makeRe(files);
    return regExp.test.bind(regExp);
  }
})();

const proto = Mocha.prototype as any;
const browser = (globalThis.jsdom = createBrowser({
  dir: __dirname,
  ...browserConfig,
}));
browser.window.jsdom = browser;

proto.loadFiles = proto.loadFilesAsync = function (
  this: Mocha,
  cb: () => void | undefined
) {
  for (const file of this.files) {
    let req = require;
    let ctx = global;

    if (testFile(file)) {
      req = browser.require as any;
      ctx = browser.window as any;
      req.cache[file] = undefined;
    }

    const resolved = path.resolve(file);
    this.suite.emit("pre-require", ctx, resolved, this);
    this.suite.emit("require", req(resolved), resolved, this);
    this.suite.emit("post-require", ctx, resolved, this);
  }

  cb?.();
};
