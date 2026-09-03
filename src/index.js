import { connect, createServer } from 'node:net'
import { networkInterfaces } from 'node:os'

export const name = 'dsh-tcp-forward'
export const inject = ['webServer']

function lanAuthorities(port) {
  return Object.values(networkInterfaces()).flat()
    .filter(address => address?.family === 'IPv4' && !address.internal)
    .map(address => `${address.address}:${port}`)
}

export async function apply(ctx, { port = 3081 } = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new RangeError(`invalid TCP forward port: ${port}`)

  const trustedHosts = lanAuthorities(port)
  ctx.provide('tcpForward', { trustedHosts })

  await ctx.effect(async () => {
    const sockets = new Set()
    const server = createServer(client => {
      const upstream = connect(ctx.webServer.port, '127.0.0.1')
      sockets.add(client)
      sockets.add(upstream)
      client.once('close', () => sockets.delete(client))
      upstream.once('close', () => sockets.delete(upstream))
      client.once('error', () => upstream.destroy())
      upstream.once('error', () => client.destroy())
      client.pipe(upstream)
      upstream.pipe(client)
    })

    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, '0.0.0.0', () => {
        server.off('error', reject)
        server.on('error', console.error)
        resolve()
      })
    })

    return () => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve())
      for (const socket of sockets) socket.destroy()
    })
  }, 'dsh-tcp-forward')

  ctx.inject(['connection'], scope => {
    const printUrl = () => console.log(`[dsh-tcp-forward] now can access at ${scope.connection.authenticatedUrl(`http://127.0.0.1:${port}`)}`)
    const settled = scope.get('loader')?.await()
    if (settled === undefined) printUrl()
    else void settled.then(printUrl, () => {})
  })
}
