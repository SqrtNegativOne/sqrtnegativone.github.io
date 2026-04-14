import { useState } from "react";
import "./Blog.css";

const posts = [
  {
    title: "Knives are scary.",
    date: "2025-01-18",
    description: "They are scary.",
    body: (
      <>
        <p>
          I have a confession to make; I have a minor phobia of knives.
        </p>
        <p>
          It&rsquo;s strange because I am not that afraid of guns in movies as much as
          I find swords or knives{" "}
          <del>or pencils</del>{" "}
          or other sharp weapons, even though guns are much deadlier.
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
        <dl className="definition-box">
          <dt>sonder</dt>
          <dd className="pronunciation">(son&middot;der)</dd>
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
      </>
    ),
  },
];

export default function Blog() {
  const [activePost, setActivePost] = useState(null);

  if (activePost !== null) {
    const post = posts[activePost];
    return (
      <div className="text-column blog-view">
        <button className="blog-back" onClick={() => setActivePost(null)}>
          &larr; Back
        </button>
        <article className="blog-post">
          <h2 className="blog-post-title">{post.title}</h2>
          <time className="blog-post-date">{post.date}</time>
          <div className="blog-post-body">{post.body}</div>
        </article>
      </div>
    );
  }

  return (
    <div className="text-column blog-view">
      <p className="section-intro">
        A tiny sliver of my writing which I have estimated to be socially
        acceptable.
      </p>
      <div className="blog-list">
        {posts.map((post, i) => (
          <article
            key={i}
            className="blog-item"
            onClick={() => setActivePost(i)}
          >
            <h3 className="blog-item-title">{post.title}</h3>
            <time className="blog-item-date">{post.date}</time>
            <p className="blog-item-desc">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
