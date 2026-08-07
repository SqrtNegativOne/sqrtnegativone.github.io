export interface Skill {
  name: string;
  icon?: string;
  logo?: string;
  mono?: boolean;
}

export const skills: Skill[] = [
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
