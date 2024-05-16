const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");
const scdl = require("soundcloud-downloader").default;
module.exports = function stream(res, url, req) {
  client
    .getSongInfo(url)
    .then(async (song) => {
      const isfile = `music/${song.id}.mp3`;
      if (fs.existsSync(isfile)) {
        const data = fs.readFileSync(isfile);
        const range = req.headers.range;
        const totalSize = data.length;
        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

          const chunkSize = end - start + 1;
          const stream = fs.createReadStream(isfile, {
            start,
            end,
          });
          stream.pipe(res);
          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Content-Length": chunkSize,
            "Content-Type": "audio/mpeg",
            "Accept-Ranges": "bytes",
          });
        } else {
          res.status(403).send();
        }
      } else {
        const stream = await scdl.download(url);
        const writer = stream.pipe(fs.createWriteStream(isfile));
        writer.on("finish", () => {
          const data = fs.readFileSync(isfile);
          const range = req.headers.range;
          const totalSize = data.length;
          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

            const chunkSize = end - start + 1;
            const stream = fs.createReadStream(isfile, {
              start,
              end,
            });
            stream.pipe(res);
            res.writeHead(206, {
              "Content-Range": `bytes ${start}-${end}/${totalSize}`,
              "Content-Length": chunkSize,
              "Content-Type": "audio/mpeg",
              "Accept-Ranges": "bytes",
            });
          } else {
            res.status(403).send();
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
