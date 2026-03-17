const app = require("./app");
const { initDb } = require("./db");

async function main() {
  await initDb();

  const host = "0.0.0.0";
  // If process.env.PORT is not set (local), we try 3000. 
  // If 3000 is taken, passing 0 to listen() will pick ANY available port.
  let portToTry = process.env.PORT || 3000;

  const startServer = (port) => {
    const server = app.listen(port, host, () => {
      const actualPort = server.address().port;
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${actualPort}`);
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE' && port !== 0) {
        // eslint-disable-next-line no-console
        console.log(`Port ${port} is already in use. Picking an available port...`);
        startServer(0); // 0 means "pick any available port"
      } else {
        // eslint-disable-next-line no-console
        console.error("Server error:", e);
      }
    });
  };

  startServer(portToTry);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
