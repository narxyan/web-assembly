var Module = typeof Module != "undefined" ? Module : {};
var ENVIRONMENT_IS_WEB = typeof window == "object";
var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
var ENVIRONMENT_IS_NODE =
  typeof process == "object" &&
  typeof process.versions == "object" &&
  typeof process.versions.node == "string";
if (ENVIRONMENT_IS_NODE) {
}
var moduleOverrides = Object.assign({}, Module);
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = (status, toThrow) => {
  throw toThrow;
};
var scriptDirectory = "";
function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}
var readAsync, readBinary;
if (ENVIRONMENT_IS_NODE) {
  var fs = require("fs");
  var nodePath = require("path");
  scriptDirectory = __dirname + "/";
  readBinary = (filename) => {
    filename = isFileURI(filename)
      ? new URL(filename)
      : nodePath.normalize(filename);
    var ret = fs.readFileSync(filename);
    return ret;
  };
  readAsync = (filename, binary = true) => {
    filename = isFileURI(filename)
      ? new URL(filename)
      : nodePath.normalize(filename);
    return new Promise((resolve, reject) => {
      fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(binary ? data.buffer : data);
      });
    });
  };
  if (!Module["thisProgram"] && process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, "/");
  }
  arguments_ = process.argv.slice(2);
  if (typeof module != "undefined") {
    module["exports"] = Module;
  }
  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document != "undefined" && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.startsWith("blob:")) {
    scriptDirectory = "";
  } else {
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
    );
  }
  {
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(xhr.response);
      };
    }
    readAsync = (url) => {
      if (isFileURI(url)) {
        return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              resolve(xhr.response);
              return;
            }
            reject(xhr.status);
          };
          xhr.onerror = reject;
          xhr.send(null);
        });
      }
      return fetch(url, { credentials: "same-origin" }).then((response) => {
        if (response.ok) {
          return response.arrayBuffer();
        }
        return Promise.reject(
          new Error(response.status + " : " + response.url)
        );
      });
    };
  }
} else {
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.error.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
var wasmBinary = Module["wasmBinary"];
var wasmMemory;
var ABORT = false;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module["HEAP8"] = HEAP8 = new Int8Array(b);
  Module["HEAP16"] = HEAP16 = new Int16Array(b);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
  Module["HEAP32"] = HEAP32 = new Int32Array(b);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function")
      Module["preRun"] = [Module["preRun"]];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function postRun() {
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function")
      Module["postRun"] = [Module["postRun"]];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function addRunDependency(id) {
  runDependencies++;
  Module["monitorRunDependencies"]?.(runDependencies);
}
function removeRunDependency(id) {
  runDependencies--;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
function abort(what) {
  Module["onAbort"]?.(what);
  what = "Aborted(" + what + ")";
  err(what);
  ABORT = true;
  what += ". Build with -sASSERTIONS for more info.";
  var e = new WebAssembly.RuntimeError(what);
  throw e;
}
var dataURIPrefix = "data:application/octet-stream;base64,";
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
var isFileURI = (filename) => filename.startsWith("file://");
function findWasmBinary() {
  var f = "stats.wasm";
  if (!isDataURI(f)) {
    return locateFile(f);
  }
  return f;
}
var wasmBinaryFile;
function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
}
function getBinaryPromise(binaryFile) {
  if (!wasmBinary) {
    return readAsync(binaryFile).then(
      (response) => new Uint8Array(response),
      () => getBinarySync(binaryFile)
    );
  }
  return Promise.resolve().then(() => getBinarySync(binaryFile));
}
function instantiateArrayBuffer(binaryFile, imports, receiver) {
  return getBinaryPromise(binaryFile)
    .then((binary) => WebAssembly.instantiate(binary, imports))
    .then(receiver, (reason) => {
      err(`failed to asynchronously prepare wasm: ${reason}`);
      abort(reason);
    });
}
function instantiateAsync(binary, binaryFile, imports, callback) {
  if (
    !binary &&
    typeof WebAssembly.instantiateStreaming == "function" &&
    !isDataURI(binaryFile) &&
    !isFileURI(binaryFile) &&
    !ENVIRONMENT_IS_NODE &&
    typeof fetch == "function"
  ) {
    return fetch(binaryFile, { credentials: "same-origin" }).then(
      (response) => {
        var result = WebAssembly.instantiateStreaming(response, imports);
        return result.then(callback, function (reason) {
          err(`wasm streaming compile failed: ${reason}`);
          err("falling back to ArrayBuffer instantiation");
          return instantiateArrayBuffer(binaryFile, imports, callback);
        });
      }
    );
  }
  return instantiateArrayBuffer(binaryFile, imports, callback);
}
function getWasmImports() {
  return { env: wasmImports, wasi_snapshot_preview1: wasmImports };
}
function createWasm() {
  var info = getWasmImports();
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;
    wasmMemory = wasmExports["memory"];
    updateMemoryViews();
    addOnInit(wasmExports["__wasm_call_ctors"]);
    removeRunDependency("wasm-instantiate");
    return wasmExports;
  }
  addRunDependency("wasm-instantiate");
  function receiveInstantiationResult(result) {
    receiveInstance(result["instance"]);
  }
  if (Module["instantiateWasm"]) {
    try {
      return Module["instantiateWasm"](info, receiveInstance);
    } catch (e) {
      err(`Module.instantiateWasm callback failed with error: ${e}`);
      return false;
    }
  }
  if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
  instantiateAsync(
    wasmBinary,
    wasmBinaryFile,
    info,
    receiveInstantiationResult
  );
  return {};
}
var callRuntimeCallbacks = (callbacks) => {
  while (callbacks.length > 0) {
    callbacks.shift()(Module);
  }
};
var noExitRuntime = Module["noExitRuntime"] || true;
var abortOnCannotGrowMemory = (requestedSize) => {
  abort("OOM");
};
var _emscripten_resize_heap = (requestedSize) => {
  var oldSize = HEAPU8.length;
  requestedSize >>>= 0;
  abortOnCannotGrowMemory(requestedSize);
};
var wasmImports = { emscripten_resize_heap: _emscripten_resize_heap };
var wasmExports = createWasm();
var ___wasm_call_ctors = () =>
  (___wasm_call_ctors = wasmExports["__wasm_call_ctors"])();
var _calculate_mean = (Module["_calculate_mean"] = (a0, a1) =>
  (_calculate_mean = Module["_calculate_mean"] = wasmExports["calculate_mean"])(
    a0,
    a1
  ));
var _calculate_variance = (Module["_calculate_variance"] = (a0, a1) =>
  (_calculate_variance = Module["_calculate_variance"] =
    wasmExports["calculate_variance"])(a0, a1));
var _malloc = (Module["_malloc"] = (a0) =>
  (_malloc = Module["_malloc"] = wasmExports["malloc"])(a0));
var _free = (Module["_free"] = (a0) =>
  (_free = Module["_free"] = wasmExports["free"])(a0));
var __emscripten_stack_restore = (a0) =>
  (__emscripten_stack_restore = wasmExports["_emscripten_stack_restore"])(a0);
var __emscripten_stack_alloc = (a0) =>
  (__emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"])(a0);
var _emscripten_stack_get_current = () =>
  (_emscripten_stack_get_current =
    wasmExports["emscripten_stack_get_current"])();
var calledRun;
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};
function run() {
  if (runDependencies > 0) {
    return;
  }
  preRun();
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module["calledRun"] = true;
    if (ABORT) return;
    initRuntime();
    Module["onRuntimeInitialized"]?.();
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(() => {
      setTimeout(() => Module["setStatus"](""), 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function")
    Module["preInit"] = [Module["preInit"]];
  while (Module["preInit"].length > 0) {
    Module["preInit"].pop()();
  }
}
run();
