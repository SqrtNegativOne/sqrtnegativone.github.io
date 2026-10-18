<!--
  Dormant: the longer, data-filled /main intro, kept for later.
  It is not imported by +page.svelte. The supporting code lives in
  $lib/deviceInfo.js and /api/whereami.

  To restore: import this component from +page.svelte and re-add
  @fontsource/vt323/400.css to the page.
-->

<script>
  import { onMount } from "svelte";
  import {
    collectDeviceInfo,
    emptyDeviceInfo,
    fetchNetworkIdentity,
    formatClock,
    measureRefreshRate,
    readHighEntropy,
    watchBattery,
    watchConnection
  } from "$lib/deviceInfo.js";

  // Start from the same empty shape the server rendered so hydration matches,
  // then fill it synchronously on mount.
  let info = $state(emptyDeviceInfo());

  onMount(() => {
    Object.assign(info, collectDeviceInfo());

    let active = true;
    const cleanups = [];

    const stopBattery = watchBattery((battery) => {
      info.battery = battery.level;
      info.charging = battery.charging;
    });
    if (stopBattery) cleanups.push(stopBattery);

    const stopConnection = watchConnection((connection) => {
      info.type = connection.type;
      info.downlink = connection.downlink;
      info.rtt = connection.rtt;
    });
    if (stopConnection) cleanups.push(stopConnection);

    // If rAF is throttled (background tab, headless, low-power mode), fall
    // back to the common 60 Hz rather than leaving a dash in the sentence.
    measureRefreshRate().then((hz) => {
      if (active) info.hz = hz ?? 60;
    });

    const remeasureOnVisible = () => {
      if (!active || document.visibilityState !== 'visible') return;
      measureRefreshRate().then((hz) => {
        if (active && hz) info.hz = hz;
      });
    };
    document.addEventListener('visibilitychange', remeasureOnVisible);
    cleanups.push(() => document.removeEventListener('visibilitychange', remeasureOnVisible));

    fetchNetworkIdentity().then((identity) => {
      if (!active || !identity) return;
      if (identity.city) info.city = identity.city;
      if (identity.country) info.country = identity.country;
      if (identity.ip) info.ip = identity.ip;
    });

    readHighEntropy(info).then((extra) => {
      if (active && extra) Object.assign(info, extra);
    });

    const clock = setInterval(() => {
      if (active) info.time = formatClock(new Date());
    }, 1000);

    return () => {
      active = false;
      clearInterval(clock);
      for (const stop of cleanups) stop?.();
    };
  });

  let agentPhrase = $derived(
    info.browser
      ? `${info.browser}${info.version ? ` ${info.version}` : ""}`
      : "of unknown make"
  );
  let osPhrase = $derived(info.os || "an unknown OS");
  let archPhrase = $derived(info.arch || "an unknown architecture");
  let coresPhrase = $derived(
    info.cores ? `${info.cores}` : "an unknown number of"
  );
  let ramPhrase = $derived(
    info.ram
      ? `${info.ram} GB of volatile working memory`
      : "an unspecified amount of volatile working memory"
  );
  let gpuPhrase = $derived(
    info.gpu
      ? `${withArticle(info.gpu)} ${info.gpu} raster coprocessor`
      : "a raster coprocessor of unknown provenance"
  );
  let batteryPhrase = $derived(
    info.battery != null
      ? `on an onboard electrochemical reserve at ${info.battery}%`
      : "on an onboard electrochemical reserve of unknown charge"
  );
  let locationPhrase = $derived(
    info.city && info.country
      ? `${info.city}, ${info.country}`
      : info.city || info.country || "an undisclosed location"
  );
  let protocolPhrase = $derived(info.protocol || "an unknown protocol");
  let hostPhrase = $derived(info.host || "an unknown host");
  let ipPhrase = $derived(info.ip || "an unlisted address");
  let connectionPhrase = $derived(connectionText(info));
  let tzPhrase = $derived(info.tz || "UTC");
  let timePhrase = $derived(info.time || "—:—:—");

  function withArticle(name) {
    const value = String(name).trim();
    if (/^(nvidia|amd|intel|apple|adreno|arm)/i.test(value)) return `an`;
    return /^[aeiou]/i.test(value) ? "an" : "a";
  }

  function connectionText(current) {
    const link = current.type
      ? `a ${current.type} link`
      : "a link of unknown generation";

    const qualities = [];
    if (current.downlink != null) {
      qualities.push(`~${formatDownlink(current.downlink)} Mbps`);
    }
    if (current.rtt != null) {
      qualities.push(`${current.rtt} ms latency`);
    }

    if (qualities.length === 0) return `${link} of unmeasured bandwidth and latency`;
    if (qualities.length === 1) return `${link} of ${qualities[0]}`;
    return `${link} of ${qualities[0]} and ${qualities[1]}`;
  }

  function formatDownlink(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return number >= 10 ? `${Math.round(number)}` : number.toFixed(1).replace(/\.0$/, "");
  }
