import { NextResponse } from 'next/server';

const GITHUB_APP_NAME = process.env.NEXT_PUBLIC_GITHUB_APP_NAME;

import { App } from "octokit";

export async function GET() {
  const installUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`
  return NextResponse.json({ installUrl });
}