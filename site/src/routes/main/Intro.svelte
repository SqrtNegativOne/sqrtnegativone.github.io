<!--
  The longer, data-filled version of this intro is preserved in
  IntroDynamic.svelte and is not imported. The helpers in $lib/deviceInfo.js
  and the /api/whereami endpoint remain dormant alongside it.
-->

<div class="intro-copy">
  <p class="hello">Hello!</p>

  <p>
    This is the website of a person named the <em>Square Root of Negative One</em>.
    Or, <em>I</em>, for short.
  </p>

  <p>You may approximate <em>I</em>'s nature through the following facts.</p>

  <ul>
    <li><em>I</em>'s pronouns are ambiguous. Use any!</li>
    <li>
      <em>I</em> considers itself unaffected by which it cannot affect. This remains
      to be proven.
    </li>
    <li>
      <em>I</em> has been accused of nearly every mental illness under the sun. May
      <em>I</em> implore you to consider a more exotic diagnosis, such as
      prosopagnosia, Cotard's syndrome, delusions of reference, Fregoli delusion, or
      schizoid personality disorder?
    </li>
    <li><em>I</em> is nobody's favourite person.</li>
    <li>
      <em>I</em> suffers from bouts of obsession and cyclicity of various interests.
      A "fandom nomad" if you will.
    </li>
    <li>
      <em>I</em> has been coding games and batch viruses on school computers and
      unremuneratively concerned with personal productivity systems. <em>I</em> also
      expresses an interest in writing and reading, and browsing the old web. But
      jacks of sufficiently large number of interests are masters of none, so
      <em>I</em> hopes you'll forgive it for being unable to prove competence in any
      of the above.
    </li>
  </ul>

  <p class="signoff">
    <em>I</em> does indeed hope you have a wonderful time here. Time is limited, and
    it is grateful for your choice of spending it here.
  </p>
</div>

<style>
  .intro-copy {
    display: flex;
    flex-direction: column;
    gap: 1.2em;
    font-family: "DotGothic16", "VT323", monospace;
    font-size: clamp(1.15rem, 0.4vw + 1rem, 1.4rem);
    line-height: 1.75;
    letter-spacing: 0.01em;
    color: var(--text);
    text-wrap: pretty;
  }

  .intro-copy p {
    margin: 0;
  }

  .hello {
    font-size: 1.4em;
    line-height: 1.3;
  }

  .intro-copy ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7em;
  }

  .intro-copy li {
    position: relative;
    padding-left: 1.5em;
  }

  .intro-copy li::before {
    content: "–";
    position: absolute;
    left: 0;
    color: var(--text-secondary);
  }

  .intro-copy em {
    font-style: italic;
  }
</style>