</script>

<div class="intro-copy">
  <p class="lede">
    This encountered hypermedia document representation materialized on a {info.resolution || "—×—"} {info.dpr || "—"} dense {info.hz || "—"}Hz
    refresh-rate photon-emission array through interpretation of nested angle-bracket directives by a user
    agent {agentPhrase}, {osPhrase}, {archPhrase} on {coresPhrase} parallel logic units with {ramPhrase} and
    {gpuPhrase}, {batteryPhrase} (hereinafter referred to as the "<strong>WEBSITE</strong>") is entered
    into geolocation {locationPhrase} via {protocolPhrase} from {hostPhrase} to network ordinal {ipPhrase}
    over {connectionPhrase} on local rotational phase: {tzPhrase}, {timePhrase}; was created by the
    carbon-based entity commonly addressed as the Square Root of Negative One.
  </p>

  <p>
    Given the title's length and the unfortunate sexual innuendo its contraction "Sqrt-1" produces when
    pronounced naively, hence hereinafter will be referred to with the symbol U+0049, materialised as
    <em>I</em>.
  </p>

  <p><em>I</em>'s pronouns are ambiguous.</p>

  <p><em>I</em> considers itself unaffected by which it cannot affect. This remains to be proven.</p>

  <p>
    <em>I</em> has been accused of nearly every mental illness under the sun. May <em>I</em> implore you to
    consider a more, exotic diagnosis, such as prosopagnosia, Cotard's syndrome, delusions of reference,
    Fregoli delusion, or schizoid personality disorder?
  </p>

  <p><em>I</em> is nobody's favourite person.</p>

  <p>
    <em>I</em> suffers from bouts of obsession and cyclicity of various interests. Like most other Homo
    sapiens, <em>I</em> is sure you'll agree. "Fandom nomad" if you will.
  </p>

  <p>
    <em>I</em> has been coding games, batch viruses on school computers and unremuneratively concerned with
    personal productivity systems. <em>I</em> also expresses an interest in writing and reading, and
    browsing the old web. But jacks of a sufficiently large number of interests are masters of none, so
    <em>I</em> hopes you'll forgive it for being incapable or at least unable to produce any results
    proving competence in any of the above.
  </p><br/>

  <p>It hopes you have a wonderful time here.</p>
</div>

<style>
  .intro-copy {
    display: flex;
    flex-direction: column;
    gap: 1.15em;
    font-family: "VT323", "Courier New", monospace;
    font-size: clamp(1.25rem, 0.45vw + 1.1rem, 1.55rem);
    line-height: 1.42;
    letter-spacing: 0.005em;
    color: var(--text);
    text-wrap: pretty;
  }

  .intro-copy p {
    margin: 0;
  }

  .intro-copy strong {
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .intro-copy em {
    font-style: italic;
  }
</style>
