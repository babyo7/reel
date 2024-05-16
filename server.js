const app = require("express")();
const cors = require("cors");
const stream = require("./stream");
const fileStream = require("./fileStream");
const cluster = require("node:cluster");
const os = require("os");
const totalCpu = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
} else {
  const PORT = process.env.PORT || 4000;
  app.use(cors());

  app.get("/", (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(404).json("url not provided");
    const download = req.query.file;
    try {
      if (download) {
        fileStream(res, url, download);
      } else {
        stream(res, url, req);
      }
    } catch (error) {
      res.status(500).json(error.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}
