const ytdl = require('ytdl-core');
const express = require('express');
const fs = require('fs');

const ytVideo = `https://www.youtube.com/watch?v=XITHbsUUlYI`;
// const ytVideo = `https://youtu.be/UjjyxUHTeis?t=32`;

const app = express();
const filters = ['videoonly', 'videoandaudio', 'audioonly'];

// app.get("/", (req, res) => {
//   res.set('Access-Control-Allow-Origin', '*');
//
//   let stream = ytdl(ytVideo, {
//     // filter: format => format.container === 'mp4'
//   });
//   stream.on('info', (info, format) => {
//     // console.log(JSON.stringify(format, null, 2));
//   });
//   stream.on('error', err => {
//     console.log("/ error stream", err);
//     res.status(500).end();
//   }).pipe(res);
// });

app.get("/", (req, res) => {

  const stream = fs.createReadStream('bunny.webm');
  stream.on('error', err => {
    console.log("/ error stream", err);
    res.status(500).end();
  }).pipe(res);
  
});

app.listen(3001);

