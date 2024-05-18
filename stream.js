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
         const stream = fs.createReadStream(isfile);
        const data = fs.readFileSync(isfile);
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("content-length", data.length);
     
        return stream.pipe(res);
       
      } else {
        const stream = await scdl.download(url);
        const writer = stream.pipe(fs.createWriteStream(isfile));
        writer.on("finish", () => {
            const stream = fs.createReadStream(isfile);
        const data = fs.readFileSync(isfile);
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("content-length", data.length);
     
        return stream.pipe(res);
       
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
