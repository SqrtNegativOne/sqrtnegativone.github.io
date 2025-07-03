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
    return i = Object.assign ? Object.assign.bind() : function(t3) {
      for (var e2 = 1; e2 < arguments.length; e2++) {
        var i3 = arguments[e2];
        for (var s3 in i3) ({}).hasOwnProperty.call(i3, s3) && (t3[s3] = i3[s3]);
      }
      return t3;
    }, i.apply(null, arguments);
  }
  var s = (t3, e2) => String(t3).toLowerCase().replace(/[\s/_.]+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "") || e2 || "";
  var n = ({ hash: t3 } = {}) => window.location.pathname + window.location.search + (t3 ? window.location.hash : "");
  var o = (t3, e2 = {}) => {
    const s3 = i({ url: t3 = t3 || n({ hash: true }), random: Math.random(), source: "swup" }, e2);
    window.history.pushState(s3, "", t3);
  };
  var r = (t3 = null, e2 = {}) => {
    t3 = t3 || n({ hash: true });
    const s3 = i({}, window.history.state || {}, { url: t3, random: Math.random(), source: "swup" }, e2);
    window.history.replaceState(s3, "", t3);
  };
  var a = (e2, s3, n5, o3) => {
    const r4 = new AbortController();
    return o3 = i({}, o3, { signal: r4.signal }), delegate_default(e2, s3, n5, o3), { destroy: () => r4.abort() };
  };
  var l = class _l extends URL {
    constructor(t3, e2 = document.baseURI) {
      super(t3.toString(), e2), Object.setPrototypeOf(this, _l.prototype);
    }
    get url() {
      return this.pathname + this.search;
    }
    static fromElement(t3) {
      const e2 = t3.getAttribute("href") || t3.getAttribute("xlink:href") || "";
      return new _l(e2);
    }
    static fromUrl(t3) {
      return new _l(t3);
    }
  };
  var c = class extends Error {
    constructor(t3, e2) {
      super(t3), this.url = void 0, this.status = void 0, this.aborted = void 0, this.timedOut = void 0, this.name = "FetchError", this.url = e2.url, this.status = e2.status, this.aborted = e2.aborted || false, this.timedOut = e2.timedOut || false;
    }
  };
  async function u(t3, e2 = {}) {
    var s3;
    t3 = l.fromUrl(t3).url;
    const { visit: n5 = this.visit } = e2, o3 = i({}, this.options.requestHeaders, e2.headers), r4 = null != (s3 = e2.timeout) ? s3 : this.options.timeout, a3 = new AbortController(), { signal: h } = a3;
    e2 = i({}, e2, { headers: o3, signal: h });
    let u2, d2 = false, p2 = null;
    r4 && r4 > 0 && (p2 = setTimeout(() => {
      d2 = true, a3.abort("timeout");
    }, r4));
    try {
      u2 = await this.hooks.call("fetch:request", n5, { url: t3, options: e2 }, (t4, { url: e3, options: i3 }) => fetch(e3, i3)), p2 && clearTimeout(p2);
    } catch (e3) {
      if (d2) throw this.hooks.call("fetch:timeout", n5, { url: t3 }), new c(`Request timed out: ${t3}`, { url: t3, timedOut: d2 });
      if ("AbortError" === (null == e3 ? void 0 : e3.name) || h.aborted) throw new c(`Request aborted: ${t3}`, { url: t3, aborted: true });
      throw e3;
    }
    const { status: m2, url: w2 } = u2, f2 = await u2.text();
    if (500 === m2) throw this.hooks.call("fetch:error", n5, { status: m2, response: u2, url: w2 }), new c(`Server error: ${w2}`, { status: m2, url: w2 });
    if (!f2) throw new c(`Empty response: ${w2}`, { status: m2, url: w2 });
    const { url: g2 } = l.fromUrl(w2), v = { url: g2, html: f2 };
    return !n5.cache.write || e2.method && "GET" !== e2.method || t3 !== g2 || this.cache.set(v.url, v), v;
  }
  var d = class {
    constructor(t3) {
      this.swup = void 0, this.pages = /* @__PURE__ */ new Map(), this.swup = t3;
    }
    get size() {
      return this.pages.size;
    }
    get all() {
      const t3 = /* @__PURE__ */ new Map();
      return this.pages.forEach((e2, s3) => {
        t3.set(s3, i({}, e2));
      }), t3;
    }
    has(t3) {
      return this.pages.has(this.resolve(t3));
    }
    get(t3) {
      const e2 = this.pages.get(this.resolve(t3));
      return e2 ? i({}, e2) : e2;
    }
    set(t3, e2) {
      e2 = i({}, e2, { url: t3 = this.resolve(t3) }), this.pages.set(t3, e2), this.swup.hooks.callSync("cache:set", void 0, { page: e2 });
    }
    update(t3, e2) {
      t3 = this.resolve(t3);
      const s3 = i({}, this.get(t3), e2, { url: t3 });
      this.pages.set(t3, s3);
    }
    delete(t3) {
      this.pages.delete(this.resolve(t3));
    }
    clear() {
      this.pages.clear(), this.swup.hooks.callSync("cache:clear", void 0, void 0);
    }
    prune(t3) {
      this.pages.forEach((e2, i3) => {
        t3(i3, e2) && this.delete(i3);
      });
    }
    resolve(t3) {
      const { url: e2 } = l.fromUrl(t3);
      return this.swup.resolveUrl(e2);
    }
  };
  var p = (t3, e2 = document) => e2.querySelector(t3);
  var m = (t3, e2 = document) => Array.from(e2.querySelectorAll(t3));
  var w = () => new Promise((t3) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        t3();
      });
    });
  });
  function f(t3) {
    return !!t3 && ("object" == typeof t3 || "function" == typeof t3) && "function" == typeof t3.then;
  }
  function g(t3, e2 = []) {
    return new Promise((i3, s3) => {
      const n5 = t3(...e2);
      f(n5) ? n5.then(i3, s3) : i3(n5);
    });
  }
  function y(t3, e2) {
    const i3 = null == t3 ? void 0 : t3.closest(`[${e2}]`);
    return null != i3 && i3.hasAttribute(e2) ? (null == i3 ? void 0 : i3.getAttribute(e2)) || true : void 0;
  }
  var k = class {
    constructor(t3) {
      this.swup = void 0, this.swupClasses = ["to-", "is-changing", "is-rendering", "is-popstate", "is-animating", "is-leaving"], this.swup = t3;
    }
    get selectors() {
      const { scope: t3 } = this.swup.visit.animation;
      return "containers" === t3 ? this.swup.visit.containers : "html" === t3 ? ["html"] : Array.isArray(t3) ? t3 : [];
    }
    get selector() {
      return this.selectors.join(",");
    }
    get targets() {
      return this.selector.trim() ? m(this.selector) : [];
    }
    add(...t3) {
      this.targets.forEach((e2) => e2.classList.add(...t3));
    }
    remove(...t3) {
      this.targets.forEach((e2) => e2.classList.remove(...t3));
    }
    clear() {
      this.targets.forEach((t3) => {
        const e2 = t3.className.split(" ").filter((t4) => this.isSwupClass(t4));
        t3.classList.remove(...e2);
      });
    }
    isSwupClass(t3) {
      return this.swupClasses.some((e2) => t3.startsWith(e2));
    }
  };
  var b = class {
    constructor(t3, e2) {
      this.id = void 0, this.state = void 0, this.from = void 0, this.to = void 0, this.containers = void 0, this.animation = void 0, this.trigger = void 0, this.cache = void 0, this.history = void 0, this.scroll = void 0, this.meta = void 0;
      const { to: i3, from: s3, hash: n5, el: o3, event: r4 } = e2;
      this.id = Math.random(), this.state = 1, this.from = { url: null != s3 ? s3 : t3.location.url, hash: t3.location.hash }, this.to = { url: i3, hash: n5 }, this.containers = t3.options.containers, this.animation = { animate: true, wait: false, name: void 0, native: t3.options.native, scope: t3.options.animationScope, selector: t3.options.animationSelector }, this.trigger = { el: o3, event: r4 }, this.cache = { read: t3.options.cache, write: t3.options.cache }, this.history = { action: "push", popstate: false, direction: void 0 }, this.scroll = { reset: true, target: void 0 }, this.meta = {};
    }
    advance(t3) {
      this.state < t3 && (this.state = t3);
    }
    abort() {
      this.state = 8;
    }
    get done() {
      return this.state >= 7;
    }
  };
  function S(t3) {
    return new b(this, t3);
  }
  var E = class {
    constructor(t3) {
      this.swup = void 0, this.registry = /* @__PURE__ */ new Map(), this.hooks = ["animation:out:start", "animation:out:await", "animation:out:end", "animation:in:start", "animation:in:await", "animation:in:end", "animation:skip", "cache:clear", "cache:set", "content:replace", "content:scroll", "enable", "disable", "fetch:request", "fetch:error", "fetch:timeout", "history:popstate", "link:click", "link:self", "link:anchor", "link:newtab", "page:load", "page:view", "scroll:top", "scroll:anchor", "visit:start", "visit:transition", "visit:abort", "visit:end"], this.swup = t3, this.init();
    }
    init() {
      this.hooks.forEach((t3) => this.create(t3));
    }
    create(t3) {
      this.registry.has(t3) || this.registry.set(t3, /* @__PURE__ */ new Map());
    }
    exists(t3) {
      return this.registry.has(t3);
    }
    get(t3) {
      const e2 = this.registry.get(t3);
      if (e2) return e2;
      console.error(`Unknown hook '${t3}'`);
    }
    clear() {
      this.registry.forEach((t3) => t3.clear());
    }
    on(t3, e2, s3 = {}) {
      const n5 = this.get(t3);
      if (!n5) return console.warn(`Hook '${t3}' not found.`), () => {
      };
      const o3 = i({}, s3, { id: n5.size + 1, hook: t3, handler: e2 });
      return n5.set(e2, o3), () => this.off(t3, e2);
    }
    before(t3, e2, s3 = {}) {
      return this.on(t3, e2, i({}, s3, { before: true }));
    }
    replace(t3, e2, s3 = {}) {
      return this.on(t3, e2, i({}, s3, { replace: true }));
    }
    once(t3, e2, s3 = {}) {
      return this.on(t3, e2, i({}, s3, { once: true }));
    }
    off(t3, e2) {
      const i3 = this.get(t3);
      i3 && e2 ? i3.delete(e2) || console.warn(`Handler for hook '${t3}' not found.`) : i3 && i3.clear();
    }
    async call(t3, e2, i3, s3) {
      const [n5, o3, r4] = this.parseCallArgs(t3, e2, i3, s3), { before: a3, handler: l2, after: h } = this.getHandlers(t3, r4);
      await this.run(a3, n5, o3);
      const [c2] = await this.run(l2, n5, o3, true);
      return await this.run(h, n5, o3), this.dispatchDomEvent(t3, n5, o3), c2;
    }
    callSync(t3, e2, i3, s3) {
      const [n5, o3, r4] = this.parseCallArgs(t3, e2, i3, s3), { before: a3, handler: l2, after: h } = this.getHandlers(t3, r4);
      this.runSync(a3, n5, o3);
      const [c2] = this.runSync(l2, n5, o3, true);
      return this.runSync(h, n5, o3), this.dispatchDomEvent(t3, n5, o3), c2;
    }
    parseCallArgs(t3, e2, i3, s3) {
      return e2 instanceof b || "object" != typeof e2 && "function" != typeof i3 ? [e2, i3, s3] : [void 0, e2, i3];
    }
    async run(t3, e2 = this.swup.visit, i3, s3 = false) {
      const n5 = [];
      for (const { hook: o3, handler: r4, defaultHandler: a3, once: l2 } of t3) if (null == e2 || !e2.done) {
        l2 && this.off(o3, r4);
        try {
          const t4 = await g(r4, [e2, i3, a3]);
          n5.push(t4);
        } catch (t4) {
          if (s3) throw t4;
          console.error(`Error in hook '${o3}':`, t4);
        }
      }
      return n5;
    }
    runSync(t3, e2 = this.swup.visit, i3, s3 = false) {
      const n5 = [];
      for (const { hook: o3, handler: r4, defaultHandler: a3, once: l2 } of t3) if (null == e2 || !e2.done) {
        l2 && this.off(o3, r4);
        try {
          const t4 = r4(e2, i3, a3);
          n5.push(t4), f(t4) && console.warn(`Swup will not await Promises in handler for synchronous hook '${o3}'.`);
        } catch (t4) {
          if (s3) throw t4;
          console.error(`Error in hook '${o3}':`, t4);
        }
      }
      return n5;
    }
    getHandlers(t3, e2) {
      const i3 = this.get(t3);
      if (!i3) return { found: false, before: [], handler: [], after: [], replaced: false };
      const s3 = Array.from(i3.values()), n5 = this.sortRegistrations, o3 = s3.filter(({ before: t4, replace: e3 }) => t4 && !e3).sort(n5), r4 = s3.filter(({ replace: t4 }) => t4).filter((t4) => true).sort(n5), a3 = s3.filter(({ before: t4, replace: e3 }) => !t4 && !e3).sort(n5), l2 = r4.length > 0;
      let h = [];
      if (e2 && (h = [{ id: 0, hook: t3, handler: e2 }], l2)) {
        const i4 = r4.length - 1, { handler: s4, once: n6 } = r4[i4], o4 = (t4) => {
          const i5 = r4[t4 - 1];
          return i5 ? (e3, s5) => i5.handler(e3, s5, o4(t4 - 1)) : e2;
        };
        h = [{ id: 0, hook: t3, once: n6, handler: s4, defaultHandler: o4(i4) }];
      }
      return { found: true, before: o3, handler: h, after: a3, replaced: l2 };
    }
    sortRegistrations(t3, e2) {
      var i3, s3;
      return (null != (i3 = t3.priority) ? i3 : 0) - (null != (s3 = e2.priority) ? s3 : 0) || t3.id - e2.id || 0;
    }
    dispatchDomEvent(t3, e2, i3) {
      if (null != e2 && e2.done) return;
      const s3 = { hook: t3, args: i3, visit: e2 || this.swup.visit };
      document.dispatchEvent(new CustomEvent("swup:any", { detail: s3, bubbles: true })), document.dispatchEvent(new CustomEvent(`swup:${t3}`, { detail: s3, bubbles: true }));
    }
    parseName(t3) {
      const [e2, ...s3] = t3.split(".");
      return [e2, s3.reduce((t4, e3) => i({}, t4, { [e3]: true }), {})];
    }
  };
  var C = (t3) => {
    if (t3 && "#" === t3.charAt(0) && (t3 = t3.substring(1)), !t3) return null;
    const e2 = decodeURIComponent(t3);
    let i3 = document.getElementById(t3) || document.getElementById(e2) || p(`a[name='${CSS.escape(t3)}']`) || p(`a[name='${CSS.escape(e2)}']`);
    return i3 || "top" !== t3 || (i3 = document.body), i3;
  };
  var U = "transition";
  var P = "animation";
  async function $({ selector: t3, elements: e2 }) {
    if (false === t3 && !e2) return;
    let i3 = [];
    if (e2) i3 = Array.from(e2);
    else if (t3 && (i3 = m(t3, document.body), !i3.length)) return void console.warn(`[swup] No elements found matching animationSelector \`${t3}\``);
    const s3 = i3.map((t4) => function(t5) {
      const { type: e3, timeout: i4, propCount: s4 } = function(t6) {
        const e4 = window.getComputedStyle(t6), i5 = A(e4, `${U}Delay`), s5 = A(e4, `${U}Duration`), n5 = x(i5, s5), o3 = A(e4, `${P}Delay`), r4 = A(e4, `${P}Duration`), a3 = x(o3, r4), l2 = Math.max(n5, a3), h = l2 > 0 ? n5 > a3 ? U : P : null;
        return { type: h, timeout: l2, propCount: h ? h === U ? s5.length : r4.length : 0 };
      }(t5);
      return !(!e3 || !i4) && new Promise((n5) => {
        const o3 = `${e3}end`, r4 = performance.now();
        let a3 = 0;
        const l2 = () => {
          t5.removeEventListener(o3, h), n5();
        }, h = (e4) => {
          e4.target === t5 && ((performance.now() - r4) / 1e3 < e4.elapsedTime || ++a3 >= s4 && l2());
        };
        setTimeout(() => {
          a3 < s4 && l2();
        }, i4 + 1), t5.addEventListener(o3, h);
      });
    }(t4));
    s3.filter(Boolean).length > 0 ? await Promise.all(s3) : t3 && console.warn(`[swup] No CSS animation duration defined on elements matching \`${t3}\``);
  }
  function A(t3, e2) {
    return (t3[e2] || "").split(", ");
  }
  function x(t3, e2) {
    for (; t3.length < e2.length; ) t3 = t3.concat(t3);
    return Math.max(...e2.map((e3, i3) => H(e3) + H(t3[i3])));
  }
  function H(t3) {
    return 1e3 * parseFloat(t3);
  }
  function V(t3, e2 = {}, s3 = {}) {
    if ("string" != typeof t3) throw new Error("swup.navigate() requires a URL parameter");
    if (this.shouldIgnoreVisit(t3, { el: s3.el, event: s3.event })) return void window.location.assign(t3);
    const { url: n5, hash: o3 } = l.fromUrl(t3), r4 = this.createVisit(i({}, s3, { to: n5, hash: o3 }));
    this.performNavigation(r4, e2);
  }
  async function I(t3, e2 = {}) {
    if (this.navigating) {
      if (this.visit.state >= 6) return t3.state = 2, void (this.onVisitEnd = () => this.performNavigation(t3, e2));
      await this.hooks.call("visit:abort", this.visit, void 0), delete this.visit.to.document, this.visit.state = 8;
    }
    this.navigating = true, this.visit = t3;
    const { el: i3 } = t3.trigger;
    e2.referrer = e2.referrer || this.location.url, false === e2.animate && (t3.animation.animate = false), t3.animation.animate || this.classes.clear();
    const n5 = e2.history || y(i3, "data-swup-history");
    "string" == typeof n5 && ["push", "replace"].includes(n5) && (t3.history.action = n5);
    const a3 = e2.animation || y(i3, "data-swup-animation");
    var h, c2;
    "string" == typeof a3 && (t3.animation.name = a3), t3.meta = e2.meta || {}, "object" == typeof e2.cache ? (t3.cache.read = null != (h = e2.cache.read) ? h : t3.cache.read, t3.cache.write = null != (c2 = e2.cache.write) ? c2 : t3.cache.write) : void 0 !== e2.cache && (t3.cache = { read: !!e2.cache, write: !!e2.cache }), delete e2.cache;
    try {
      await this.hooks.call("visit:start", t3, void 0), t3.state = 3;
      const i4 = this.hooks.call("page:load", t3, { options: e2 }, async (t4, e3) => {
        let i5;
        return t4.cache.read && (i5 = this.cache.get(t4.to.url)), e3.page = i5 || await this.fetchPage(t4.to.url, e3.options), e3.cache = !!i5, e3.page;
      });
      i4.then(({ html: e3 }) => {
        t3.advance(5), t3.to.html = e3, t3.to.document = new DOMParser().parseFromString(e3, "text/html");
      });
      const n6 = t3.to.url + t3.to.hash;
      if (t3.history.popstate || ("replace" === t3.history.action || t3.to.url === this.location.url ? r(n6) : (this.currentHistoryIndex++, o(n6, { index: this.currentHistoryIndex }))), this.location = l.fromUrl(n6), t3.history.popstate && this.classes.add("is-popstate"), t3.animation.name && this.classes.add(`to-${s(t3.animation.name)}`), t3.animation.wait && await i4, t3.done) return;
      if (await this.hooks.call("visit:transition", t3, void 0, async () => {
        if (!t3.animation.animate) return await this.hooks.call("animation:skip", void 0), void await this.renderPage(t3, await i4);
        t3.advance(4), await this.animatePageOut(t3), t3.animation.native && document.startViewTransition ? await document.startViewTransition(async () => await this.renderPage(t3, await i4)).finished : await this.renderPage(t3, await i4), await this.animatePageIn(t3);
      }), t3.done) return;
      await this.hooks.call("visit:end", t3, void 0, () => this.classes.clear()), t3.state = 7, this.navigating = false, this.onVisitEnd && (this.onVisitEnd(), this.onVisitEnd = void 0);
    } catch (e3) {
      if (!e3 || null != e3 && e3.aborted) return void (t3.state = 8);
      t3.state = 9, console.error(e3), this.options.skipPopStateHandling = () => (window.location.assign(t3.to.url + t3.to.hash), true), window.history.back();
    } finally {
      delete t3.to.document;
    }
  }
  var L = async function(t3) {
    await this.hooks.call("animation:out:start", t3, void 0, () => {
      this.classes.add("is-changing", "is-animating", "is-leaving");
    }), await this.hooks.call("animation:out:await", t3, { skip: false }, (t4, { skip: e2 }) => {
      if (!e2) return this.awaitAnimations({ selector: t4.animation.selector });
    }), await this.hooks.call("animation:out:end", t3, void 0);
  };
  var q = function(t3) {
    var e2;
    const i3 = t3.to.document;
    if (!i3) return false;
    const s3 = (null == (e2 = i3.querySelector("title")) ? void 0 : e2.innerText) || "";
    document.title = s3;
    const n5 = m('[data-swup-persist]:not([data-swup-persist=""])'), o3 = t3.containers.map((t4) => {
      const e3 = document.querySelector(t4), s4 = i3.querySelector(t4);
      return e3 && s4 ? (e3.replaceWith(s4.cloneNode(true)), true) : (e3 || console.warn(`[swup] Container missing in current document: ${t4}`), s4 || console.warn(`[swup] Container missing in incoming document: ${t4}`), false);
    }).filter(Boolean);
    return n5.forEach((t4) => {
      const e3 = t4.getAttribute("data-swup-persist"), i4 = p(`[data-swup-persist="${e3}"]`);
      i4 && i4 !== t4 && i4.replaceWith(t4);
    }), o3.length === t3.containers.length;
  };
  var R = function(t3) {
    const e2 = { behavior: "auto" }, { target: s3, reset: n5 } = t3.scroll, o3 = null != s3 ? s3 : t3.to.hash;
    let r4 = false;
    return o3 && (r4 = this.hooks.callSync("scroll:anchor", t3, { hash: o3, options: e2 }, (t4, { hash: e3, options: i3 }) => {
      const s4 = this.getAnchorElement(e3);
      return s4 && s4.scrollIntoView(i3), !!s4;
    })), n5 && !r4 && (r4 = this.hooks.callSync("scroll:top", t3, { options: e2 }, (t4, { options: e3 }) => (window.scrollTo(i({ top: 0, left: 0 }, e3)), true))), r4;
  };
  var T = async function(t3) {
    if (t3.done) return;
    const e2 = this.hooks.call("animation:in:await", t3, { skip: false }, (t4, { skip: e3 }) => {
      if (!e3) return this.awaitAnimations({ selector: t4.animation.selector });
    });
    await w(), await this.hooks.call("animation:in:start", t3, void 0, () => {
      this.classes.remove("is-animating");
    }), await e2, await this.hooks.call("animation:in:end", t3, void 0);
  };
  var N = async function(t3, e2) {
    if (t3.done) return;
    t3.advance(6);
    const { url: i3 } = e2;
    this.isSameResolvedUrl(n(), i3) || (r(i3), this.location = l.fromUrl(i3), t3.to.url = this.location.url, t3.to.hash = this.location.hash), await this.hooks.call("content:replace", t3, { page: e2 }, (t4, {}) => {
      if (this.classes.remove("is-leaving"), t4.animation.animate && this.classes.add("is-rendering"), !this.replaceContent(t4)) throw new Error("[swup] Container mismatch, aborting");
      t4.animation.animate && (this.classes.add("is-changing", "is-animating", "is-rendering"), t4.animation.name && this.classes.add(`to-${s(t4.animation.name)}`));
    }), await this.hooks.call("content:scroll", t3, void 0, () => this.scrollToContent(t3)), await this.hooks.call("page:view", t3, { url: this.location.url, title: document.title });
  };
  var O = function(t3) {
    var e2;
    if (e2 = t3, Boolean(null == e2 ? void 0 : e2.isSwupPlugin)) {
      if (t3.swup = this, !t3._checkRequirements || t3._checkRequirements()) return t3._beforeMount && t3._beforeMount(), t3.mount(), this.plugins.push(t3), this.plugins;
    } else console.error("Not a swup plugin instance", t3);
  };
  function D(t3) {
    const e2 = this.findPlugin(t3);
    if (e2) return e2.unmount(), e2._afterUnmount && e2._afterUnmount(), this.plugins = this.plugins.filter((t4) => t4 !== e2), this.plugins;
    console.error("No such plugin", e2);
  }
  function M(t3) {
    return this.plugins.find((e2) => e2 === t3 || e2.name === t3 || e2.name === `Swup${String(t3)}`);
  }
  function W(t3) {
    if ("function" != typeof this.options.resolveUrl) return console.warn("[swup] options.resolveUrl expects a callback function."), t3;
    const e2 = this.options.resolveUrl(t3);
    return e2 && "string" == typeof e2 ? e2.startsWith("//") || e2.startsWith("http") ? (console.warn("[swup] options.resolveUrl needs to return a relative url"), t3) : e2 : (console.warn("[swup] options.resolveUrl needs to return a url"), t3);
  }
  function B(t3, e2) {
    return this.resolveUrl(t3) === this.resolveUrl(e2);
  }
  var j = { animateHistoryBrowsing: false, animationSelector: '[class*="transition-"]', animationScope: "html", cache: true, containers: ["#swup"], hooks: {}, ignoreVisit: (t3, { el: e2 } = {}) => !(null == e2 || !e2.closest("[data-no-swup]")), linkSelector: "a[href]", linkToSelf: "scroll", native: false, plugins: [], resolveUrl: (t3) => t3, requestHeaders: { "X-Requested-With": "swup", Accept: "text/html, application/xhtml+xml" }, skipPopStateHandling: (t3) => {
    var e2;
    return "swup" !== (null == (e2 = t3.state) ? void 0 : e2.source);
  }, timeout: 0 };
  var _ = class {
    get currentPageUrl() {
      return this.location.url;
    }
    constructor(t3 = {}) {
      var e2, s3;
      this.version = "4.8.2", this.options = void 0, this.defaults = j, this.plugins = [], this.visit = void 0, this.cache = void 0, this.hooks = void 0, this.classes = void 0, this.location = l.fromUrl(window.location.href), this.currentHistoryIndex = void 0, this.clickDelegate = void 0, this.navigating = false, this.onVisitEnd = void 0, this.use = O, this.unuse = D, this.findPlugin = M, this.log = () => {
      }, this.navigate = V, this.performNavigation = I, this.createVisit = S, this.delegateEvent = a, this.fetchPage = u, this.awaitAnimations = $, this.renderPage = N, this.replaceContent = q, this.animatePageIn = T, this.animatePageOut = L, this.scrollToContent = R, this.getAnchorElement = C, this.getCurrentUrl = n, this.resolveUrl = W, this.isSameResolvedUrl = B, this.options = i({}, this.defaults, t3), this.handleLinkClick = this.handleLinkClick.bind(this), this.handlePopState = this.handlePopState.bind(this), this.cache = new d(this), this.classes = new k(this), this.hooks = new E(this), this.visit = this.createVisit({ to: "" }), this.currentHistoryIndex = null != (e2 = null == (s3 = window.history.state) ? void 0 : s3.index) ? e2 : 1, this.enable();
    }
    async enable() {
      var t3;
      const { linkSelector: e2 } = this.options;
      this.clickDelegate = this.delegateEvent(e2, "click", this.handleLinkClick), window.addEventListener("popstate", this.handlePopState), this.options.animateHistoryBrowsing && (window.history.scrollRestoration = "manual"), this.options.native = this.options.native && !!document.startViewTransition, this.options.plugins.forEach((t4) => this.use(t4));
      for (const [t4, e3] of Object.entries(this.options.hooks)) {
        const [i3, s3] = this.hooks.parseName(t4);
        this.hooks.on(i3, e3, s3);
      }
      "swup" !== (null == (t3 = window.history.state) ? void 0 : t3.source) && r(null, { index: this.currentHistoryIndex }), await w(), await this.hooks.call("enable", void 0, void 0, () => {
        const t4 = document.documentElement;
        t4.classList.add("swup-enabled"), t4.classList.toggle("swup-native", this.options.native);
      });
    }
    async destroy() {
      this.clickDelegate.destroy(), window.removeEventListener("popstate", this.handlePopState), this.cache.clear(), this.options.plugins.forEach((t3) => this.unuse(t3)), await this.hooks.call("disable", void 0, void 0, () => {
        const t3 = document.documentElement;
        t3.classList.remove("swup-enabled"), t3.classList.remove("swup-native");
      }), this.hooks.clear();
    }
    shouldIgnoreVisit(t3, { el: e2, event: i3 } = {}) {
      const { origin: s3, url: n5, hash: o3 } = l.fromUrl(t3);
      return s3 !== window.location.origin || !(!e2 || !this.triggerWillOpenNewWindow(e2)) || !!this.options.ignoreVisit(n5 + o3, { el: e2, event: i3 });
    }
    handleLinkClick(t3) {
      const e2 = t3.delegateTarget, { href: i3, url: s3, hash: n5 } = l.fromElement(e2);
      if (this.shouldIgnoreVisit(i3, { el: e2, event: t3 })) return;
      if (this.navigating && s3 === this.visit.to.url) return void t3.preventDefault();
      const o3 = this.createVisit({ to: s3, hash: n5, el: e2, event: t3 });
      t3.metaKey || t3.ctrlKey || t3.shiftKey || t3.altKey ? this.hooks.callSync("link:newtab", o3, { href: i3 }) : 0 === t3.button && this.hooks.callSync("link:click", o3, { el: e2, event: t3 }, () => {
        var e3;
        const i4 = null != (e3 = o3.from.url) ? e3 : "";
        t3.preventDefault(), s3 && s3 !== i4 ? this.isSameResolvedUrl(s3, i4) || this.performNavigation(o3) : n5 ? this.hooks.callSync("link:anchor", o3, { hash: n5 }, () => {
          r(s3 + n5), this.scrollToContent(o3);
        }) : this.hooks.callSync("link:self", o3, void 0, () => {
          "navigate" === this.options.linkToSelf ? this.performNavigation(o3) : (r(s3), this.scrollToContent(o3));
        });
      });
    }
    handlePopState(t3) {
      var e2, i3, s3, o3;
      const r4 = null != (e2 = null == (i3 = t3.state) ? void 0 : i3.url) ? e2 : window.location.href;
      if (this.options.skipPopStateHandling(t3)) return;
      if (this.isSameResolvedUrl(n(), this.location.url)) return;
      const { url: a3, hash: h } = l.fromUrl(r4), c2 = this.createVisit({ to: a3, hash: h, event: t3 });
      c2.history.popstate = true;
      const u2 = null != (s3 = null == (o3 = t3.state) ? void 0 : o3.index) ? s3 : 0;
      u2 && u2 !== this.currentHistoryIndex && (c2.history.direction = u2 - this.currentHistoryIndex > 0 ? "forwards" : "backwards", this.currentHistoryIndex = u2), c2.animation.animate = false, c2.scroll.reset = false, c2.scroll.target = false, this.options.animateHistoryBrowsing && (c2.animation.animate = true, c2.scroll.reset = true), this.hooks.callSync("history:popstate", c2, { event: t3 }, () => {
        this.performNavigation(c2);
      });
    }
    triggerWillOpenNewWindow(t3) {
      return !!t3.matches('[download], [target="_blank"]');
    }
  };

  // node_modules/@swup/plugin/dist/index.modern.js
  function r2() {
    return r2 = Object.assign ? Object.assign.bind() : function(r4) {
      for (var n5 = 1; n5 < arguments.length; n5++) {
        var e2 = arguments[n5];
        for (var t3 in e2) Object.prototype.hasOwnProperty.call(e2, t3) && (r4[t3] = e2[t3]);
      }
      return r4;
    }, r2.apply(this, arguments);
  }
  var n2 = (r4) => String(r4).split(".").map((r5) => String(parseInt(r5 || "0", 10))).concat(["0", "0"]).slice(0, 3).join(".");
  var e = class {
    constructor() {
      this.isSwupPlugin = true, this.swup = void 0, this.version = void 0, this.requires = {}, this.handlersToUnregister = [];
    }
    mount() {
    }
    unmount() {
      this.handlersToUnregister.forEach((r4) => r4()), this.handlersToUnregister = [];
    }
    _beforeMount() {
      if (!this.name) throw new Error("You must define a name of plugin when creating a class.");
    }
    _afterUnmount() {
    }
    _checkRequirements() {
      return "object" != typeof this.requires || Object.entries(this.requires).forEach(([r4, e2]) => {
        if (!function(r5, e3, t3) {
          const s3 = function(r6, n5) {
            var e4;
            if ("swup" === r6) return null != (e4 = n5.version) ? e4 : "";
            {
              var t4;
              const e5 = n5.findPlugin(r6);
              return null != (t4 = null == e5 ? void 0 : e5.version) ? t4 : "";
            }
          }(r5, t3);
          return !!s3 && ((r6, e4) => e4.every((e5) => {
            const [, t4, s4] = e5.match(/^([\D]+)?(.*)$/) || [];
            var o3, i3;
            return ((r7, n5) => {
              const e6 = { "": (r8) => 0 === r8, ">": (r8) => r8 > 0, ">=": (r8) => r8 >= 0, "<": (r8) => r8 < 0, "<=": (r8) => r8 <= 0 };
              return (e6[n5] || e6[""])(r7);
            })((i3 = s4, o3 = n2(o3 = r6), i3 = n2(i3), o3.localeCompare(i3, void 0, { numeric: true })), t4 || ">=");
          }))(s3, e3);
        }(r4, e2 = Array.isArray(e2) ? e2 : [e2], this.swup)) {
          const n5 = `${r4} ${e2.join(", ")}`;
          throw new Error(`Plugin version mismatch: ${this.name} requires ${n5}`);
        }
      }), true;
    }
    on(r4, n5, e2 = {}) {
      var t3;
      n5 = !(t3 = n5).name.startsWith("bound ") || t3.hasOwnProperty("prototype") ? n5.bind(this) : n5;
      const s3 = this.swup.hooks.on(r4, n5, e2);
      return this.handlersToUnregister.push(s3), s3;
    }
    once(n5, e2, t3 = {}) {
      return this.on(n5, e2, r2({}, t3, { once: true }));
    }
    before(n5, e2, t3 = {}) {
      return this.on(n5, e2, r2({}, t3, { before: true }));
    }
    replace(n5, e2, t3 = {}) {
      return this.on(n5, e2, r2({}, t3, { replace: true }));
    }
    off(r4, n5) {
      return this.swup.hooks.off(r4, n5);
    }
  };

  // node_modules/@swup/theme/dist/index.modern.js
  var t = class extends e {
    constructor(...e2) {
      super(...e2), this._originalAnimationSelectorOption = "", this._addedStyleElements = [], this._addedHTMLContent = [], this._classNameAddedToElements = [], this._addClassNameToElement = () => {
        this._classNameAddedToElements.forEach((e3) => {
          Array.from(document.querySelectorAll(e3.selector)).forEach((t3) => {
            t3.classList.add(`swup-transition-${e3.name}`);
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
          e3.className.split(" ").forEach((t3) => {
            new RegExp("^swup-transition-").test(t3) && e3.classList.remove(t3);
          });
        });
      }), this.swup.hooks.off("content:replace", this._addClassNameToElement);
    }
    applyStyles(e2) {
      const t3 = document.createElement("style");
      t3.setAttribute("data-swup-theme", ""), t3.appendChild(document.createTextNode(e2)), document.head.prepend(t3), this._addedStyleElements.push(t3);
    }
    applyHTML(e2) {
      const t3 = document.createElement("div");
      t3.innerHTML = e2, document.body.appendChild(t3), this._addedHTMLContent.push(t3);
    }
    addClassName(e2, t3) {
      this._classNameAddedToElements.push({ selector: e2, name: t3 }), this._addClassNameToElement();
    }
  };

  // node_modules/@swup/fade-theme/dist/index.modern.js
  function a2() {
    return a2 = Object.assign ? Object.assign.bind() : function(t3) {
      for (var a3 = 1; a3 < arguments.length; a3++) {
        var n5 = arguments[a3];
        for (var i3 in n5) ({}).hasOwnProperty.call(n5, i3) && (t3[i3] = n5[i3]);
      }
      return t3;
    }, a2.apply(null, arguments);
  }
  var n3 = class extends t {
    constructor(t3 = {}) {
      super(), this.name = "SwupFadeTheme", this.defaults = { mainElement: "#swup" }, this.options = a2({}, this.defaults, t3);
    }
    mount() {
      this.applyStyles("html{--swup-fade-theme-duration:.4s}html.is-changing .swup-transition-main{opacity:1;transition:opacity var(--swup-fade-theme-duration)}html.is-animating .swup-transition-main{opacity:0}"), this.addClassName(this.options.mainElement, "main");
    }
  };

  // node_modules/@swup/head-plugin/dist/index.modern.js
  function t2() {
    return t2 = Object.assign ? Object.assign.bind() : function(e2) {
      for (var t3 = 1; t3 < arguments.length; t3++) {
        var s3 = arguments[t3];
        for (var n5 in s3) ({}).hasOwnProperty.call(s3, n5) && (e2[n5] = s3[n5]);
      }
      return e2;
    }, t2.apply(null, arguments);
  }
  function s2(e2) {
    return "title" !== e2.localName && !e2.matches("[data-swup-theme]");
  }
  function n4(e2, t3) {
    return e2.outerHTML === t3.outerHTML;
  }
  function r3(e2, t3 = []) {
    const s3 = Array.from(e2.attributes);
    return t3.length ? s3.filter(({ name: e3 }) => t3.some((t4) => t4 instanceof RegExp ? t4.test(e3) : e3 === t4)) : s3;
  }
  function o2(e2) {
    return e2.matches("link[rel=stylesheet][href]");
  }
  var i2 = class extends e {
    constructor(e2 = {}) {
      var i3;
      super(), i3 = this, this.name = "SwupHeadPlugin", this.requires = { swup: ">=4.6" }, this.defaults = { persistTags: false, persistAssets: false, awaitAssets: false, attributes: ["lang", "dir"], timeout: 3e3 }, this.options = void 0, this.updateHead = async function(e3, { page: {} }) {
        const { awaitAssets: a3, attributes: l2, timeout: u2 } = i3.options, c2 = e3.to.document, { removed: d2, added: h } = function(e4, r4, { shouldPersist: o3 = () => false } = {}) {
          const i4 = Array.from(e4.children), a4 = Array.from(r4.children), l3 = (u3 = i4, a4.reduce((e5, t3, s3) => (u3.some((e6) => n4(t3, e6)) || e5.push({ el: t3, index: s3 }), e5), []));
          var u3;
          const c3 = function(e5, t3) {
            return e5.reduce((e6, s3) => (t3.some((e7) => n4(s3, e7)) || e6.push({ el: s3 }), e6), []);
          }(i4, a4);
          c3.reverse().filter(({ el: e5 }) => s2(e5)).filter(({ el: e5 }) => !o3(e5)).forEach(({ el: t3 }) => e4.removeChild(t3));
          const d3 = l3.filter(({ el: e5 }) => s2(e5)).map((s3) => {
            let n5 = s3.el.cloneNode(true);
            return e4.insertBefore(n5, e4.children[(s3.index || 0) + 1] || null), t2({}, s3, { el: n5 });
          });
          return { removed: c3.map(({ el: e5 }) => e5), added: d3.map(({ el: e5 }) => e5) };
        }(document.head, c2.head, { shouldPersist: (e4) => i3.isPersistentTag(e4) });
        if (i3.swup.log(`Removed ${d2.length} / added ${h.length} tags in head`), null != l2 && l2.length && function(e4, t3, s3 = []) {
          const n5 = /* @__PURE__ */ new Set();
          for (const { name: o3, value: i4 } of r3(t3, s3)) e4.setAttribute(o3, i4), n5.add(o3);
          for (const { name: t4 } of r3(e4, s3)) n5.has(t4) || e4.removeAttribute(t4);
        }(document.documentElement, c2.documentElement, l2), a3) {
          const e4 = function(e5, t3 = 0) {
            return e5.filter(o2).map((e6) => function(e7, t4 = 0) {
              let s3;
              const n5 = (t5) => {
                e7.sheet ? t5() : s3 = setTimeout(() => n5(t5), 10);
              };
              return new Promise((r4) => {
                n5(() => r4(e7)), t4 > 0 && setTimeout(() => {
                  s3 && clearTimeout(s3), r4(e7);
                }, t4);
              });
            }(e6, t3));
          }(h, u2);
          e4.length && (i3.swup.log(`Waiting for ${e4.length} assets to load`), await Promise.all(e4));
        }
      }, this.options = t2({}, this.defaults, e2), this.options.persistAssets && !this.options.persistTags && (this.options.persistTags = "link[rel=stylesheet], script[src], style");
    }
    mount() {
      this.before("content:replace", this.updateHead);
    }
    isPersistentTag(e2) {
      const { persistTags: t3 } = this.options;
      return "function" == typeof t3 ? t3(e2) : "string" == typeof t3 && t3.length > 0 ? e2.matches(t3) : Boolean(t3);
    }
  };

  // src/assets/js/swup.js
  var swup = new _({
    plugins: [
      new n3(),
      new i2()
    ]
  });
  swup.hooks.on("visit:start", () => {
    console.log("Navigating to:", window.location.href);
  });
})();
//# sourceMappingURL=swup.js.map
