// frontend/server.js
const { createServer } = require("https");
const { parse }        = require("url");
const next             = require("next");
const fs               = require("fs");
const path             = require("path");

const dev  = process.env.NODE_ENV !== "production";
const app  = next({ dev });
const handle = app.getRequestHandler();

// Pfade zu deinen mkcert-Dateien
const certFile = path.join(__dirname, "localhost+2.pem");
const keyFile  = path.join(__dirname, "localhost+2-key.pem");

app.prepare().then(() => {
  createServer(
    {
      key : fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    },
    (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }
  ).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Server ready on https://localhost:3000");
  });
});
