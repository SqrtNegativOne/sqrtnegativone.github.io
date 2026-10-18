/**
 * Dormant: this powered the longer, data-filled /main intro. It is kept for
 * later and is not imported by the current page; see IntroDynamic.svelte.
 *
 * Best-effort readout of the machine, browser and network that loaded the
 * page. Everything is collected client-side, once. Nothing here is persisted.
 */

const PINNED_REFRESH_RATES = [60, 75, 90, 120, 144, 165, 240, 360];

/** @returns {object} */
export function collectDeviceInfo() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return emptyDeviceInfo();
  }

  const ua = navigator.userAgent || '';
  const browser = detectBrowser(ua, navigator.userAgentData);
  const gpu = readGpu();
  const tz = readTimeZone();
  const conn = readConnection();

  return {
    resolution:
      window.screen?.width && window.screen?.height
        ? `${window.screen.width}×${window.screen.height}`
        : null,
    dpr: formatDpr(window.devicePixelRatio),
    hz: null,
    browser: browser.name,
    version: browser.version,
    os: detectOs(ua, navigator.userAgentData),
    arch: detectArch(ua, gpu),
    cores: navigator.hardwareConcurrency || null,
    ram: typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null,
    gpu,
    battery: null,
    charging: null,
    protocol: location.protocol ? location.protocol.replace(':', '').toUpperCase() : null,
    host: location.host || null,
    ip: null,
    city: cityFromTimezone(tz),
    country: countryFromLocale(),
    type: conn.type,
    downlink: conn.downlink,
    rtt: conn.rtt,
    tz,
    time: formatClock(new Date())
  };
}

/** The server-rendered / pre-hydration shape; every value is filled in later. */
export function emptyDeviceInfo() {
  return {
    resolution: null,
    dpr: null,
    hz: null,
    browser: null,
    version: null,
    os: null,
    arch: null,
    cores: null,
    ram: null,
    gpu: null,
    battery: null,
    charging: null,
    protocol: null,
    host: null,
    ip: null,
    city: null,
    country: null,
    type: null,
    downlink: null,
    rtt: null,
    tz: null,
    time: ''
  };
}

/** Measure the display's real refresh rate for ~400 ms. */
export function measureRefreshRate(duration = 400) {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'undefined') return resolve(null);
    if (document.visibilityState !== 'visible') return resolve(null);

    let frames = 0;
    let start = 0;

    // rAF can stall in a background tab; never leave the promise pending.
    const timeout = setTimeout(() => resolve(null), duration + 1000);

    function frame(now) {
      if (!start) start = now;
      frames += 1;
      const elapsed = now - start;

      if (elapsed >= duration) {
        clearTimeout(timeout);
        const measured = (frames * 1000) / elapsed;
        if (!Number.isFinite(measured) || measured < 20 || measured > 400) return resolve(null);
        const nearest = PINNED_REFRESH_RATES.reduce(
          (best, rate) => (Math.abs(rate - measured) < Math.abs(best - measured) ? rate : best),
          60
        );
        resolve(Math.abs(nearest - measured) <= 5 ? nearest : Math.round(measured));
        return;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  });
}

/**
 * Battery is not exposed by Firefox or Safari; callers should keep a graceful
 * fallback. Returns a cleanup function when supported.
 */
export function watchBattery(onChange) {
  const getBattery = navigator.getBattery;
  if (typeof getBattery !== 'function') return null;

  let battery;
  let disposed = false;

  const emit = () => {
    if (disposed || !battery) return;
    onChange({
      level: Math.round(battery.level * 100),
      charging: Boolean(battery.charging)
    });
  };

  getBattery
    .call(navigator)
    .then((manager) => {
      if (disposed) return;
      battery = manager;
      emit();
      battery.addEventListener('levelchange', emit);
      battery.addEventListener('chargingchange', emit);
    })
    .catch(() => {});

  return () => {
    disposed = true;
    if (battery) {
      battery.removeEventListener('levelchange', emit);
      battery.removeEventListener('chargingchange', emit);
    }
  };
}

/** Chromium-only connection details; safe to call elsewhere. */
export function watchConnection(onChange) {
  const conn = readConnectionObject();
  if (!conn) return null;

  const emit = () => onChange(readConnection());
  emit();
  conn.addEventListener('change', emit);
  return () => conn.removeEventListener('change', emit);
}

/**
 * Ask our own Worker for the edge's idea of where this request came from.
 * Cloudflare exposes city/country/IP on `request.cf`; locally this degrades to
 * nulls and the timezone/locale fallbacks in `collectDeviceInfo` take over.
 */
