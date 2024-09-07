// File: app/api/create-workspace/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { createAppAuth } from '@octokit/auth-app';

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function POST(request: NextRequest) {
  const { repo_name } = await request.json();

  try {
    // Get the installation ID for the repository
    const [owner, repo] = repo_name.split('/');
    const installationResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/installation`, {
      headers: {
        Authorization: `Bearer ${await getJWT()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const installationId = installationResponse.data.id;

    // Get an installation access token
    const auth = createAppAuth({
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_PRIVATE_KEY,
      installationId,
    });

    const { token } = await auth({ type: "installation" });

    // Fetch repository details from GitHub
    const repoResponse = await axios.get(`https://api.github.com/repos/${repo_name}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const repoData = repoResponse.data;

    // Create a new workspace in your database
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        name: repoData.name,
        github_repo_id: repoData.id,
        github_repo_url: repoData.html_url,
        description: repoData.description,
        installation_id: installationId,
        // Add any other relevant fields
      });

    if (error) throw error;

    return NextResponse.json({ success: true, workspace: data });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ success: false, error: 'Failed to create workspace' }, { status: 500 });
  }
}

async function getJWT() {
  const auth = createAppAuth({
    appId: GITHUB_APP_ID,
    privateKey: GITHUB_PRIVATE_KEY,
  });

  const { token } = await auth({ type: "app" });
  return token;
}