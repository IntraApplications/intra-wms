import { NextResponse } from 'next/server';

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID;

export async function GET() {
  const installUrl = `https://github.com/apps/${GITHUB_APP_ID}/installations/new`
  return NextResponse.json({ installUrl });
}