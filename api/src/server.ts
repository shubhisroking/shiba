import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/', async () => {
  return { message: 'Hello, world!' };
});

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await app.listen({ port, host });
    app.log.info(`Listening at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await app.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await app.close();
  process.exit(0);
});

start();
