<script>
  import ThomasAttractor from '../components/ThomasAttractor.svelte';
  import SocialIcons from './SocialIcons.svelte';
  import Seo from '../lib/components/Seo.svelte';

  // Referenced from the JSON-LD script tag below
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ark Malhotra',
    url: 'https://sqrt.fyi',
    jobTitle: 'Undergraduate Student',
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Netaji Subhas University of Technology'
    },
    knowsAbout: ['Computer Science', 'Python', 'C++', 'Machine Learning']
  };
  const personSchemaHtml = `<script type="application/ld+json">${JSON.stringify(personSchema)}</` + `script>`;
</script>

<Seo title="Ark Malhotra" description="Personal site of Ark Malhotra, computer science undergrad at NSUT." path="/" />

<svelte:head>
  {@html personSchemaHtml}
</svelte:head>

<ThomasAttractor />
<SocialIcons />
