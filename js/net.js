// Transport. Supabase Realtime Broadcast in production; BroadcastChannel in ?local practice mode
// (open several tabs of the same browser to play against yourself).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

export const LOCAL = new URLSearchParams(location.search).has('local');

export async function connect(room, onMsg, onStatus) {
  if (LOCAL) {
    const bc = new BroadcastChannel('kq-' + room);
    bc.onmessage = e => onMsg(e.data);
    setTimeout(() => onStatus('ok'), 0);
    return { send: m => bc.postMessage(m), close: () => bc.close() };
  }
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { eventsPerSecond: 20 } } });
  const ch = sb.channel('kq-' + room, { config: { broadcast: { self: false, ack: false } } });
  ch.on('broadcast', { event: 'm' }, ({ payload }) => onMsg(payload));
  await new Promise(res => ch.subscribe(st => {
    if (st === 'SUBSCRIBED') { onStatus('ok'); res(); }
    else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' || st === 'CLOSED') onStatus('bad');
  }));
  return { send: m => ch.send({ type: 'broadcast', event: 'm', payload: m }), close: () => sb.removeChannel(ch) };
}
