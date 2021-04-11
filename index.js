var url = "https://www.pinterest.com/pin/";
const { default: axios } = require("axios");
const cors = require("cors");
const streams = require("stream");
// var fs = require("fs");
const cheerio = require("cheerio");
var request = require("request");
const express = require("express");
const app = express();
var { tall } = require("tall");

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors({}));

app.get("/pin/", cors(), (req, res) => {
  const id = req.headers.id;
  console.log(id);
  try {
    if (id != undefined && id != null && id != "") {
      return scrapeVideo(id)
        .then((data) => {
          console.log(data);
          if (data != "") {
            if (data != undefined) {
              return res.status(200).json(data);
            } else {
              res.status(404).json("Instagram Server Error");
            }
          } else {
            res.status(404).json("Url is Incorrect or insta id doesn`t exist");
          }
        })
        .catch((err) => {
          res.status(404).json(err);
        });
    } else {
      return res.status(404).json("Please Enter Valid Url");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});

async function scrapeVideo(id) {
  try {
    return axios
      .get(url + id)
      .then((html) => {
        const $ = cheerio.load(html.data);
        // var urls = expandUrl("https://pin.it/2jnYfnT");
        const videoString = $("#initial-state");
        // console.log(videoString[0].children[0].data);
        // fs.writeFileSync("jsomss.json", videoString[0].children[0].data);
        // console.log(
        //   JSON.parse(videoString[0].children[0].data).resourceResponses[0]
        //     .response.data
        // );
        const video = JSON.parse(videoString[0].children[0].data)
          .resourceResponses[0].response.data?.videos?.video_list?.V_720P;
        const image = JSON.parse(videoString[0].children[0].data)
          .resourceResponses[0].response.data?.images.orig;

        if (video != null && image != null) {
          return {
            image,
            video,
          };
        } else if (image != null) {
          return {
            image,
          };
        } else {
          return null;
        }
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
    // console.log(html.data);
    // fs.writeFileSync("foo.txt", html.data);
  } catch (error) {
    return error.message;
  }
}
app.get("/expandurl/", async (req, res) => {
  const url = req.headers.url;
  console.log(url);
  try {
    if (url != undefined && url != null && url != "") {
      const realUrl = await tall(url);
      console.log(realUrl);
      if (realUrl != "") {
        if (realUrl != undefined) {
          return res.status(200).json(realUrl);
        } else {
          res.status(404).json("Some Server Error");
        }
      } else {
        res.status(404).json("Url is Incorrect or insta id doesn`t exist");
      }
    } else {
      return res.status(404).json("Please Enter Valid Url");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});
app.get("/download/:slug", async (req, res) => {
    const url = decodeURIComponent(req.query.url)
  console.log(url);
  try {
    if (url != undefined && url != null && url != "") {
      axios({
        url: url,
        method: "GET",
        responseType: "stream", // important
      })
        .then(function (response) {
          let contentType = response.headers["content-type"];
          let contentLength = response.headers["content-length"];
          var writer = new streams.Writable();
          console.log(res);
          response.data.pipe(res);
          // ....
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return res.status(404).json("Please Enter Valid Url");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});

function expandUrl(shortUrl) {
  var finalUri;
  request(
    { method: "HEAD", url: shortUrl, followAllRedirects: true },
    function (error, response) {
      console.log(response.request.href);
      finalUri = response.request.href;
    }
  );
  return Promise.resolve(finalUri);
}
app.listen("8080", () => console.log(`Example app listening on port port!`));
