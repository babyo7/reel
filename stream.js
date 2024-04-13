const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const fs = require("fs");

module.exports = function stream(res, url) {
  client.getSongInfo(url).then(async (song) => {
    const isfile = `music/${song.id}.mp3`;
    if (fs.existsSync(isfile)) {
      const stream = fs.createReadStream(isfile);
      const data = fs.readFileSync(isfile);
      res.setHeader("content-type", "audio/mpeg");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("content-length", data.length);
      console.log(url);
      return stream.pipe(res);
    } else {
      const stream = await song.downloadProgressive();
      const writer = stream.pipe(fs.createWriteStream(isfile));
      writer.on("finish", () => {
        const stream = fs.createReadStream(isfile);
        const data = fs.readFileSync(isfile);
        res.setHeader("content-type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("content-length", data.length);
        console.log(url);
        stream.pipe(res);
      });
    }
  });
};