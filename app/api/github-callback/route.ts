// File: app/api/github-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installation_id = searchParams.get('installation_id');
  const setup_action = searchParams.get('setup_action');

  console.log("TESTTT")

  if (installation_id && setup_action === 'install') {
    // Return an HTML page that will communicate with the opener and then close itself
    return new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'github-install-success', installation_id: '${installation_id}' }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Handle other cases or errors
  return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });
}
