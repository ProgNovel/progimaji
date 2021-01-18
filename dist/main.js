'use strict';

var crypto = require('crypto');
var events = require('events');
var http = require('http');
var require$$0$1 = require('querystring');
var fs = require('fs');
var sharp = require('sharp');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var sharp__default = /*#__PURE__*/_interopDefaultLegacy(sharp);

const THROTTLE_TASK_MAX = 1;
const SERVER_PORT = 5000;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

// This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
// optimize the gzip compression for this alphabet.
let urlAlphabet =
  'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

// It is best to make fewer, larger requests to the crypto module to
// avoid system call overhead. So, random numbers are generated in a
// pool. The pool is a Buffer that is larger than the initial random
// request size by this multiplier. The pool is enlarged if subsequent
// requests exceed the maximum buffer size.
const POOL_SIZE_MULTIPLIER = 32;
let pool, poolOffset;

let random = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto__default['default'].randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto__default['default'].randomFillSync(pool);
    poolOffset = 0;
  }

  let res = pool.subarray(poolOffset, poolOffset + bytes);
  poolOffset += bytes;
  return res
};

let nanoid = (size = 21) => {
  let bytes = random(size);
  let id = '';
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  while (size--) {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unneccessary because
    // the bitmask trims bytes down to the alphabet size.
    id += urlAlphabet[bytes[size] & 63];
  }
  return id
};

var tasksQueue = {};
var tasks = new events.EventEmitter();
/**
 * This should be called when an image transformation task completed or an HTTP
 * request readable stream is closed. It will delete the relevant throttle instance
 * in tasks queue and emit an event to signal for the next task in the queue to start if
 * there's any.
 *
 * @param id an unique random ID for HTTP request
 */

function completeTask(id) {
  // rather than using Array.filter(), look for
  // a more performance array member delete later
  delete tasksQueue[id];
  tasks.emit("taskcompleted"
  /* OneTaskCompleted */
  );
}
/**
 * Put a HTTP request on queue if server is currently a number of processing image
 * optimization tasks.
 *
 * @param details details passed to event emitter when HTTP stream closed.
 * @returns Promise TaskThrottleInstance
 */

function putTaskInQueue(request) {
  return __awaiter(this, void 0, void 0, function* () {
    var id = nanoid();
    tasksQueue[id] = {
      onhold: true,
      resolved: new Promise(() => {})
    };
    var isWaitingQueue;

    if ( Object.keys(tasksQueue).length <= THROTTLE_TASK_MAX) {
      isWaitingQueue = Promise.resolve();
    }

    tasksQueue[id].onhold = false;
    tasks.on("taskcompleted"
    /* OneTaskCompleted */
    , () => {
      var firstKey = Object.keys(tasksQueue)[0]; // TODO pick only awaiting tasks in queue

      if (firstKey === id) {
        console.log("Pick a task", id);
        tasksQueue[firstKey].resolved = Promise.resolve();
      }
    });
    yield isWaitingQueue;
    return _startRequestedTask();

    function _startRequestedTask() {
      return {
        id
      };
    }
  });
}

function every (arr, cb) {
	var i=0, len=arr.length;

	for (; i < len; i++) {
		if (!cb(arr[i], i, arr)) {
			return false;
		}
	}

	return true;
}

const SEP = '/';
// Types ~> static, param, any, optional
const STYPE=0, PTYPE=1, ATYPE=2, OTYPE=3;
// Char Codes ~> / : *
const SLASH=47, COLON=58, ASTER=42, QMARK=63;

function strip(str) {
	if (str === SEP) return str;
	(str.charCodeAt(0) === SLASH) && (str=str.substring(1));
	var len = str.length - 1;
	return str.charCodeAt(len) === SLASH ? str.substring(0, len) : str;
}

function split(str) {
	return (str=strip(str)) === SEP ? [SEP] : str.split(SEP);
}

function isMatch(arr, obj, idx) {
	idx = arr[idx];
	return (obj.val === idx && obj.type === STYPE) || (idx === SEP ? obj.type > PTYPE : obj.type !== STYPE && (idx || '').endsWith(obj.end));
}

function match(str, all) {
	var i=0, tmp, segs=split(str), len=segs.length, l;
	var fn = isMatch.bind(isMatch, segs);

	for (; i < all.length; i++) {
		tmp = all[i];
		if ((l=tmp.length) === len || (l < len && tmp[l-1].type === ATYPE) || (l > len && tmp[l-1].type === OTYPE)) {
			if (every(tmp, fn)) return tmp;
		}
	}

	return [];
}

