# dsh-tcp-forward

Exposes the DeepSeek Harness Web server to the local network through a transparent TCP forward on `0.0.0.0:3081` by default, and adds the LAN listener addresses to DSH `trustedHosts`.

```sh
dsh plugin --profile web add github:Ri0n72Y/dsh-tcp-forward
dsh web
```

Set `DSH_TCP_FORWARD_PORT` to use another port.
