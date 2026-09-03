# dsh-tcp-forward

Forwards `0.0.0.0:3081` by default to the running DeepSeek Harness Web server and adds the LAN listener addresses to DSH `trustedHosts`.

```sh
dsh plugin --profile web add github:Ri0n72Y/dsh-tcp-forward
dsh web
```

Set `DSH_TCP_FORWARD_PORT` to use another port. The authenticated forward URL is printed at startup.
