/**
 * One-off: copy every collection from the old Atlas cluster to a new one.
 *
 *   MONGO_URI      - source, read from .env (the cluster you're leaving)
 *   NEW_MONGO_URI  - target, read from .env (the company cluster)
 *
 * Run:  node migrate-db.js          (aborts if the target already has data)
 *       node migrate-db.js --force  (wipes matching target collections first)
 *
 * Safe to delete once the move is done.
 */
const dns = require("dns");
if (dns.getServers().every((s) => s === "127.0.0.1" || s === "::1")) dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const { MongoClient } = require("mongodb");

const SOURCE = process.env.MONGO_URI;
const TARGET = process.env.NEW_MONGO_URI;
const force = process.argv.includes("--force");

if (!SOURCE || !TARGET) {
  console.error("Need both MONGO_URI and NEW_MONGO_URI in server/.env");
  process.exit(1);
}
if (SOURCE === TARGET) {
  console.error("MONGO_URI and NEW_MONGO_URI are identical - nothing to do");
  process.exit(1);
}

(async () => {
  const src = new MongoClient(SOURCE);
  const dst = new MongoClient(TARGET);
  try {
    await src.connect();
    await dst.connect();
    const from = src.db();
    const to = dst.db();
    console.log(`source: ${from.databaseName}  ->  target: ${to.databaseName}\n`);

    const cols = (await from.listCollections().toArray()).filter((c) => c.type !== "view");

    // Refuse to merge into a populated target unless explicitly forced - a silent
    // merge would leave duplicate users and a broken allocation state.
    if (!force) {
      for (const c of cols) {
        const existing = await to.collection(c.name).countDocuments();
        if (existing > 0) {
          console.error(`Target already has ${existing} docs in "${c.name}".`);
          console.error("Re-run with --force to overwrite, or point at an empty database.");
          process.exit(1);
        }
      }
    }

    for (const c of cols) {
      const docs = await from.collection(c.name).find({}).toArray();
      if (force) await to.collection(c.name).deleteMany({});
      if (docs.length) await to.collection(c.name).insertMany(docs);
      console.log(`  ${c.name}: copied ${docs.length}`);
    }

    // Indexes carry the unique constraints (e.g. users.email) - without them the
    // new cluster would happily accept duplicate registrations.
    console.log("\nindexes:");
    for (const c of cols) {
      const idx = await from.collection(c.name).indexes();
      for (const i of idx) {
        if (i.name === "_id_") continue;
        const { key, name, v, ns, ...opts } = i;
        try {
          await to.collection(c.name).createIndex(key, { name, ...opts });
          console.log(`  ${c.name}.${name}`);
        } catch (e) {
          console.log(`  ${c.name}.${name} - SKIPPED (${e.message})`);
        }
      }
    }

    console.log("\nverify:");
    let ok = true;
    for (const c of cols) {
      const a = await from.collection(c.name).countDocuments();
      const b = await to.collection(c.name).countDocuments();
      if (a !== b) ok = false;
      console.log(`  ${c.name}: source ${a} / target ${b} ${a === b ? "OK" : "MISMATCH"}`);
    }
    console.log(ok ? "\nMigration complete." : "\nMigration finished with mismatches - check above.");
    process.exitCode = ok ? 0 : 1;
  } finally {
    await src.close().catch(() => {});
    await dst.close().catch(() => {});
  }
})();
