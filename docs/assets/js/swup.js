(() => {
  // node_modules/delegate-it/delegate.js
  var ledger = /* @__PURE__ */ new WeakMap();
  function editLedger(wanted, baseElement, callback, setup) {
    if (!wanted && !ledger.has(baseElement)) {
      return false;
    }
    const elementMap = ledger.get(baseElement) ?? /* @__PURE__ */ new WeakMap();
    ledger.set(baseElement, elementMap);
    const setups = elementMap.get(callback) ?? /* @__PURE__ */ new Set();
    elementMap.set(callback, setups);
    const existed = setups.has(setup);
    if (wanted) {
      setups.add(setup);
    } else {
      setups.delete(setup);
    }
    return existed && wanted;
  }
  function safeClosest(event, selector) {
    let target = event.target;
    if (target instanceof Text) {
      target = target.parentElement;
    }
    if (target instanceof Element && event.currentTarget instanceof Element) {
      const closest = target.closest(selector);
      if (closest && event.currentTarget.contains(closest)) {
        return closest;
      }
    }
  }
  function delegate(selector, type, callback, options = {}) {
    const { signal, base = document } = options;
    if (signal?.aborted) {
      return;
    }
    const { once, ...nativeListenerOptions } = options;
    const baseElement = base instanceof Document ? base.documentElement : base;
    const capture = Boolean(typeof options === "object" ? options.capture : options);
    const listenerFunction = (event) => {
      const delegateTarget = safeClosest(event, String(selector));
      if (delegateTarget) {
        const delegateEvent = Object.assign(event, { delegateTarget });
        callback.call(baseElement, delegateEvent);
        if (once) {
          baseElement.removeEventListener(type, listenerFunction, nativeListenerOptions);
          editLedger(false, baseElement, callback, setup);
        }
      }
    };
    const setup = JSON.stringify({ selector, type, capture });
    const isAlreadyListening = editLedger(true, baseElement, callback, setup);
    if (!isAlreadyListening) {
      baseElement.addEventListener(type, listenerFunction, nativeListenerOptions);
    }
    signal?.addEventListener("abort", () => {
      editLedger(false, baseElement, callback, setup);
    });
  }
  var delegate_default = delegate;

  // node_modules/swup/dist/Swup.modern.js
  function i() {
    return i = Object.assign ? Object.assign.bind() : function(t2) {
      for (var e2 = 1; e2 < arguments.length; e2++) {
        var i2 = arguments[e2];
        for (var s2 in i2) ({}).hasOwnProperty.call(i2, s2) && (t2[s2] = i2[s2]);
      }
      return t2;
    }, i.apply(null, arguments);
  }
  var s = (t2, e2) => String(t2).toLowerCase().replace(/[\s/_.]+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "") || e2 || "";
  var n = ({ hash: t2 } = {}) => window.location.pathname + window.location.search + (t2 ? window.location.hash : "");
  var o = (t2, e2 = {}) => {
    const s2 = i({ url: t2 = t2 || n({ hash: true }), random: Math.random(), source: "swup" }, e2);
    window.history.pushState(s2, "", t2);
  };
  var r = (t2 = null, e2 = {}) => {
    t2 = t2 || n({ hash: true });
    const s2 = i({}, window.history.state || {}, { url: t2, random: Math.random(), source: "swup" }, e2);
    window.history.replaceState(s2, "", t2);
  };
  var a = (e2, s2, n4, o2) => {
    const r3 = new AbortController();
    return o2 = i({}, o2, { signal: r3.signal }), delegate_default(e2, s2, n4, o2), { destroy: () => r3.abort() };
  };
  var l = class _l extends URL {
    constructor(t2, e2 = document.baseURI) {
      super(t2.toString(), e2), Object.setPrototypeOf(this, _l.prototype);
    }
    get url() {
      return this.pathname + this.search;
    }
    static fromElement(t2) {
      const e2 = t2.getAttribute("href") || t2.getAttribute("xlink:href") || "";
      return new _l(e2);
    }
    static fromUrl(t2) {
      return new _l(t2);
    }
  };
  var c = class extends Error {
    constructor(t2, e2) {
      super(t2), this.url = void 0, this.status = void 0, this.aborted = void 0, this.timedOut = void 0, this.name = "FetchError", this.url = e2.url, this.status = e2.status, this.aborted = e2.aborted || false, this.timedOut = e2.timedOut || false;
    }
  };
  async function u(t2, e2 = {}) {
    var s2;
    t2 = l.fromUrl(t2).url;
    const { visit: n4 = this.visit } = e2, o2 = i({}, this.options.requestHeaders, e2.headers), r3 = null != (s2 = e2.timeout) ? s2 : this.options.timeout, a3 = new AbortController(), { signal: h } = a3;
    e2 = i({}, e2, { headers: o2, signal: h });
    let u2, d2 = false, p2 = null;
    r3 && r3 > 0 && (p2 = setTimeout(() => {
      d2 = true, a3.abort("timeout");
    }, r3));
    try {
      u2 = await this.hooks.call("fetch:request", n4, { url: t2, options: e2 }, (t3, { url: e3, options: i2 }) => fetch(e3, i2)), p2 && clearTimeout(p2);
    } catch (e3) {
      if (d2) throw this.hooks.call("fetch:timeout", n4, { url: t2 }), new c(`Request timed out: ${t2}`, { url: t2, timedOut: d2 });
      if ("AbortError" === (null == e3 ? void 0 : e3.name) || h.aborted) throw new c(`Request aborted: ${t2}`, { url: t2, aborted: true });
      throw e3;
    }
    const { status: m2, url: w2 } = u2, f2 = await u2.text();
    if (500 === m2) throw this.hooks.call("fetch:error", n4, { status: m2, response: u2, url: w2 }), new c(`Server error: ${w2}`, { status: m2, url: w2 });
    if (!f2) throw new c(`Empty response: ${w2}`, { status: m2, url: w2 });
    const { url: g2 } = l.fromUrl(w2), v = { url: g2, html: f2 };
    return !n4.cache.write || e2.method && "GET" !== e2.method || t2 !== g2 || this.cache.set(v.url, v), v;
  }
  var d = class {
    constructor(t2) {
      this.swup = void 0, this.pages = /* @__PURE__ */ new Map(), this.swup = t2;
    }
    get size() {
      return this.pages.size;
    }
    get all() {
      const t2 = /* @__PURE__ */ new Map();
      return this.pages.forEach((e2, s2) => {
        t2.set(s2, i({}, e2));
      }), t2;
    }
    has(t2) {
      return this.pages.has(this.resolve(t2));
    }
    get(t2) {
      const e2 = this.pages.get(this.resolve(t2));
      return e2 ? i({}, e2) : e2;
    }
    set(t2, e2) {
      e2 = i({}, e2, { url: t2 = this.resolve(t2) }), this.pages.set(t2, e2), this.swup.hooks.callSync("cache:set", void 0, { page: e2 });
    }
    update(t2, e2) {
      t2 = this.resolve(t2);
      const s2 = i({}, this.get(t2), e2, { url: t2 });
      this.pages.set(t2, s2);
    }
    delete(t2) {
      this.pages.delete(this.resolve(t2));
    }
    clear() {
      this.pages.clear(), this.swup.hooks.callSync("cache:clear", void 0, void 0);
    }
    prune(t2) {
      this.pages.forEach((e2, i2) => {
        t2(i2, e2) && this.delete(i2);
      });
    }
    resolve(t2) {
      const { url: e2 } = l.fromUrl(t2);
      return this.swup.resolveUrl(e2);
    }
  };
  var p = (t2, e2 = document) => e2.querySelector(t2);
  var m = (t2, e2 = document) => Array.from(e2.querySelectorAll(t2));
  var w = () => new Promise((t2) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        t2();
      });
    });
  });
  function f(t2) {
    return !!t2 && ("object" == typeof t2 || "function" == typeof t2) && "function" == typeof t2.then;
  }
  function g(t2, e2 = []) {
    return new Promise((i2, s2) => {
      const n4 = t2(...e2);
      f(n4) ? n4.then(i2, s2) : i2(n4);
    });
  }
  function y(t2, e2) {
    const i2 = null == t2 ? void 0 : t2.closest(`[${e2}]`);
    return null != i2 && i2.hasAttribute(e2) ? (null == i2 ? void 0 : i2.getAttribute(e2)) || true : void 0;
  }
  var k = class {
    constructor(t2) {
      this.swup = void 0, this.swupClasses = ["to-", "is-changing", "is-rendering", "is-popstate", "is-animating", "is-leaving"], this.swup = t2;
    }
    get selectors() {
      const { scope: t2 } = this.swup.visit.animation;
      return "containers" === t2 ? this.swup.visit.containers : "html" === t2 ? ["html"] : Array.isArray(t2) ? t2 : [];
    }
    get selector() {
      return this.selectors.join(",");
    }
    get targets() {
      return this.selector.trim() ? m(this.selector) : [];
    }
    add(...t2) {
      this.targets.forEach((e2) => e2.classList.add(...t2));
    }
    remove(...t2) {
      this.targets.forEach((e2) => e2.classList.remove(...t2));
    }
    clear() {
      this.targets.forEach((t2) => {
        const e2 = t2.className.split(" ").filter((t3) => this.isSwupClass(t3));
        t2.classList.remove(...e2);
      });
    }
    isSwupClass(t2) {
      return this.swupClasses.some((e2) => t2.startsWith(e2));
    }
  };
  var b = class {
    constructor(t2, e2) {
      this.id = void 0, this.state = void 0, this.from = void 0, this.to = void 0, this.containers = void 0, this.animation = void 0, this.trigger = void 0, this.cache = void 0, this.history = void 0, this.scroll = void 0, this.meta = void 0;
      const { to: i2, from: s2, hash: n4, el: o2, event: r3 } = e2;
      this.id = Math.random(), this.state = 1, this.from = { url: null != s2 ? s2 : t2.location.url, hash: t2.location.hash }, this.to = { url: i2, hash: n4 }, this.containers = t2.options.containers, this.animation = { animate: true, wait: false, name: void 0, native: t2.options.native, scope: t2.options.animationScope, selector: t2.options.animationSelector }, this.trigger = { el: o2, event: r3 }, this.cache = { read: t2.options.cache, write: t2.options.cache }, this.history = { action: "push", popstate: false, direction: void 0 }, this.scroll = { reset: true, target: void 0 }, this.meta = {};
    }
    advance(t2) {
      this.state < t2 && (this.state = t2);
    }
    abort() {
      this.state = 8;
    }
    get done() {
      return this.state >= 7;
    }
  };
  function S(t2) {
    return new b(this, t2);
  }
  var E = class {
    constructor(t2) {
      this.swup = void 0, this.registry = /* @__PURE__ */ new Map(), this.hooks = ["animation:out:start", "animation:out:await", "animation:out:end", "animation:in:start", "animation:in:await", "animation:in:end", "animation:skip", "cache:clear", "cache:set", "content:replace", "content:scroll", "enable", "disable", "fetch:request", "fetch:error", "fetch:timeout", "history:popstate", "link:click", "link:self", "link:anchor", "link:newtab", "page:load", "page:view", "scroll:top", "scroll:anchor", "visit:start", "visit:transition", "visit:abort", "visit:end"], this.swup = t2, this.init();
    }
    init() {
      this.hooks.forEach((t2) => this.create(t2));
    }
    create(t2) {
      this.registry.has(t2) || this.registry.set(t2, /* @__PURE__ */ new Map());
    }
    exists(t2) {
      return this.registry.has(t2);
    }
    get(t2) {
      const e2 = this.registry.get(t2);
      if (e2) return e2;
      console.error(`Unknown hook '${t2}'`);
    }
    clear() {
      this.registry.forEach((t2) => t2.clear());
    }
    on(t2, e2, s2 = {}) {
      const n4 = this.get(t2);
      if (!n4) return console.warn(`Hook '${t2}' not found.`), () => {
      };
      const o2 = i({}, s2, { id: n4.size + 1, hook: t2, handler: e2 });
      return n4.set(e2, o2), () => this.off(t2, e2);
    }
    before(t2, e2, s2 = {}) {
      return this.on(t2, e2, i({}, s2, { before: true }));
    }
    replace(t2, e2, s2 = {}) {
      return this.on(t2, e2, i({}, s2, { replace: true }));
    }
    once(t2, e2, s2 = {}) {
      return this.on(t2, e2, i({}, s2, { once: true }));
    }
    off(t2, e2) {
      const i2 = this.get(t2);
      i2 && e2 ? i2.delete(e2) || console.warn(`Handler for hook '${t2}' not found.`) : i2 && i2.clear();
    }
    async call(t2, e2, i2, s2) {
      const [n4, o2, r3] = this.parseCallArgs(t2, e2, i2, s2), { before: a3, handler: l2, after: h } = this.getHandlers(t2, r3);
      await this.run(a3, n4, o2);
      const [c2] = await this.run(l2, n4, o2, true);
      return await this.run(h, n4, o2), this.dispatchDomEvent(t2, n4, o2), c2;
    }
    callSync(t2, e2, i2, s2) {
      const [n4, o2, r3] = this.parseCallArgs(t2, e2, i2, s2), { before: a3, handler: l2, after: h } = this.getHandlers(t2, r3);
      this.runSync(a3, n4, o2);
      const [c2] = this.runSync(l2, n4, o2, true);
      return this.runSync(h, n4, o2), this.dispatchDomEvent(t2, n4, o2), c2;
    }
    parseCallArgs(t2, e2, i2, s2) {
      return e2 instanceof b || "object" != typeof e2 && "function" != typeof i2 ? [e2, i2, s2] : [void 0, e2, i2];
    }
    async run(t2, e2 = this.swup.visit, i2, s2 = false) {
      const n4 = [];
      for (const { hook: o2, handler: r3, defaultHandler: a3, once: l2 } of t2) if (null == e2 || !e2.done) {
        l2 && this.off(o2, r3);
        try {
          const t3 = await g(r3, [e2, i2, a3]);
          n4.push(t3);
        } catch (t3) {
          if (s2) throw t3;
          console.error(`Error in hook '${o2}':`, t3);
        }
      }
      return n4;
    }
    runSync(t2, e2 = this.swup.visit, i2, s2 = false) {
      const n4 = [];
      for (const { hook: o2, handler: r3, defaultHandler: a3, once: l2 } of t2) if (null == e2 || !e2.done) {
        l2 && this.off(o2, r3);
        try {
          const t3 = r3(e2, i2, a3);
          n4.push(t3), f(t3) && console.warn(`Swup will not await Promises in handler for synchronous hook '${o2}'.`);
        } catch (t3) {
          if (s2) throw t3;
          console.error(`Error in hook '${o2}':`, t3);
        }
      }
      return n4;
    }
    getHandlers(t2, e2) {
      const i2 = this.get(t2);
      if (!i2) return { found: false, before: [], handler: [], after: [], replaced: false };
      const s2 = Array.from(i2.values()), n4 = this.sortRegistrations, o2 = s2.filter(({ before: t3, replace: e3 }) => t3 && !e3).sort(n4), r3 = s2.filter(({ replace: t3 }) => t3).filter((t3) => true).sort(n4), a3 = s2.filter(({ before: t3, replace: e3 }) => !t3 && !e3).sort(n4), l2 = r3.length > 0;
      let h = [];
      if (e2 && (h = [{ id: 0, hook: t2, handler: e2 }], l2)) {
        const i3 = r3.length - 1, { handler: s3, once: n5 } = r3[i3], o3 = (t3) => {
          const i4 = r3[t3 - 1];
          return i4 ? (e3, s4) => i4.handler(e3, s4, o3(t3 - 1)) : e2;
        };
        h = [{ id: 0, hook: t2, once: n5, handler: s3, defaultHandler: o3(i3) }];
      }
      return { found: true, before: o2, handler: h, after: a3, replaced: l2 };
    }
    sortRegistrations(t2, e2) {
      var i2, s2;
      return (null != (i2 = t2.priority) ? i2 : 0) - (null != (s2 = e2.priority) ? s2 : 0) || t2.id - e2.id || 0;
    }
    dispatchDomEvent(t2, e2, i2) {
      if (null != e2 && e2.done) return;
      const s2 = { hook: t2, args: i2, visit: e2 || this.swup.visit };
      document.dispatchEvent(new CustomEvent("swup:any", { detail: s2, bubbles: true })), document.dispatchEvent(new CustomEvent(`swup:${t2}`, { detail: s2, bubbles: true }));
    }
    parseName(t2) {
      const [e2, ...s2] = t2.split(".");
      return [e2, s2.reduce((t3, e3) => i({}, t3, { [e3]: true }), {})];
    }
  };
  var C = (t2) => {
    if (t2 && "#" === t2.charAt(0) && (t2 = t2.substring(1)), !t2) return null;
    const e2 = decodeURIComponent(t2);
    let i2 = document.getElementById(t2) || document.getElementById(e2) || p(`a[name='${CSS.escape(t2)}']`) || p(`a[name='${CSS.escape(e2)}']`);
    return i2 || "top" !== t2 || (i2 = document.body), i2;
  };
  var U = "transition";
  var P = "animation";
  async function $({ selector: t2, elements: e2 }) {
    if (false === t2 && !e2) return;
    let i2 = [];
    if (e2) i2 = Array.from(e2);
    else if (t2 && (i2 = m(t2, document.body), !i2.length)) return void console.warn(`[swup] No elements found matching animationSelector \`${t2}\``);
    const s2 = i2.map((t3) => function(t4) {
      const { type: e3, timeout: i3, propCount: s3 } = function(t5) {
        const e4 = window.getComputedStyle(t5), i4 = A(e4, `${U}Delay`), s4 = A(e4, `${U}Duration`), n4 = x(i4, s4), o2 = A(e4, `${P}Delay`), r3 = A(e4, `${P}Duration`), a3 = x(o2, r3), l2 = Math.max(n4, a3), h = l2 > 0 ? n4 > a3 ? U : P : null;
        return { type: h, timeout: l2, propCount: h ? h === U ? s4.length : r3.length : 0 };
      }(t4);
      return !(!e3 || !i3) && new Promise((n4) => {
        const o2 = `${e3}end`, r3 = performance.now();
        let a3 = 0;
        const l2 = () => {
          t4.removeEventListener(o2, h), n4();
        }, h = (e4) => {
          e4.target === t4 && ((performance.now() - r3) / 1e3 < e4.elapsedTime || ++a3 >= s3 && l2());
        };
        setTimeout(() => {
          a3 < s3 && l2();
        }, i3 + 1), t4.addEventListener(o2, h);
      });
    }(t3));
    s2.filter(Boolean).length > 0 ? await Promise.all(s2) : t2 && console.warn(`[swup] No CSS animation duration defined on elements matching \`${t2}\``);
  }
  function A(t2, e2) {
    return (t2[e2] || "").split(", ");
  }
  function x(t2, e2) {
    for (; t2.length < e2.length; ) t2 = t2.concat(t2);
    return Math.max(...e2.map((e3, i2) => H(e3) + H(t2[i2])));
  }
  function H(t2) {
    return 1e3 * parseFloat(t2);
  }
  function V(t2, e2 = {}, s2 = {}) {
    if ("string" != typeof t2) throw new Error("swup.navigate() requires a URL parameter");
    if (this.shouldIgnoreVisit(t2, { el: s2.el, event: s2.event })) return void window.location.assign(t2);
    const { url: n4, hash: o2 } = l.fromUrl(t2), r3 = this.createVisit(i({}, s2, { to: n4, hash: o2 }));
    this.performNavigation(r3, e2);
  }
  async function I(t2, e2 = {}) {
    if (this.navigating) {
      if (this.visit.state >= 6) return t2.state = 2, void (this.onVisitEnd = () => this.performNavigation(t2, e2));
      await this.hooks.call("visit:abort", this.visit, void 0), delete this.visit.to.document, this.visit.state = 8;
    }
    this.navigating = true, this.visit = t2;
    const { el: i2 } = t2.trigger;
    e2.referrer = e2.referrer || this.location.url, false === e2.animate && (t2.animation.animate = false), t2.animation.animate || this.classes.clear();
    const n4 = e2.history || y(i2, "data-swup-history");
    "string" == typeof n4 && ["push", "replace"].includes(n4) && (t2.history.action = n4);
    const a3 = e2.animation || y(i2, "data-swup-animation");
    var h, c2;
    "string" == typeof a3 && (t2.animation.name = a3), t2.meta = e2.meta || {}, "object" == typeof e2.cache ? (t2.cache.read = null != (h = e2.cache.read) ? h : t2.cache.read, t2.cache.write = null != (c2 = e2.cache.write) ? c2 : t2.cache.write) : void 0 !== e2.cache && (t2.cache = { read: !!e2.cache, write: !!e2.cache }), delete e2.cache;
    try {
      await this.hooks.call("visit:start", t2, void 0), t2.state = 3;
      const i3 = this.hooks.call("page:load", t2, { options: e2 }, async (t3, e3) => {
        let i4;
        return t3.cache.read && (i4 = this.cache.get(t3.to.url)), e3.page = i4 || await this.fetchPage(t3.to.url, e3.options), e3.cache = !!i4, e3.page;
      });
      i3.then(({ html: e3 }) => {
        t2.advance(5), t2.to.html = e3, t2.to.document = new DOMParser().parseFromString(e3, "text/html");
      });
      const n5 = t2.to.url + t2.to.hash;
      if (t2.history.popstate || ("replace" === t2.history.action || t2.to.url === this.location.url ? r(n5) : (this.currentHistoryIndex++, o(n5, { index: this.currentHistoryIndex }))), this.location = l.fromUrl(n5), t2.history.popstate && this.classes.add("is-popstate"), t2.animation.name && this.classes.add(`to-${s(t2.animation.name)}`), t2.animation.wait && await i3, t2.done) return;
      if (await this.hooks.call("visit:transition", t2, void 0, async () => {
        if (!t2.animation.animate) return await this.hooks.call("animation:skip", void 0), void await this.renderPage(t2, await i3);
        t2.advance(4), await this.animatePageOut(t2), t2.animation.native && document.startViewTransition ? await document.startViewTransition(async () => await this.renderPage(t2, await i3)).finished : await this.renderPage(t2, await i3), await this.animatePageIn(t2);
      }), t2.done) return;
      await this.hooks.call("visit:end", t2, void 0, () => this.classes.clear()), t2.state = 7, this.navigating = false, this.onVisitEnd && (this.onVisitEnd(), this.onVisitEnd = void 0);
    } catch (e3) {
      if (!e3 || null != e3 && e3.aborted) return void (t2.state = 8);
      t2.state = 9, console.error(e3), this.options.skipPopStateHandling = () => (window.location.assign(t2.to.url + t2.to.hash), true), window.history.back();
    } finally {
      delete t2.to.document;
    }
  }
  var L = async function(t2) {
    await this.hooks.call("animation:out:start", t2, void 0, () => {
      this.classes.add("is-changing", "is-animating", "is-leaving");
    }), await this.hooks.call("animation:out:await", t2, { skip: false }, (t3, { skip: e2 }) => {
      if (!e2) return this.awaitAnimations({ selector: t3.animation.selector });
    }), await this.hooks.call("animation:out:end", t2, void 0);
  };
  var q = function(t2) {
    var e2;
    const i2 = t2.to.document;
    if (!i2) return false;
    const s2 = (null == (e2 = i2.querySelector("title")) ? void 0 : e2.innerText) || "";
    document.title = s2;
    const n4 = m('[data-swup-persist]:not([data-swup-persist=""])'), o2 = t2.containers.map((t3) => {
      const e3 = document.querySelector(t3), s3 = i2.querySelector(t3);
      return e3 && s3 ? (e3.replaceWith(s3.cloneNode(true)), true) : (e3 || console.warn(`[swup] Container missing in current document: ${t3}`), s3 || console.warn(`[swup] Container missing in incoming document: ${t3}`), false);
    }).filter(Boolean);
    return n4.forEach((t3) => {
      const e3 = t3.getAttribute("data-swup-persist"), i3 = p(`[data-swup-persist="${e3}"]`);
      i3 && i3 !== t3 && i3.replaceWith(t3);
    }), o2.length === t2.containers.length;
  };
  var R = function(t2) {
    const e2 = { behavior: "auto" }, { target: s2, reset: n4 } = t2.scroll, o2 = null != s2 ? s2 : t2.to.hash;
    let r3 = false;
    return o2 && (r3 = this.hooks.callSync("scroll:anchor", t2, { hash: o2, options: e2 }, (t3, { hash: e3, options: i2 }) => {
      const s3 = this.getAnchorElement(e3);
      return s3 && s3.scrollIntoView(i2), !!s3;
    })), n4 && !r3 && (r3 = this.hooks.callSync("scroll:top", t2, { options: e2 }, (t3, { options: e3 }) => (window.scrollTo(i({ top: 0, left: 0 }, e3)), true))), r3;
  };
  var T = async function(t2) {
    if (t2.done) return;
    const e2 = this.hooks.call("animation:in:await", t2, { skip: false }, (t3, { skip: e3 }) => {
      if (!e3) return this.awaitAnimations({ selector: t3.animation.selector });
    });
    await w(), await this.hooks.call("animation:in:start", t2, void 0, () => {
      this.classes.remove("is-animating");
    }), await e2, await this.hooks.call("animation:in:end", t2, void 0);
  };
  var N = async function(t2, e2) {
    if (t2.done) return;
    t2.advance(6);
    const { url: i2 } = e2;
    this.isSameResolvedUrl(n(), i2) || (r(i2), this.location = l.fromUrl(i2), t2.to.url = this.location.url, t2.to.hash = this.location.hash), await this.hooks.call("content:replace", t2, { page: e2 }, (t3, {}) => {
      if (this.classes.remove("is-leaving"), t3.animation.animate && this.classes.add("is-rendering"), !this.replaceContent(t3)) throw new Error("[swup] Container mismatch, aborting");
      t3.animation.animate && (this.classes.add("is-changing", "is-animating", "is-rendering"), t3.animation.name && this.classes.add(`to-${s(t3.animation.name)}`));
    }), await this.hooks.call("content:scroll", t2, void 0, () => this.scrollToContent(t2)), await this.hooks.call("page:view", t2, { url: this.location.url, title: document.title });
  };
  var O = function(t2) {
    var e2;
    if (e2 = t2, Boolean(null == e2 ? void 0 : e2.isSwupPlugin)) {
      if (t2.swup = this, !t2._checkRequirements || t2._checkRequirements()) return t2._beforeMount && t2._beforeMount(), t2.mount(), this.plugins.push(t2), this.plugins;
    } else console.error("Not a swup plugin instance", t2);
  };
  function D(t2) {
    const e2 = this.findPlugin(t2);
    if (e2) return e2.unmount(), e2._afterUnmount && e2._afterUnmount(), this.plugins = this.plugins.filter((t3) => t3 !== e2), this.plugins;
    console.error("No such plugin", e2);
  }
  function M(t2) {
    return this.plugins.find((e2) => e2 === t2 || e2.name === t2 || e2.name === `Swup${String(t2)}`);
  }
  function W(t2) {
    if ("function" != typeof this.options.resolveUrl) return console.warn("[swup] options.resolveUrl expects a callback function."), t2;
    const e2 = this.options.resolveUrl(t2);
    return e2 && "string" == typeof e2 ? e2.startsWith("//") || e2.startsWith("http") ? (console.warn("[swup] options.resolveUrl needs to return a relative url"), t2) : e2 : (console.warn("[swup] options.resolveUrl needs to return a url"), t2);
  }
  function B(t2, e2) {
    return this.resolveUrl(t2) === this.resolveUrl(e2);
  }
  var j = { animateHistoryBrowsing: false, animationSelector: '[class*="transition-"]', animationScope: "html", cache: true, containers: ["#swup"], hooks: {}, ignoreVisit: (t2, { el: e2 } = {}) => !(null == e2 || !e2.closest("[data-no-swup]")), linkSelector: "a[href]", linkToSelf: "scroll", native: false, plugins: [], resolveUrl: (t2) => t2, requestHeaders: { "X-Requested-With": "swup", Accept: "text/html, application/xhtml+xml" }, skipPopStateHandling: (t2) => {
    var e2;
    return "swup" !== (null == (e2 = t2.state) ? void 0 : e2.source);
  }, timeout: 0 };
  var _ = class {
    get currentPageUrl() {
      return this.location.url;
    }
    constructor(t2 = {}) {
      var e2, s2;
      this.version = "4.8.2", this.options = void 0, this.defaults = j, this.plugins = [], this.visit = void 0, this.cache = void 0, this.hooks = void 0, this.classes = void 0, this.location = l.fromUrl(window.location.href), this.currentHistoryIndex = void 0, this.clickDelegate = void 0, this.navigating = false, this.onVisitEnd = void 0, this.use = O, this.unuse = D, this.findPlugin = M, this.log = () => {
      }, this.navigate = V, this.performNavigation = I, this.createVisit = S, this.delegateEvent = a, this.fetchPage = u, this.awaitAnimations = $, this.renderPage = N, this.replaceContent = q, this.animatePageIn = T, this.animatePageOut = L, this.scrollToContent = R, this.getAnchorElement = C, this.getCurrentUrl = n, this.resolveUrl = W, this.isSameResolvedUrl = B, this.options = i({}, this.defaults, t2), this.handleLinkClick = this.handleLinkClick.bind(this), this.handlePopState = this.handlePopState.bind(this), this.cache = new d(this), this.classes = new k(this), this.hooks = new E(this), this.visit = this.createVisit({ to: "" }), this.currentHistoryIndex = null != (e2 = null == (s2 = window.history.state) ? void 0 : s2.index) ? e2 : 1, this.enable();
    }
    async enable() {
      var t2;
      const { linkSelector: e2 } = this.options;
      this.clickDelegate = this.delegateEvent(e2, "click", this.handleLinkClick), window.addEventListener("popstate", this.handlePopState), this.options.animateHistoryBrowsing && (window.history.scrollRestoration = "manual"), this.options.native = this.options.native && !!document.startViewTransition, this.options.plugins.forEach((t3) => this.use(t3));
      for (const [t3, e3] of Object.entries(this.options.hooks)) {
        const [i2, s2] = this.hooks.parseName(t3);
        this.hooks.on(i2, e3, s2);
      }
      "swup" !== (null == (t2 = window.history.state) ? void 0 : t2.source) && r(null, { index: this.currentHistoryIndex }), await w(), await this.hooks.call("enable", void 0, void 0, () => {
        const t3 = document.documentElement;
        t3.classList.add("swup-enabled"), t3.classList.toggle("swup-native", this.options.native);
      });
    }
    async destroy() {
      this.clickDelegate.destroy(), window.removeEventListener("popstate", this.handlePopState), this.cache.clear(), this.options.plugins.forEach((t2) => this.unuse(t2)), await this.hooks.call("disable", void 0, void 0, () => {
        const t2 = document.documentElement;
        t2.classList.remove("swup-enabled"), t2.classList.remove("swup-native");
      }), this.hooks.clear();
    }
    shouldIgnoreVisit(t2, { el: e2, event: i2 } = {}) {
      const { origin: s2, url: n4, hash: o2 } = l.fromUrl(t2);
      return s2 !== window.location.origin || !(!e2 || !this.triggerWillOpenNewWindow(e2)) || !!this.options.ignoreVisit(n4 + o2, { el: e2, event: i2 });
    }
    handleLinkClick(t2) {
      const e2 = t2.delegateTarget, { href: i2, url: s2, hash: n4 } = l.fromElement(e2);
      if (this.shouldIgnoreVisit(i2, { el: e2, event: t2 })) return;
      if (this.navigating && s2 === this.visit.to.url) return void t2.preventDefault();
      const o2 = this.createVisit({ to: s2, hash: n4, el: e2, event: t2 });
      t2.metaKey || t2.ctrlKey || t2.shiftKey || t2.altKey ? this.hooks.callSync("link:newtab", o2, { href: i2 }) : 0 === t2.button && this.hooks.callSync("link:click", o2, { el: e2, event: t2 }, () => {
        var e3;
        const i3 = null != (e3 = o2.from.url) ? e3 : "";
        t2.preventDefault(), s2 && s2 !== i3 ? this.isSameResolvedUrl(s2, i3) || this.performNavigation(o2) : n4 ? this.hooks.callSync("link:anchor", o2, { hash: n4 }, () => {
          r(s2 + n4), this.scrollToContent(o2);
        }) : this.hooks.callSync("link:self", o2, void 0, () => {
          "navigate" === this.options.linkToSelf ? this.performNavigation(o2) : (r(s2), this.scrollToContent(o2));
        });
      });
    }
    handlePopState(t2) {
      var e2, i2, s2, o2;
      const r3 = null != (e2 = null == (i2 = t2.state) ? void 0 : i2.url) ? e2 : window.location.href;
      if (this.options.skipPopStateHandling(t2)) return;
      if (this.isSameResolvedUrl(n(), this.location.url)) return;
      const { url: a3, hash: h } = l.fromUrl(r3), c2 = this.createVisit({ to: a3, hash: h, event: t2 });
      c2.history.popstate = true;
      const u2 = null != (s2 = null == (o2 = t2.state) ? void 0 : o2.index) ? s2 : 0;
      u2 && u2 !== this.currentHistoryIndex && (c2.history.direction = u2 - this.currentHistoryIndex > 0 ? "forwards" : "backwards", this.currentHistoryIndex = u2), c2.animation.animate = false, c2.scroll.reset = false, c2.scroll.target = false, this.options.animateHistoryBrowsing && (c2.animation.animate = true, c2.scroll.reset = true), this.hooks.callSync("history:popstate", c2, { event: t2 }, () => {
        this.performNavigation(c2);
      });
    }
    triggerWillOpenNewWindow(t2) {
      return !!t2.matches('[download], [target="_blank"]');
    }
  };

  // node_modules/@swup/plugin/dist/index.modern.js
  function r2() {
    return r2 = Object.assign ? Object.assign.bind() : function(r3) {
      for (var n4 = 1; n4 < arguments.length; n4++) {
        var e2 = arguments[n4];
        for (var t2 in e2) Object.prototype.hasOwnProperty.call(e2, t2) && (r3[t2] = e2[t2]);
      }
      return r3;
    }, r2.apply(this, arguments);
  }
  var n2 = (r3) => String(r3).split(".").map((r4) => String(parseInt(r4 || "0", 10))).concat(["0", "0"]).slice(0, 3).join(".");
  var e = class {
    constructor() {
      this.isSwupPlugin = true, this.swup = void 0, this.version = void 0, this.requires = {}, this.handlersToUnregister = [];
    }
    mount() {
    }
    unmount() {
      this.handlersToUnregister.forEach((r3) => r3()), this.handlersToUnregister = [];
    }
    _beforeMount() {
      if (!this.name) throw new Error("You must define a name of plugin when creating a class.");
    }
    _afterUnmount() {
    }
    _checkRequirements() {
      return "object" != typeof this.requires || Object.entries(this.requires).forEach(([r3, e2]) => {
        if (!function(r4, e3, t2) {
          const s2 = function(r5, n4) {
            var e4;
            if ("swup" === r5) return null != (e4 = n4.version) ? e4 : "";
            {
              var t3;
              const e5 = n4.findPlugin(r5);
              return null != (t3 = null == e5 ? void 0 : e5.version) ? t3 : "";
            }
          }(r4, t2);
          return !!s2 && ((r5, e4) => e4.every((e5) => {
            const [, t3, s3] = e5.match(/^([\D]+)?(.*)$/) || [];
            var o2, i2;
            return ((r6, n4) => {
              const e6 = { "": (r7) => 0 === r7, ">": (r7) => r7 > 0, ">=": (r7) => r7 >= 0, "<": (r7) => r7 < 0, "<=": (r7) => r7 <= 0 };
              return (e6[n4] || e6[""])(r6);
            })((i2 = s3, o2 = n2(o2 = r5), i2 = n2(i2), o2.localeCompare(i2, void 0, { numeric: true })), t3 || ">=");
          }))(s2, e3);
        }(r3, e2 = Array.isArray(e2) ? e2 : [e2], this.swup)) {
          const n4 = `${r3} ${e2.join(", ")}`;
          throw new Error(`Plugin version mismatch: ${this.name} requires ${n4}`);
        }
      }), true;
    }
    on(r3, n4, e2 = {}) {
      var t2;
      n4 = !(t2 = n4).name.startsWith("bound ") || t2.hasOwnProperty("prototype") ? n4.bind(this) : n4;
      const s2 = this.swup.hooks.on(r3, n4, e2);
      return this.handlersToUnregister.push(s2), s2;
    }
    once(n4, e2, t2 = {}) {
      return this.on(n4, e2, r2({}, t2, { once: true }));
    }
    before(n4, e2, t2 = {}) {
      return this.on(n4, e2, r2({}, t2, { before: true }));
    }
    replace(n4, e2, t2 = {}) {
      return this.on(n4, e2, r2({}, t2, { replace: true }));
    }
    off(r3, n4) {
      return this.swup.hooks.off(r3, n4);
    }
  };

  // node_modules/@swup/theme/dist/index.modern.js
  var t = class extends e {
    constructor(...e2) {
      super(...e2), this._originalAnimationSelectorOption = "", this._addedStyleElements = [], this._addedHTMLContent = [], this._classNameAddedToElements = [], this._addClassNameToElement = () => {
        this._classNameAddedToElements.forEach((e3) => {
          Array.from(document.querySelectorAll(e3.selector)).forEach((t2) => {
            t2.classList.add(`swup-transition-${e3.name}`);
          });
        });
      };
    }
    _beforeMount() {
      this._originalAnimationSelectorOption = String(this.swup.options.animationSelector), this.swup.options.animationSelector = '[class*="swup-transition-"]', this.swup.hooks.on("content:replace", this._addClassNameToElement);
    }
    _afterUnmount() {
      this.swup.options.animationSelector = this._originalAnimationSelectorOption, this._addedStyleElements.forEach((e2) => {
        e2.outerHTML = "";
      }), this._addedStyleElements = [], this._addedHTMLContent.forEach((e2) => {
        e2.outerHTML = "";
      }), this._addedHTMLContent = [], this._classNameAddedToElements.forEach((e2) => {
        Array.from(document.querySelectorAll(e2.selector)).forEach((e3) => {
          e3.className.split(" ").forEach((t2) => {
            new RegExp("^swup-transition-").test(t2) && e3.classList.remove(t2);
          });
        });
      }), this.swup.hooks.off("content:replace", this._addClassNameToElement);
    }
    applyStyles(e2) {
      const t2 = document.createElement("style");
      t2.setAttribute("data-swup-theme", ""), t2.appendChild(document.createTextNode(e2)), document.head.prepend(t2), this._addedStyleElements.push(t2);
    }
    applyHTML(e2) {
      const t2 = document.createElement("div");
      t2.innerHTML = e2, document.body.appendChild(t2), this._addedHTMLContent.push(t2);
    }
    addClassName(e2, t2) {
      this._classNameAddedToElements.push({ selector: e2, name: t2 }), this._addClassNameToElement();
    }
  };

  // node_modules/@swup/fade-theme/dist/index.modern.js
  function a2() {
    return a2 = Object.assign ? Object.assign.bind() : function(t2) {
      for (var a3 = 1; a3 < arguments.length; a3++) {
        var n4 = arguments[a3];
        for (var i2 in n4) ({}).hasOwnProperty.call(n4, i2) && (t2[i2] = n4[i2]);
      }
      return t2;
    }, a2.apply(null, arguments);
  }
  var n3 = class extends t {
    constructor(t2 = {}) {
      super(), this.name = "SwupFadeTheme", this.defaults = { mainElement: "#swup" }, this.options = a2({}, this.defaults, t2);
    }
    mount() {
      this.applyStyles("html{--swup-fade-theme-duration:.4s}html.is-changing .swup-transition-main{opacity:1;transition:opacity var(--swup-fade-theme-duration)}html.is-animating .swup-transition-main{opacity:0}"), this.addClassName(this.options.mainElement, "main");
    }
  };

  // src/assets/js/swup.js
  var swup = new _({
    plugins: [new n3()]
  });
  swup.hooks.on("visit:start", () => {
    console.log("Navigating to:", window.location.href);
  });
})();
//# sourceMappingURL=swup.js.map
