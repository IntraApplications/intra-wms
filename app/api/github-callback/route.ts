// app/api/github-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { githubApp } from '@/_lib/github';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client using the service role key (only do this on the server)
const supabaseServerClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Service role key (server-side only)
); 


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installation_id = searchParams.get('installation_id');
  const setup_action = searchParams.get('setup_action');

  if (installation_id && setup_action === 'install') {
    try {
      const octokit = await githubApp.getInstallationOctokit(Number(installation_id));
      
      // Fetch the installation details
      const { data: installationData } = await octokit.rest.apps.getInstallation({
        installation_id: Number(installation_id)
      });

      // Update the organization in the database
      const { data, error } = await supabaseServerClient
        .from('organizations')
        .update({
          github_app_installation_id: installation_id,
          github_org_name: installationData?.account?.login,
          github_org_id: installationData?.account?.id
        })
        .eq('name', "pingl")
        .select();


      if (error) {
        throw error;
      }

      // Return an HTML page that will communicate with the opener and then close itself
      return new NextResponse(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'github-installation-success',
                  installationId: '${installation_id}',
                  orgName: '${installationData?.account?.name}'
                }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    } catch (error) {
      console.error('Error processing GitHub callback:', error);
      return NextResponse.json({ error: 'Failed to process GitHub installation' }, { status: 500 });
    }
  }

  // Handle other cases or errors
  return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });
}