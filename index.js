import { connect, createServer } from 'node:net'
import { networkInterfaces } from 'node:os'

export const name = 'dsh-tcp-forward'
export const inject = ['webServer']

const LISTEN_PORT = 3081

function lanAuthorities() {
  return Object.values(networkInterfaces()).flat()
    .filter(address => address?.family === 'IPv4' && !address.internal)
    .map(address => `${address.address}:${LISTEN_PORT}`)
}

export async function apply(ctx) {
  const trustedHosts = lanAuthorities()
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
      server.listen(LISTEN_PORT, '0.0.0.0', () => {
        server.off('error', reject)
        server.on('error', console.error)
        resolve()
      })
    })

    return () => {
      for (const socket of sockets) socket.destroy()
      return new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve())
      })
    }
  }, 'dsh-tcp-forward')

  ctx.inject(['connection'], scope => {
    for (const authority of trustedHosts) {
      console.log(`dsh tcp forward: ${scope.connection.authenticatedUrl(`http://${authority}`)}`)
    }
  })
}
