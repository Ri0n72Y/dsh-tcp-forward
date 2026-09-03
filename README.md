# dsh-tcp-forward

Forwards `0.0.0.0:3081` to the running DeepSeek Harness Web server and adds the LAN listener addresses to DSH `trustedHosts`.

```sh
dsh plugin --profile web add github:Ri0n72Y/dsh-tcp-forward
dsh web
```

Authenticated LAN URLs are printed at startup.

For Cloudflare Tunnel, point the tunnel at `http://127.0.0.1:3081` and trust the public hostname when starting DSH:

```sh
dsh web --trusted-host dsh.example.com
```
