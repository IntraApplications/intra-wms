// File: app/api/github-app-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createAppAuth } from '@octokit/auth-app';

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
const GITHUB_PRIVATE_KEY = process.env.NEXT_PUBLIC_GITHUB_PRIVATE_KEY;

export async function POST(request: NextRequest) {
  const { installation_id } = await request.json();

  try {
    const auth = createAppAuth({
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_PRIVATE_KEY,
      installationId: installation_id,
    });

    const { token } = await auth({ type: "installation" });

    // Use the token to get the list of repositories
    const reposResponse = await axios.get('https://api.github.com/installation/repositories', {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return NextResponse.json({ success: true, repos: reposResponse.data.repositories });
  } catch (error) {
    console.error('Error during GitHub App callback:', error);
    return NextResponse.json({ success: false, error: 'Failed to process GitHub App installation' }, { status: 500 });
  }
}