/* eslint-disable no-console */
import http from 'http';
import httpProxy from 'http-proxy';

async function startProxy(): Promise<void> {
  const proxyPort = process.env.USER_AUTH_LOCAL_PROXY_PORT;
  const upstreamTarget = process.env.USER_AUTH_BASE_URL;

  if (!proxyPort || !upstreamTarget) {
    console.log(
      `Required environment variables to start the Proxy Server are not set.
Please ensure the '.env' file contains all entries defined in the '.env.template' file.`,
    );

    process.exit(1);
  }

  const proxy = httpProxy.createProxyServer();
  const server = http.createServer((req, res) => {
    proxy.web(
      req,
      res,
      {
        target: upstreamTarget,
        xfwd: true,
        changeOrigin: true,
      },
      (error) => {
        console.log({
          context: 'user-auth-proxy',
          message: 'An exception occurred while proxying.',
          details: error,
        });
      },
    );
  });

  server.on('listening', () => {
    console.log(
      `\n> user-auth-proxy running
      http://localhost:${proxyPort} -> ${upstreamTarget}`,
    );
  });

  server.listen(proxyPort);
}

startProxy();