function parse(str) {
	if (str === SEP) {
		return [{ old:str, type:STYPE, val:str, end:'' }];
	}

	var c, x, t, sfx, nxt=strip(str), i=-1, j=0, len=nxt.length, out=[];

	while (++i < len) {
		c = nxt.charCodeAt(i);

		if (c === COLON) {
			j = i + 1; // begining of param
			t = PTYPE; // set type
			x = 0; // reset mark
			sfx = '';

			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				c = nxt.charCodeAt(i);
				if (c === QMARK) {
					x=i; t=OTYPE;
				} else if (c === 46 && sfx.length === 0) {
					sfx = nxt.substring(x=i);
				}
				i++; // move on
			}

			out.push({
				old: str,
				type: t,
				val: nxt.substring(j, x||i),
				end: sfx
			});

			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=0;

			continue; // loop
		} else if (c === ASTER) {
			out.push({
				old: str,
				type: ATYPE,
				val: nxt.substring(i),
				end: ''
			});
			continue; // loop
		} else {
			j = i;
			while (i < len && nxt.charCodeAt(i) !== SLASH) {
				++i; // skip to next slash
			}
			out.push({
				old: str,
				type: STYPE,
				val: nxt.substring(j, i),
				end: ''
			});
			// shorten string & update pointers
			nxt=nxt.substring(i); len-=i; i=j=0;
		}
	}

	return out;
}

function exec(str, arr) {
	var i=0, x, y, segs=split(str), out={};
	for (; i < arr.length; i++) {
		x=segs[i]; y=arr[i];
		if (x === SEP) continue;
		if (x !== void 0 && y.type | 2 === OTYPE) {
			out[ y.val ] = x.replace(y.end, '');
		}
	}
	return out;
}

var matchit = /*#__PURE__*/Object.freeze({
    __proto__: null,
    match: match,
    parse: parse,
    exec: exec
});

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var require$$0 = /*@__PURE__*/getAugmentedNamespace(matchit);

const { exec: exec$1, match: match$1, parse: parse$1 } = require$$0;

class Trouter {
	constructor(opts) {
		this.opts = opts || {};
		this.routes = {};
		this.handlers = {};

		this.all = this.add.bind(this, '*');
		this.get = this.add.bind(this, 'GET');
		this.head = this.add.bind(this, 'HEAD');
		this.patch = this.add.bind(this, 'PATCH');
		this.options = this.add.bind(this, 'OPTIONS');
    this.connect = this.add.bind(this, 'CONNECT');
		this.delete = this.add.bind(this, 'DELETE');
    this.trace = this.add.bind(this, 'TRACE');
		this.post = this.add.bind(this, 'POST');
		this.put = this.add.bind(this, 'PUT');
	}

	add(method, pattern, ...fns) {
		// Save decoded pattern info
		if (this.routes[method] === void 0) this.routes[method]=[];
		this.routes[method].push(parse$1(pattern));
		// Save route handler(s)
		if (this.handlers[method] === void 0) this.handlers[method]={};
		this.handlers[method][pattern] = fns;
		// Allow chainable
		return this;
	}

	find(method, url) {
		let arr = match$1(url, this.routes[method] || []);
		if (arr.length === 0) {
			arr = match$1(url, this.routes[method='*'] || []);
			if (!arr.length) return false;
		}
		return {
			params: exec$1(url, arr),
			handlers: this.handlers[method][arr[0].old]
		};
	}
}

var trouter = Trouter;

var url = function (req) {
	let url = req.url;
	if (url === void 0) return url;

	let obj = req._parsedUrl;
	if (obj && obj._raw === url) return obj;

	obj = {};
	obj.query = obj.search = null;
	obj.href = obj.path = obj.pathname = url;

	let idx = url.indexOf('?', 1);
	if (idx !== -1) {
		obj.search = url.substring(idx);
		obj.query = obj.search.substring(1);
		obj.pathname = url.substring(0, idx);
	}

	obj._raw = url;

	return (req._parsedUrl = obj);
};

const { parse: parse$2 } = require$$0__default['default'];


function lead(x) {
	return x.charCodeAt(0) === 47 ? x : ('/' + x);
}

function value(x) {
  let y = x.indexOf('/', 1);
  return y > 1 ? x.substring(0, y) : x;
}

function mutate(str, req) {
	req.url = req.url.substring(str.length) || '/';
	req.path = req.path.substring(str.length) || '/';
}

function onError(err, req, res, next) {
	let code = (res.statusCode = err.code || err.status || 500);
	res.end(err.length && err || err.message || http__default['default'].STATUS_CODES[code]);
}

class Polka extends trouter {
	constructor(opts={}) {
		super(opts);
		this.apps = {};
		this.wares = [];
		this.bwares = {};
		this.parse = url;
		this.server = opts.server;
		this.handler = this.handler.bind(this);
		this.onError = opts.onError || onError; // catch-all handler
		this.onNoMatch = opts.onNoMatch || this.onError.bind(null, { code:404 });
	}

