import "./Skills.css";

export default function Skills() {
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

  return (
    <div className="skills-page">
      <div className="skills-grid">
        {skills.map((skill, i) => (
          <div
            key={skill.name}
            className={`skill-item${skill.mono ? " skill-item--mono" : ""}`}
            tabIndex={0}
            aria-label={skill.name}
          >
            <span className="skill-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            {skill.logo ? (
              <span
                className="skill-icon skill-icon--logo"
                style={{
                  WebkitMaskImage: `url(${skill.logo})`,
                  maskImage: `url(${skill.logo})`,
                }}
                aria-hidden="true"
              />
            ) : (
              <i
                className={`${skill.icon}${skill.mono ? "" : " colored"} skill-icon`}
                aria-hidden="true"
              />
            )}
            <span className="skill-name">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