export async function fetchNetworkIdentity() {
  try {
    const response = await fetch('/api/whereami', {
      headers: { accept: 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) return null;

    const data = await response.json();
    return {
      city: typeof data.city === 'string' && data.city ? data.city : null,
      country:
        typeof data.country === 'string' && data.country
          ? data.country.length === 2
            ? countryName(data.country)
            : data.country
          : null,
      ip: typeof data.ip === 'string' && data.ip ? data.ip : null
    };
  } catch {
    return null;
  }
}

/**
 * Fill in the high-entropy hints (full browser version, OS version, CPU
 * architecture) that are only available asynchronously in Chromium.
 */
export async function readHighEntropy(current) {
  if (typeof navigator === 'undefined') return null;

  const uad = navigator.userAgentData;
  if (!uad?.getHighEntropyValues) return null;

  try {
    const values = await uad.getHighEntropyValues([
      'architecture',
      'bitness',
      'platformVersion',
      'fullVersionList'
    ]);

    const brands = (values.fullVersionList || []).filter(
      (brand) => !/not.?a.?brand/i.test(brand.brand)
    );
    const target = normalizeBrand(current?.browser || '');
    const match = brands.find((brand) => normalizeBrand(brand.brand) === target) || brands[0];

    const next = {};
    if (match?.version) next.version = match.version;
    if (values.architecture) next.arch = formatArch(values.architecture, values.bitness);
    if (values.platformVersion) {
      const os = formatOsVersion(current?.os, values.platformVersion);
      if (os) next.os = os;
    }
    return next;
  } catch {
    return null;
  }
}

export function formatClock(date) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 8);
  }
}

/* ── Browser / OS / CPU ──────────────────────────────────────────────── */

