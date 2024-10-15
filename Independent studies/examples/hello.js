"use strict";
/*Compiled using Cheerp (R) by Leaning Technologies Ltd*/ var aK = Math.imul;
var aL = Math.fround;
var oSlot = 0;
var nullArray = [null];
var nullObj = { d: nullArray, o: 0 };
function a_(p) {
  var b = null;
  if (typeof self === "object") b = fetch(p).then((r) => r.arrayBuffer());
  else if (typeof require === "function") {
    p = require("path").join(__dirname, p);
    b = new Promise((y, n) => {
      require("fs").readFile(p, (e, d) => {
        if (e) n(e);
        else y(d);
      });
    });
  } else
    b = new Promise((y, n) => {
      y(read(p, "binary"));
    });
  return b;
}
function O(s, r) {
  var v = null,
    w = 0,
    t = 0,
    g = null,
    m = 0,
    n = 0,
    j = 0,
    l = 0,
    k = 0,
    i = 0,
    h = null;
  if (!(W | 0)) {
    I = String();
    W = 1;
  }
  g = I;
  if ((r | 0) > 0) {
    n = 0;
    m = 0;
    while (1) {
      j = ((n << 3) + s) | 0;
      l = c[(4 + j) >> 2] | 0;
      if ((l | 0) !== 0) {
        m = (l + m) | 0;
        w = c[j >> 2];
        v = a;
        if ((l | 0) > 0) {
          j = 0;
          while (1) {
            k = v[(w + j) | 0] | 0;
            i = k & 255;
            a: if ((k & 255) < 192) {
              k = H | 0;
              if ((k | 0) !== 0) {
                y = ((y << 6) + (i & 63)) | 0;
                i = (k - 1) | 0;
                H = i;
                if ((i | 0) !== 0) break a;
              } else y = i;
              i = y | 0;
              if (i >>> 0 < 65536) {
                if ((i | 0) !== 0) {
                  h = String.fromCharCode(i);
                  g = g.concat(h);
                }
              } else {
                h = String.fromCharCode((((i - 65536) >>> 10) + 55296) | 0);
                g = g.concat(h);
                h = String.fromCharCode(((i & 1023) + 56320) | 0);
                g = g.concat(h);
              }
            } else {
              if ((k & 255) < 224) {
                t = 31;
                k = 1;
              } else {
                t = (k & 255) < 240 ? 15 | 0 : 7 | 0;
                k = (k & 255) < 240 ? 2 | 0 : 3 | 0;
              }
              H = k;
              y = t & i;
            }
            j = (j + 1) | 0;
            if ((j | 0) !== (l | 0)) continue;
            break;
          }
        }
      }
      n = (n + 1) | 0;
      if ((n | 0) !== (r | 0)) continue;
      break;
    }
  } else {
    m = 0;
  }
  h = aj();
  g = g.split(h);
  n = g.length;
  if ((n | 0) > 1) {
    l = 0;
    j = 1;
    while (1) {
      h = g[(0 + l) | 0];
      console.log(h);
      l = (j + 1) | 0;
      if ((l | 0) !== (n | 0)) {
        t = l;
        l = j;
        j = t;
        continue;
      }
      break;
    }
  }
  I = g[(0 + ((n - 1) | 0)) | 0];
  return m | 0;
}
function aj() {
  var h = null,
    g = null;
  g = String();
  h = String.fromCharCode(10);
  g = g.concat(h);
  return String(g);
}
function ae() {
  ak();
  at();
}
var W = 0;
var I = null;
var H = 0;
var y = 0;
var a = null,
  c = null,
  __asm = null,
  __heap = null;
function a7() {
  throw new Error("this should be unreachable");
}
var ak = null;
var at = null;
a7.promise = a_("hello.wasm")
  .then((g) => WebAssembly.instantiate(g, { i: { O: O } }))
  .then((g) => {
    __asm = g.instance.exports;
    __heap = __asm.a$.buffer;
    a6(__heap);
    ak = __asm.ak;
    at = __asm.at;
    ae();
  });
function a6(g) {
  a = new Uint8Array(g);
  c = new Int32Array(g);
}
