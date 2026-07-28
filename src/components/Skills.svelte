<script>
  import "./Skills.css";

  const skills = [
    { name: "C", icon: "devicon-c-plain" },
    { name: "C++", icon: "devicon-cplusplus-plain" },
    { name: "Python", icon: "devicon-python-plain" },
    { name: "CSS", icon: "devicon-css3-plain" },
    { name: "JavaScript", icon: "devicon-javascript-plain" },
    { name: "FastAPI", icon: "devicon-fastapi-plain" },
    { name: "LangChain", logo: "/logos/langchain.svg", mono: true },
    { name: "PydanticAI", logo: "/logos/pydantic.svg", mono: true },
    { name: "Figma", icon: "devicon-figma-plain" },
    { name: "Docker", icon: "devicon-docker-plain" },
    { name: "Git", icon: "devicon-git-plain" },
    { name: "Vim", icon: "devicon-vim-plain" },
    { name: "Pandas", icon: "devicon-pandas-plain", mono: true },
    { name: "Matplotlib", icon: "devicon-matplotlib-plain" },
    { name: "PyTorch", icon: "devicon-pytorch-plain" },
  ];
</script>

<div class="skills-page">
  <div class="skills-grid">
    {#each skills as skill, i}
      <div
        class="skill-item {skill.mono ? 'skill-item--mono' : ''}"
        tabindex="-1"
        aria-label={skill.name}
      >
        <span class="skill-index">
          {String(i + 1).padStart(2, "0")}
        </span>
        {#if skill.logo}
          <span
            class="skill-icon skill-icon--logo"
            style="-webkit-mask-image: url({skill.logo}); mask-image: url({skill.logo});"
            aria-hidden="true"
          ></span>
        {:else}
          <i
            class="{skill.icon} {skill.mono ? '' : 'colored'} skill-icon"
            aria-hidden="true"
          ></i>
        {/if}
        <span class="skill-name">{skill.name}</span>
      </div>
    {/each}
  </div>
</div>
