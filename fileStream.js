const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");

module.exports = function fileStream(res, url, File) {
  client
    .getSongInfo(url)
    .then(async (song) => {
      const isfile = `music/${song.id}.mp3`;
      if (fs.existsSync(isfile)) {
        const stream = fs.createReadStream(isfile);
        const data = fs.readFileSync(isfile);
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("content-length", data.length);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${File}.mp3"`
        );
        return stream.pipe(res);
      } else {
        const stream = await song.downloadProgressive();
        const writer = stream.pipe(fs.createWriteStream(isfile));
        writer.on("finish", async () => {
          const stream = fs.createReadStream(isfile);
          const data = fs.readFileSync(isfile);
          if (data.length > 0) {
            res.setHeader("content-type", "audio/mpeg");
            res.setHeader("Accept-Ranges", "bytes");
            res.setHeader("content-length", data.length);
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${File}.mp3"`
            );
            stream.pipe(res);
          } else {
            fs.unlinkSync(isfile);
            const stream = await song.downloadHLS();
            const writer = stream.pipe(fs.createWriteStream(isfile));
            writer.on("finish", () => {
              const stream = fs.createReadStream(isfile);
              const data = fs.readFileSync(isfile);
              res.setHeader("content-type", "audio/mpeg");
              res.setHeader("Accept-Ranges", "bytes");
              res.setHeader("content-length", data.length);
              res.setHeader(
                "Content-Disposition",
                `attachment; filename="${File}.mp3"`
              );
              stream.pipe(res);
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