	add(method, pattern, ...fns) {
		let base = lead(value(pattern));
		if (this.apps[base] !== void 0) throw new Error(`Cannot mount ".${method.toLowerCase()}('${lead(pattern)}')" because a Polka application at ".use('${base}')" already exists! You should move this handler into your Polka application instead.`);
		return super.add(method, pattern, ...fns);
	}

	use(base, ...fns) {
		if (typeof base === 'function') {
			this.wares = this.wares.concat(base, fns);
		} else if (base === '/') {
			this.wares = this.wares.concat(fns);
		} else {
			base = lead(base);
			fns.forEach(fn => {
				if (fn instanceof Polka) {
					this.apps[base] = fn;
				} else {
					let arr = this.bwares[base] || [];
					arr.length > 0 || arr.push((r, _, nxt) => (mutate(base, r),nxt()));
					this.bwares[base] = arr.concat(fn);
				}
			});
		}
		return this; // chainable
	}

	listen() {
		(this.server = this.server || http__default['default'].createServer()).on('request', this.handler);
		this.server.listen.apply(this.server, arguments);
		return this;
	}

	handler(req, res, info) {
		info = info || this.parse(req);
		let fns=[], arr=this.wares, obj=this.find(req.method, info.pathname);
		req.originalUrl = req.originalUrl || req.url;
		let base = value(req.path = info.pathname);
		if (this.bwares[base] !== void 0) {
			arr = arr.concat(this.bwares[base]);
		}
		if (obj) {
			fns = obj.handlers;
			req.params = obj.params;
		} else if (this.apps[base] !== void 0) {
			mutate(base, req); info.pathname=req.path; //=> updates
			fns.push(this.apps[base].handler.bind(null, req, res, info));
		} else if (fns.length === 0) {
			fns.push(this.onNoMatch);
		}
		// Grab addl values from `info`
		req.search = info.search;
		req.query = parse$2(info.query);
		// Exit if only a single function
		let i=0, len=arr.length, num=fns.length;
		if (len === i && num === 1) return fns[0](req, res);
		// Otherwise loop thru all middlware
		let next = err => err ? this.onError(err, req, res, next) : loop();
		let loop = _ => res.finished || (i < len) && arr[i++](req, res, next);
		arr = arr.concat(fns);
		len += num;
		loop(); // init
	}
}

var polka = opts => new Polka(opts);

function imageResize(_ref) {
  var {
    type,
    quality,
    size
  } = _ref;

  switch (type) {
    case "png":
      return sharp__default['default']().resize(size).png({
        quality
      });

    case "webp":
      return sharp__default['default']().resize(size).webp({
        quality
      });

    case "avif":
      return sharp__default['default']().resize(size).avif({
        quality
      });

    case "jxl":
      throw "JXL image transformation is still on the way. Come back soon!";

    default:
      return sharp__default['default']().resize(size).jpeg({
        quality
      });
  }
}
var supportedImageType = ["png", "avif", "jxl", "webp", "jpeg", "jpg", "auto"];

function resize(req, res) {
  return __awaiter(this, void 0, void 0, function* () {
    var throttle = yield putTaskInQueue();
    var {
      type,
      url,
      quality,
      width,
      height
    } = req.query;
    var imageQuality;
    var size = {};
    if (height) size.height = parseInt(height);
    if (width) size.width = parseInt(width);
    if (quality) imageQuality = parseInt(quality);
    if (!type) type = "auto";
    yield new Promise(resolve => setTimeout(resolve, 3000));

    try {
      if (!supportedImageType.includes(type)) {
        throw new Error("Image type " + type + " is not supported.");
      } // const data = (await fetch(url)).body;


      var data = fs.createReadStream("mock/mock.png");
      res.writeHead(200, {
        "Content-Type": "image/" + type,
        // later below header can be customized or disabled by choice
        "Interledger-Billing": "free"
      });
      var task = data.pipe(imageResize({
        type,
        quality: imageQuality,
        size
      })).pipe(res); // res.end("Testing");
    } catch (err) {
      res.writeHead(500);
      res.end("Error: " + err);
    }

    req.on("close", () => {
      completeTask(throttle.id);
      console.log("Close", throttle.id);
    });
    req.on("pipe", () => {
      console.log("Start piping", throttle.id);
    });
  });
}

var PORT = SERVER_PORT ;
polka().get("/", versionAndHealthCheck).get("/resize", resize).listen(PORT, err => {
  if (err) throw err;
  console.log("Started on port", PORT);
});

function versionAndHealthCheck(req, res) {
  res.end("Current concurrent image optimization: " + Object.keys(tasksQueue).length + ".");
}
