import { NextResponse } from 'next/server';
import { broadcastMessage } from '@/api/websocket/route';

export async function POST(request) {
  const body = await request.json();
  const event = request.headers.get('x-github-event');

  if (event === 'installation' && body.action === 'deleted') {
    const installationId = body.installation.id;
    console.log(`Integration deleted: ${installationId}`);

    broadcastMessage({
      type: 'github_webhook',
      event: 'integration_deleted',
      integration_id: installationId,
    });
  }

  return NextResponse.json({ status: 'Webhook processed' });
}