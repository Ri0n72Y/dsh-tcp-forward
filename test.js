import assert from 'node:assert/strict'
import { once } from 'node:events'
import { connect, createServer } from 'node:net'
import test from 'node:test'
import { apply } from './src/index.js'

test('forwards TCP to the running DSH web port', async t => {
  const upstream = createServer(socket => socket.pipe(socket))
  upstream.listen(0, '127.0.0.1')
  await once(upstream, 'listening')
  const address = upstream.address()
  assert(address && typeof address !== 'string')

  let cleanup
  const ctx = {
    webServer: { port: address.port },
    provide() {},
    async effect(setup) { cleanup = await setup() },
    inject() {},
  }

  t.after(async () => {
    await cleanup?.()
    await new Promise(resolve => upstream.close(resolve))
  })

  await apply(ctx, { port: 3082 })
  const client = connect(3082, '127.0.0.1')
  await once(client, 'connect')
  client.write('ping')
  const [data] = await once(client, 'data')
  assert.equal(data.toString(), 'ping')
  client.destroy()
})

test('rejects invalid ports', async () => {
  await assert.rejects(() => apply({}, { port: 0 }), /invalid TCP forward port/)
})
