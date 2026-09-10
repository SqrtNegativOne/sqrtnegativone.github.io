<script>
  const birthDate = new Date("2006-08-03");
  const msInYear = 1000 * 60 * 60 * 24 * 365.25;
  const age = ((Date.now() - birthDate.getTime()) / msInYear).toFixed(5);
</script>

<div class="text-column">
  <p>Hi!</p>

  <div class="bio">
    <p>
      My name is Ark Malhotra, aged {age}, and I am an
      undergrad B.Tech student in India pursuing Computer Science
      at Netaji Subhas University of Technology (NSUT)
      (formerly NSIT), 2024-2028.
    </p>
    <p>
      I have always found myself fascinated with computers and
      programming from when I started tinkering around with them.
      The joy of creation; deep within we all want to create
      something that is helpful, whether to us or to others.
      Add puzzle solving and constant learning to the mix and
      you have a frustrating yet addictive feedback loop that
      gratifies a very primeval longing in a very modern way.
    </p>
    <p>
      It is my lifelong goal to continue chasing that high of
      looking at a finished product, understanding fully the
      intricacies of the system (for you only created it) and
      feeling your brain be molded by it. So I continue to
      challenge myself in new ways, with new technologies,
      and new tools.
    </p>
    <p>
      I am fluent in intermediate Python, can work in advanced
      Python, and am familiar with the basics of data structures
      and algorithms in C, C++, and Python. I am currently learning machine
      learning, and practicing to perfect my knowledge of
      data structures and algorithms with C++.
    </p>
    <p>
      Other than programming itself, my hobbies include reading
      books, reading long-form essays on the web, and playing
      puzzle and story based games. I write things sometimes, but they aren't always good.
    </p>
  </div>
</div>

<style>
.bio {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.bio p {
  font-size: 1.1rem;
  line-height: 1.65;
  color: var(--text);
  font-weight: 400;
}

@media (max-width: 640px) {
  .bio p { font-size: 1rem; }
}
</style>
