<script>
  

  const posts = [
    {
      title: "Knives are scary.",
      date: "2025-01-18",
      description: "They are scary.",
      body: `
        <p>
          I have a confession to make; I have a minor phobia of knives.
        </p>
        <p>
          It&rsquo;s strange because I am not that afraid of guns in movies as much as
          I find swords or knives <del>or pencils</del> or other sharp weapons, even though guns are much deadlier.
        </p>
        <p>
          <del>
            It may be because I played too much Undertale and Omori, two of my
            favourite games, where the Knife does more damage than
            honest-to-god actual guns and both of their main characters can
            wield one sometime in the game but I digress
          </del>
        </p>
        <p>
          But you know what&rsquo;s even deadlier than knives, swords, guns,
          rocket launchers, tanks or UAVs?
        </p>
        <p>Thermonuclear fusion bombs.</p>
        <p>
          In March 1981, Roger Fisher, a Harvard Law professor specialising in
          conflict management and the director of Harvard&rsquo;s Program on
          Negotiation, wrote an article in the Bulletin of the Atomic
          Scientists that, in all seriousness, advocated a proposal of the
          mechanism of how the president should be able to operate the nuclear
          football.
        </p>
        <blockquote>
          <p>
            My suggestion was quite simple: Put that needed code number in a
            little capsule, and then implant that capsule right next to the
            heart of a volunteer. The volunteer would carry with him a big,
            heavy butcher knife as he accompanied the President. If ever the
            President wanted to fire nuclear weapons, the only way he could do
            so would be for him first, with his own hands, to kill one human
            being. The President says, &ldquo;George, I&rsquo;m sorry but tens
            of millions must die.&rdquo; He has to look at someone and realize
            what death is&mdash;what an innocent death is. Blood on the White
            House carpet. It&rsquo;s reality brought home.
          </p>
          <p>
            When I suggested this to friends in the Pentagon they said,
            &ldquo;My God, that&rsquo;s terrible. Having to kill someone would
            distort the President&rsquo;s judgment. He might never push the
            button.&rdquo;
          </p>
        </blockquote>
        <p>
          Sometimes, violence is inevitable. Maybe even necessary.
        </p>
        <p>But what it should never be, is easy.</p>
        <p>
          Knives don&rsquo;t shirk away from responsibility. They are close
          range. Both the weapon and its wielder must get the enemy&rsquo;s
          blood on them if they are to be used properly. You see your victim
          feel the pain and loss and watch them die.
        </p>
        <p>
          Guns don&rsquo;t have this aura as they aren&rsquo;t fully
          transparent about this process. No piece of media, no number of board
          meetings or conferences about the necessity of peace can really help
          fully describe what it feels like to see someone die, and even that
          image wouldn&rsquo;t render the full force of the true realisation of
          ending another consciousness, a cacophony of electric signals
          representing the cognizance of memories, wants, hopes, and dreams,
          coming to an indissoluble shutdown like a whirring generator losing
          its power, both body and viscera falling down like a ragdoll, a
          crimson pool leaking from under the ear, kissing the welt of your
          shoe.
        </p>
        <dl class="definition-box">
          <dt>sonder</dt>
          <dd class="pronunciation">(son&middot;der)</dd>
          <dd>
            The profound realisation that everyone, including strangers passing
            in the street, has a life as complex as one&rsquo;s own, which they
            are constantly living despite one&rsquo;s personal lack of
            awareness of it.
          </dd>
        </dl>
        <p>
          Guns are long range. They distance the killer from their victims.
          They make invisible the moral profundity and appear as instruments.
          Mere solutions to a tactical problem, not a moral one; allowing
          killing with cool, clinical efficiency and disinterest. A game.
        </p>
        <p>
          Knives necessitate the visibility of this moral transaction that guns
          conceal. The gun is shown to be the quotidian tool for both the Good
          and the Bad. The knife is the weapon of psychopaths or the desperate.
          Its usage means the wielder has consciously agreed to the moral
          transaction and bartered a piece of their soul to use it. They at
          least partially comprehend the reality about the infinite irreality
          they are about to plunge their victim into.
        </p>
        <p><strong>Knives are scary.</strong></p>
      `
    }
  ];

  let activePost = null;
</script>

{#if activePost !== null}
  <div class="text-column blog-view">
    <button class="blog-back" onclick={() => activePost = null}>
      &larr; Back
    </button>
    <article class="blog-post">
      <h2 class="blog-post-title">{posts[activePost].title}</h2>
      <time class="blog-post-date">{posts[activePost].date}</time>
      <div class="blog-post-body">{@html posts[activePost].body}</div>
    </article>
  </div>
{:else}
  <div class="text-column blog-view">
    <p class="section-intro">
      A tiny sliver of my writing which I have estimated to be socially
      acceptable.
    </p>
    <div class="blog-list">
      {#each posts as post, i (i)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <article
          class="blog-item"
          onclick={() => activePost = i}
        >
          <h3 class="blog-item-title">{post.title}</h3>
          <time class="blog-item-date">{post.date}</time>
          <p class="blog-item-desc">{post.description}</p>
        </article>
      {/each}
    </div>
  </div>
{/if}

<style>
/* ── Blog — list view ────────────────────────── */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-item {
  padding: 1rem 1.2rem;
  border: 1px solid oklch(1 0 0 / 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.25s, border-color 0.25s;
}

.blog-item:hover {
  background: oklch(0 0 0 / 0.03);
  border-color: oklch(0 0 0 / 0.12);
}

.blog-item:hover {
  background: oklch(1 0 0 / 0.04);
  border-color: oklch(1 0 0 / 0.15);
}

.blog-item-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.blog-item-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: block;
  margin-top: 0.25rem;
}

.blog-item-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.4rem;
}

/* ── Blog — post view ────────────────────────── */
.blog-back {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: inherit;
  padding: 0;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.blog-back:hover {
  color: var(--text);
}

.blog-post-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  margin: 0;
}

.blog-post-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: block;
  margin-top: 0.25rem;
}

.blog-post-body {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:global(.blog-post-body p) {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text);
}

:global(.blog-post-body del) {
  opacity: 0.5;
}

:global(.blog-post-body blockquote) {
  border-left: 2px solid var(--text-secondary);
  padding-left: 1.2rem;
  margin: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

:global(.blog-post-body blockquote p) {
  font-style: italic;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

:global(.blog-post-body strong) {
  font-weight: 700;
}

/* Definition box */
:global(.definition-box) {
  border: 1px solid oklch(1 0 0 / 0.12);
  border-radius: 6px;
  padding: 1rem 1.2rem;
  margin: 0.5rem 0;
}

:global(.definition-box dt) {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  font-style: italic;
}

:global(.definition-box .pronunciation) {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.15rem 0 0;
}

:global(.definition-box dd:last-child) {
  font-size: 0.85rem;
  color: var(--text);
  line-height: 1.6;
  margin: 0.5rem 0 0;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 640px) {
  .blog-post-title {
    font-size: 1.1rem;
  }

  :global(.blog-post-body p) {
    font-size: 0.85rem;
  }
}

</style>
