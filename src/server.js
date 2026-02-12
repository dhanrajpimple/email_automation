const app = require("./app");
const { initDb } = require("./db");

const port = Number(process.env.PORT || 3000);

async function main() {
  await initDb();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
