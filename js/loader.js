// VERY ELABORATE SANDBOXING
// todo: clean up this mess

const resolve = require('resolve')
const path = require('path')
const vm = require('vm')
const fs = require('fs')
const Trace = require('./trace')
// const deasync = require('deasync')
// let {dialog} = require('electron').remote

let globals = {}

let loadFile
let runSandboxed = function (name, code, filename, dontAsk) {
  if (!globals[name]) {
    globals[name] = {
      process: {
        title: 'Sandbox',
        arch: process.arch,
        platform: process.platform
      }
    }
  }

  let dirname = path.parse(filename).dir
  let exports = {}
  let nresolve = function (path) {
    return resolve.sync(path, {
      basedir: dirname
    })
  }

  // let smb = dialog.showMessageBox.bind(this)
  let data = {
    exports: exports,
    module: {
      id: `sandbox:${filename}`,
      exports: exports,
      parent: undefined,
      filename: filename,
      loaded: false,
      children: [],
      paths: []
    },
    __filename: filename,
    __dirname: dirname,
    require: function (mpath) {
      if (mpath === 'trace') {
        return Trace
      }

      // don't ask about anything required by this module if it matches something that'd be found
      // in node_modules
      let _dontAsk = mpath.match(/^[a-z-]+$/) || dontAsk

      let filePath = nresolve(mpath)

      // let didRespond = false
      let response
      let allow
      if (dontAsk) allow = true
      else allow = window.confirm(`${name} wants to use module “${mpath}”\n\nPath: ${filePath}`)
      if (allow) response = loadFile(name, filePath, _dontAsk)
      else response = 'disallowed by user'
      /* smb({
        message: `${name} wants to use module ${mpath}`,
        detail: `Path: ${filePath}`,
        buttons: ['Allow', 'Reject'],
        cancelId: 1,
        defaultId: 0
      }, r => {
        console.log('response!', r)
        if (r === 0) {
          response = loadFile(name, filePath).then(x => {
            response = x
            didRespond = true
          }).catch(err => {
            response = err
            didRespond = true
          })
        } else {
          response = 'disallowed by user'
          didRespond = true
        }
      }) */
      // deasync.loopWhile(() => { return !didRespond })
      return response
    },
    console: {
      assert: function () {},
      clear: function () {},
      count: function () {},
      debug: function (...args) { console.debug(...args) },
      dir: function () {},
      dirxml: function () {},
      error: function (...args) { console.error(...args) },
      group: function () {},
      groupCollapsed: function () {},
      groupEnd: function () {},
      info: function (...args) { console.info(...args) },
      log: function (...args) { console.log(...args) },
      markTimeline: function () {},
      memory: { jsHeapSizeLimit: Infinity, totalJSHeapSize: Infinity, usedJSHeapSize: Infinity },
      profile: function () {},
      profileEnd: function () {},
      table: function () {},
      time: function () {},
      timeEnd: function () {},
      timeStamp: function () {},
      timeline: function () {},
      timelineEnd: function () {},
      trace: function (...args) { console.trace(...args) },
      warn: function (...args) { console.warn(...args) }
    },
    global: globals[name],
    process: globals[name].process,
    setTimeout: setTimeout, // todo: prevent access
    setInterval: setInterval,
    setImmediate: setImmediate,
    clearTimeout: clearTimeout,
    clearInterval: clearInterval,
    clearImmediate: clearImmediate,
    Buffer: Buffer
  }
  data.require.main = undefined
  data.require.resolve = nresolve
  data.require.extensions = {}
  vm.runInNewContext(code, data, {
    filename: filename
  })
  return data.module.exports
}

loadFile = function (name, path, dontAsk) {
  /* return new Promise((resolve, reject) => {
    fs.readFile(path, (err, file) => {
      if (err) {
        reject(err)
        return
      }

      file = file.toString()
      resolve(runSandboxed(name, file, path))
    })
  }) */
  let file
  try {
    file = fs.readFileSync(path)
  } catch (err) {
    return err
  }
  return runSandboxed(name, file, path, dontAsk)
}

module.exports = {
  resolve: resolve,
  load: loadFile,
  runSandboxed: runSandboxed
}
