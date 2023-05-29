import { BsLinkedin, BsGithub } from "react-icons/bs";

import Button from "../components/Button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-24 mx-auto">
      {/* Header */}
      <div className="w-[640px] p-16">
        <p className="text text-4xl">
          <b>Yong Sheng.</b>
        </p>
        <div className="h-4" />
        <p className="text text-dim text-xl">
          Hi! I'm a <b>full stack engineer</b> with strong passion in software
          development.
        </p>
        <div className="h-8" />
        <div className="flex flex-row items-center gap-3">
          <Button
            size="sm"
            onClick={() => {
              window.location.href = "mailto:superbos88@hotmail.com";
            }}
          >
            Email Me
          </Button>
          <div className="flex-grow" />
          <BsGithub
            className="w-6 h-6 cursor-pointer"
            title="https://github.com/b0ssy"
            onClick={() => {
              window.open("https://github.com/b0ssy");
            }}
          />
          <BsLinkedin
            className="w-6 h-6 cursor-pointer"
            title="https://www.linkedin.com/in/yong-sheng-chia-8b7008148"
            onClick={() => {
              window.open(
                "https://www.linkedin.com/in/yong-sheng-chia-8b7008148"
              );
            }}
          />
        </div>
      </div>

      {/* My tech stack */}
      <div className="flex flex-col items-center w-full p-4 bg-base-100 border-y-2">
        <div className="w-[640px] px-16">
          <p className="text text-2xl font-bold mb-4">{"</>"} My tech stack</p>
          <div className="flex flex-row gap-4">
            <pre className="flex-1">
              <code>
                {JSON.stringify(
                  {
                    frontends: {
                      web: ["react", "tailwindcss", "mui"],
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
              </code>
            </pre>
            <pre className="flex-1">
              <code>
                {JSON.stringify(
                  {
                    backends: ["nodejs", "python", "java", "c++"],
                    databases: ["postgresql", "dynamodb", "mongodb", "mysql"],
                  },
                  undefined,
                  "  "
                )}
              </code>
            </pre>
            <pre className="flex-1">
              <code>
                {JSON.stringify(
                  {
                    aws: ["dynamodb", "sqs", "ses"],
                    tools: ["git", "docker", "cmake", "opencv", "kubernetes"],
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
      <div className="h-8" />
      <div className="flex flex-col items-center w-full p-4">
        <div className="w-[640px] px-16">
          <p className="text text-2xl text-end font-bold mb-4">
            My personal work {"</>"}
          </p>
        </div>
      </div>
      <div className="h-96" />

      {/* Built with React + Vite */}
      <div className="flex flex-col items-center w-full p-4 bg-base-100">
        <div className="w-[640px] px-16">
          <p className="text text-sm text-center">
            Built with ❤️ using React + Vite
          </p>
        </div>
      </div>
    </div>
  );
}
