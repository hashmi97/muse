import { config } from './config';
import { createApp } from './app';

const app = createApp();

const port = config.port;
const host = '127.0.0.1';

app.listen(port, host, () => {
  console.log(`[server] listening on http://${host}:${port}`);
});
