import { App } from "octokit";

const githubApp = new App({
    appId: process.env.NEXT_PUBLIC_GITHUB_APP_ID!,
    privateKey: process.env.NEXT_PUBLIC_GITHUB_APP_PRIVATE_KEY!,
  });

export  {githubApp}