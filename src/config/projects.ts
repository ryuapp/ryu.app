type Project = {
  name: string;
  description: string;
  link: string;
};

export const projects = [
  {
    name: "js-semver",
    description: "A node-semver compliant Rust crate.",
    link: "https://github.com/ryuapp/js-semver",
  },
  {
    name: "pindeps",
    description: "A CLI tool to pin dependency versions in JavaScript.",
    link: "https://github.com/ryuapp/pindeps",
  },
  {
    name: "rb",
    description: "A rm(1) clone with the recycle bin for Windows.",
    link: "https://github.com/ryuapp/rb",
  },
  {
    name: "Fluent Emoji Picker",
    description: "A Web app to easily copy Fluent Emoji.",
    link: "https://fluentemoji.ryu.app",
  },
] satisfies Project[];
