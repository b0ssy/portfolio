import { BsLinkedin, BsGithub } from "react-icons/bs";

import Button from "../components/Button";

const LINKS = {
  email: "mailto:superbos88@hotmail.com",
  github: "https://github.com/b0ssy",
  linkedin: "https://www.linkedin.com/in/yong-sheng-chia-8b7008148",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-center h-screen">
        <div className="w-[640px] p-16">
          <p className="text text-6xl">
            <b>Yong Sheng.</b>
          </p>
          <div className="h-8" />
          <p className="text text-dim text-2xl">
            Hi! I'm a <b>full stack engineer</b> with strong passion in software
            development.
          </p>
          <div className="h-8" />
          <div className="flex flex-row items-center gap-4">
            <a href={LINKS.email} onClick={(e) => e.preventDefault()}>
              <Button
                title={LINKS.email}
                size="sm"
                onClick={() => {
                  window.location.href = LINKS.email;
                }}
              >
                Email Me
              </Button>
            </a>
            <div className="flex-grow" />
            <a href={LINKS.github} onClick={(e) => e.preventDefault()}>
              <BsGithub
                className="w-6 h-6 cursor-pointer"
                title={LINKS.github}
                onClick={() => {
                  window.open(LINKS.github);
                }}
              />
            </a>
            <a href={LINKS.linkedin} onClick={(e) => e.preventDefault()}>
              <BsLinkedin
                className="w-6 h-6 cursor-pointer"
                title={LINKS.linkedin}
                onClick={() => {
                  window.open(LINKS.linkedin);
                }}
              />
            </a>
          </div>
        </div>
      </div>

      {/* My tech stack */}
      <div className="flex flex-col items-center w-full p-4 bg-base-100 border-y-2">
        <div className="w-[640px] px-16">
          <p className="text text-2xl font-bold py-4">my.tech.stack("*");</p>
          <div className="flex flex-row gap-4 py-12">
            <pre className="flex-1">
              {JSON.stringify(
                {
                  frontends: {
                    web: ["react", "tailwindcss"],
                    mobile: [
                      "flutter",
                      "android_java",
                      "android_kotlin",
                      "ios_objc",
                      "ios_swift",
                    ],
                    desktop: ["qt"],
                  },
                },
                undefined,
                "  "
              )}
            </pre>
            <pre className="flex-1">
              {JSON.stringify(
                {
                  backends: ["nodejs", "python", "java", "c++"],
                  databases: [
                    "postgresql",
                    "dynamodb",
                    "mongodb",
                    "mysql",
                    "sqlite",
                  ],
                },
                undefined,
                "  "
              )}
            </pre>
            <pre className="flex-1">
              <code>
                {JSON.stringify(
                  {
                    aws: ["ec2", "dynamodb", "sqs", "ses", "s3"],
                    tools: [
                      "git",
                      "docker",
                      "docusaurus",
                      "cmake",
                      "opencv",
                      "kubernetes",
                    ],
                  },
                  undefined,
                  "  "
                )}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* My personal work */}
      <div className="flex flex-col items-center w-full p-4">
        <div className="w-[640px] px-16">
          <p className="text text-2xl text-end font-bold py-4">
            my.works("hobby");
          </p>
        </div>
      </div>
      <div className="h-96" />

      {/* Built with React + Vite */}
      <div className="flex flex-col items-center w-full p-4 bg-base-100">
        <div className="w-[640px] px-16">
          <p className="text text-sm text-center">
            Built with ❤️ using React + Tailwind CSS + Vite
          </p>
        </div>
      </div>
    </div>
  );
}
