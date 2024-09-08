import { NextResponse } from 'next/server';
import { broadcastMessage } from '@/api/websocket/route';

// GitHub webhook handler
export async function POST(request) {

  const body = await request.json();
  console.log(body)
  const event = request.headers.get('x-github-event');
  console.log(event)

  if (event === 'installation' && body.action === 'deleted') {
    const integrationId = body.integration.id;
    console.log(`Integration deleted: ${integrationId}`);

    // Broadcast the event to WebSocket clients
    broadcastMessage({
      event: 'integration_deleted',
      integration_id: integrationId,
    });
  }

  return NextResponse.json({ status: 'Webhook processed' });
}
