<script lang="ts">
  import { clickOutside } from '../utils/clickOutside';
  import { STATUS_INFO, RATING_INFO } from './mediaInfo';

  let open = $state(false);
</script>

<div class="mi-root" use:clickOutside={() => open = false}>
  <button
    type="button"
    class="mi-trigger"
    aria-label="What do statuses and ratings mean?"
    aria-haspopup="dialog"
    aria-expanded={open}
    title="What do statuses and ratings mean?"
    onclick={() => open = !open}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  </button>

  {#if open}
    <div class="mi-pop" role="dialog" aria-label="Media library legend">
      <section class="mi-section">
        <h2 class="mi-heading">Statuses</h2>
        <dl class="mi-list">
          {#each STATUS_INFO as s (s.value)}
            <div class="mi-item">
              <dt class="mi-term">{s.label}</dt>
              <dd class="mi-def">{s.definition}</dd>
            </div>
          {/each}
        </dl>
      </section>

      <section class="mi-section mi-section--pixel">
        <h2 class="mi-heading">Ratings</h2>
        <p class="mi-note">Ratings run from 0–6; half points fall between the labels below.</p>
        <dl class="mi-list mi-list--ratings">
          {#each RATING_INFO as r (r.value)}
            <div class="mi-item">
              <dt class="mi-term">{r.label}</dt>
              <dd class="mi-def">{r.definition}</dd>
            </div>
          {/each}
        </dl>
        <p class="mi-note">A <strong>?</strong> over the petals means the rating is unrated or tentative.</p>
      </section>

      <section class="mi-section mi-section--pixel">
        <h2 class="mi-heading">Why this rating system</h2>
        <ul class="mi-why-list">
          <li>5 has too few slots to slide a media into, 10 has too many.
            <ul class="mi-why-sublist">
              <li>(anecdote of a nurse I read somewhere) "On a scale of 10, how bad is your pain right now?" "It's terrible doc! 11/10!" "...okay, so, on a scale of 100, how bad is it?" "Oh. Then, it's somewhere around 70." "(so 7/10...)"</li>
            </ul>
          </li>
          <li>a lot of people don't exactly care about categorization. frankly I shouldn't either, but it's more of an itch — in particular that of organization — that you <em>have</em> to scratch. some people <em>kinda</em> care about it, like your average letterboxd user I guess. such people <em>might</em>, eventually, realise that the rating they give their movies is actually kind of random. so inevitably their first impulse is to attach <em>adjectives</em> to each rating. unfortunately, you've not fixed your terrible defuzzification (from your brain to your media system) but only stacked another one on top of it (fuzzy sets of adjectives). you need to tie them to an <em>action</em> instead.</li>
          <li>existing rating systems have <em>connotations</em>. they are hard to overcome because we see them everywhere and have therefore internalised committing them. stuff like:
            <ul class="mi-why-sublist">
              <li><strong>leniency bias:</strong> no one's bold enough to rate a movie they disliked less than 5. instead, people rate a meh film 7. 7. that's become the average rating for most places, which means...</li>
              <li><strong>scale compression:</strong> the usable part of the scale is more like 6 to 9. you don't need that much detail for bad movies! maybe one should run a normalisation over the output to counter this?</li>
              <li><strong>anchoring:</strong> 7 specialises in average because of our norms, where we see things being rated 7 and we consider anything below 70% as failing in academics.</li>
            </ul>
          </li>
          <li>likert system is famous. it worked for psychologists, why not for cinephiles or book worms or sweaty gamers?</li>
          <li>of course the traditional likert system rates things from [1, 7], not [0, 6]. this change has several advantages:
            <ul class="mi-why-sublist">
              <li>doesn't really make sense to give the worst movie you've ever seen a "1". why 1? why not "0"? it <em>is</em> the worst. feels better.</li>
              <li>a movie with a zero rating instantly informs you that this really <em>is</em> the worst movie. with 1 you're guessing if this rating system even has a 0.
                <ul class="mi-why-sublist">
                  <li>wikipedia had an article on rating systems of various magazines and websites, and each had varying levels of granularity (1 vs 0.5 vs 0.25 vs 0.1 least count), and varying lower-bounds (1, 0.5 [this makes sense because, seeing no stars filled in in the newspaper could inspire confusion — printing mistake? graphic design mistake?], 0). so if you can shift it downwards, you should, because no one expects a −1 rating.</li>
                </ul>
              </li>
              <li>it shifts the likert scale to [0, 6], which is arguably more interpretable. 1–5 or 0–5 could be treated like normal stars! most letterboxd users treat the "favourite" option as a 6th rating anyway, which is a good reading of the 6th star!</li>
              <li>you can represent it very nicely with a pentagonal flower! i wanted to use a hex flower but then i realised that doesn't quite make sense (i only have 5 real ratings; 0 would be a lack thereof). makes reading nicer.</li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  {/if}
</div>

<style>
  .mi-root {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  .mi-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 1px solid oklch(1 0 0 / 0.1);
    background: oklch(1 0 0 / 0.05);
    color: oklch(0.7107 0.0351 256.79);
    cursor: pointer;
    transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
  }

  .mi-trigger:hover {
    color: white;
    background: oklch(1 0 0 / 0.1);
    border-color: oklch(1 0 0 / 0.2);
  }

  .mi-trigger svg {
    width: 18px;
    height: 18px;
  }

  .mi-pop {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: min(420px, calc(100vw - 32px));
    max-height: min(75vh, 640px);
    overflow-y: auto;
    background: oklch(0.2103 0.0059 285.89);
    border: 1px solid oklch(0.2739 0.0055 286.03);
    border-radius: 12px;
    box-shadow: 0 24px 48px oklch(0 0 0 / 0.6);
    padding: 16px;
    z-index: 120;
    color: oklch(0.9707 0.0027 286.35);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .mi-section + .mi-section {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid oklch(0.2739 0.0055 286.03);
  }

  .mi-heading {
    margin: 0 0 10px;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: oklch(0.785 0.0112 286.14);
  }

  .mi-list {
    margin: 0;
  }

  .mi-item {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px solid oklch(1 0 0 / 0.04);
  }

  .mi-item:last-child {
    border-bottom: none;
  }

  .mi-term {
    font-size: 12px;
    font-weight: 600;
    color: oklch(0.9707 0.0027 286.35);
    margin: 0;
  }

  .mi-def {
    font-size: 12px;
    line-height: 1.4;
    color: oklch(0.7107 0.0351 256.79);
    margin: 0;
  }

  .mi-list--ratings .mi-item {
    grid-template-columns: 20px 1fr;
  }

  .mi-list--ratings .mi-term {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    color: oklch(0.8622 0.0068 286.26);
  }

  .mi-note {
    margin: 8px 0 0;
    font-size: 11.5px;
    line-height: 1.45;
    color: oklch(0.6363 0.0133 286.02);
  }

  .mi-note strong {
    color: oklch(0.9707 0.0027 286.35);
  }

  /* ---------- Pixel art font for the ratings + "why" sections ---------- */
  .mi-section--pixel {
    font-family: "VT323", "Silkscreen", "Courier New", monospace;
  }

  .mi-section--pixel .mi-heading {
    font-family: "Silkscreen", "VT323", monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
  }

  .mi-section--pixel .mi-term,
  .mi-section--pixel .mi-def,
  .mi-section--pixel .mi-note {
    font-size: 16px;
    line-height: 1.35;
  }

  .mi-section--pixel .mi-term {
    font-family: "Silkscreen", "VT323", monospace;
    color: oklch(0.8622 0.0068 286.26);
  }

  .mi-why-list {
    margin: 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 16px;
    line-height: 1.35;
    color: oklch(0.8 0.03 256);
  }

  .mi-why-list li::marker {
    color: oklch(0.5416 0.0154 285.87);
  }

  .mi-why-sublist {
    margin: 8px 0 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: oklch(0.6363 0.0133 286.02);
  }

  .mi-why-list em {
    font-style: normal;
    color: oklch(0.9707 0.0027 286.35);
  }

  .mi-why-list strong {
    font-weight: 700;
    color: oklch(0.9707 0.0027 286.35);
  }
</style>