function detectBrowser(ua, uad) {
  const brands = (uad?.brands || []).filter((brand) => !/not.?a.?brand/i.test(brand.brand));

  const preferred = ['Microsoft Edge', 'Opera', 'Brave', 'Google Chrome', 'Chromium', 'Firefox', 'Safari'];
  for (const name of preferred) {
    const match = brands.find((brand) => brand.brand.toLowerCase() === name.toLowerCase());
    if (match) {
      const label = name === 'Microsoft Edge' ? 'Edge' : name.replace(/^Google /, '');
      return { name: label, version: match.version || null };
    }
  }
  if (brands[0]) {
    return { name: brands[0].brand, version: brands[0].version || null };
  }

  const patterns = [
    [/Edg(?:e|A|iOS)?\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
    [/FxiOS\/([\d.]+)/, 'Firefox'],
    [/CriOS\/([\d.]+)/, 'Chrome'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
    [/Safari\/([\d.]+)/, 'Safari']
  ];

  for (const [pattern, name] of patterns) {
    const match = ua.match(pattern);
    if (match) return { name, version: match[1] };
  }

  return { name: null, version: null };
}

function normalizeBrand(name) {
  return String(name).toLowerCase().replace(/^(google|microsoft) /, '');
}

function detectOs(ua, uad) {
  const platform = uad?.platform || '';

  if (platform === 'Windows') return 'Windows';
  // macOS user-agent versions are frozen at 10.15 for compatibility; only the
  // high-entropy platformVersion is trustworthy there.
  if (platform === 'macOS') return 'macOS';
  if (platform === 'Android') {
    const match = ua.match(/Android\s([\d.]+)/);
    return match ? `Android ${match[1]}` : 'Android';
  }
  if (platform === 'iOS' || platform === 'iPadOS') {
    const label = platform === 'iPadOS' ? 'iPadOS' : 'iOS';
    const match = ua.match(/(?:OS|CPU OS)\s(\d+)[_.](\d+)/);
    const version = match ? match.slice(1).join('.') : null;
    return version ? `${label} ${version}` : label;
  }
  if (platform === 'Chrome OS') return 'ChromeOS';
  if (platform === 'Linux') return 'Linux';

  if (/Windows NT 10\.0/.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
  if (/Windows/.test(ua)) return 'Windows';

  const android = ua.match(/Android\s([\d.]+)/);
  if (android) return `Android ${android[1]}`;

  const ios = ua.match(/(?:iPhone|iPad|iPod).*?OS\s(\d+)[_.](\d+)/);
  if (ios) return `iOS ${ios.slice(1).join('.')}`;

  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Macintosh|Mac OS X/.test(ua)) {
    // iPadOS in desktop mode reports a Macintosh user agent.
    return navigator.maxTouchPoints > 1 ? 'iPadOS' : 'macOS';
  }
  if (/Linux/.test(ua)) return 'Linux';

  return null;
}

function detectArch(ua, gpu) {
  if (/arm64|aarch64/i.test(ua)) return 'arm64';
  if (/Win64|x86_64|WOW64|amd64/i.test(ua)) return 'x86-64';
  if (/Win32/i.test(ua)) return 'x86';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'arm64';
  if (/Android/i.test(ua)) return 'arm64';
  if (/Macintosh|Mac OS X/i.test(ua)) {
    if (gpu && /Apple M\d|Apple GPU/i.test(gpu)) return 'arm64';
    if (gpu && /Intel|AMD|Radeon/i.test(gpu)) return 'x86-64';
    return null;
  }
  return null;
}

function formatArch(architecture, bitness) {
  const arch = String(architecture || '').toLowerCase();
  if (arch === 'x86') return bitness === '64' ? 'x86-64' : bitness === '32' ? 'x86' : 'x86';
  if (arch === 'arm') return bitness === '64' ? 'arm64' : 'arm';
  return architecture || null;
}

function formatOsVersion(os, platformVersion) {
  const version = String(platformVersion || '');
  if (!version) return null;

  if (/^Windows/i.test(os || '')) {
    const major = Number.parseInt(version, 10);
    if (Number.isFinite(major)) {
      if (major >= 13) return 'Windows 11';
      if (major >= 1) return 'Windows 10';
    }
    return 'Windows';
  }

  if (/^macOS/i.test(os || '')) {
    const parts = version.split('.').filter(Boolean);
    return parts.length >= 2 ? `macOS ${parts[0]}.${parts[1]}` : `macOS ${parts[0]}`;
  }

  if (/^Android/i.test(os || '')) {
    return `Android ${version.split('.')[0]}`;
  }

  if (/^ChromeOS/i.test(os || '')) {
    return `ChromeOS ${version.split('.')[0]}`;
  }

  return null;
}

/* ── GPU ─────────────────────────────────────────────────────────────── */

function readGpu() {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const raw = debug
      ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    return cleanGpu(raw);
  } catch {
    return null;
  }
}

function cleanGpu(raw) {
  if (!raw) return null;

  let value = String(raw).trim();

  const angle = value.match(/^ANGLE \((.+)\)$/i);
  if (angle) {
    const parts = angle[1].split(',').map((part) => part.trim());
    value = parts.length > 1 ? parts[1] : parts[0];
  }

  value = value
    .replace(/^ANGLE Metal Renderer:\s*/i, '')
    .replace(/\s+Direct3D\d+\s+vs_[\d_]+(?:\s+ps_[\d_]+)?/i, '')
    .replace(/\s+D3D\d+/i, '')
    .replace(/\s+OpenGL Engine/i, '')
    .replace(/\s+Unspecified Version/i, '')
    .replace(/\s*\(0x[0-9a-f]+\)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    !value ||
    /^(webkit webgl|webgl|mozilla|generic renderer)$/i.test(value) ||
    /swiftshader|llvmpipe|software/i.test(value)
  ) {
    return null;
  }

  return value;
}

/* ── Network / location ──────────────────────────────────────────────── */

function readConnectionObject() {
  if (typeof navigator === 'undefined') return null;
  return (
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null
  );
}

function readConnection() {
  const conn = readConnectionObject();
  if (!conn) return { type: null, downlink: null, rtt: null };

  return {
    type: conn.effectiveType ? String(conn.effectiveType).toUpperCase() : null,
    downlink:
      typeof conn.downlink === 'number' && conn.downlink > 0 ? conn.downlink : null,
    rtt: typeof conn.rtt === 'number' && conn.rtt > 0 ? conn.rtt : null
  };
}

function readTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function cityFromTimezone(tz) {
  if (!tz || tz === 'UTC' || tz.startsWith('Etc/')) return null;
  const city = tz.split('/').pop();
  return city ? city.replace(/_/g, ' ') : null;
}

function countryFromLocale() {
  try {
    const locale = navigator.languages?.[0] || navigator.language || 'en';
    const region = new Intl.Locale(locale).region;
    return region ? countryName(region) : null;
  } catch {
    return null;
  }
}

function countryName(code) {
  try {
    return new Intl.DisplayNames('en', { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

function formatDpr(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value
    .toFixed(2)
    .replace(/0+$/, '')
    .replace(/\.$/, '');
}
