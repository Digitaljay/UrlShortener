const express = require("express");
const config = require("config");
const Url = require("../mongomodel/url");
const shortid = require("shortid");
const validUrl = require("valid-url");

var router = express.Router();

var router = express.Router();

router.get('/:shortenedUrl', async (req, res) => {
    var shortUrlCode = req.params.shortenedUrl;
    var url = await Url.findOne({ urlCode: shortUrlCode });

    try {
        if (url) {
            var clickCount = url.clickCount;
            clickCount++;
            await url.update({ clickCount });
            return res.redirect(url.longUrl);
        } else {
            return res.status(400).json("The short url doesn't exists in our system.");
        }
    }
    catch (err) {
        console.error("Error while retrieving long url for shorturlcode " + shortUrlCode);
        return res.status(500).json("There is some internal error.");
    }
})


router.post("/shorten", async (req, res)=>{
    const longUrl = req.body.urlToShorten;
    const baseUrl = config.get("baseURL");
    console.log("base url " + baseUrl + "   " + longUrl);
    if(!validUrl.isUri(baseUrl)){
        return res.status(401).json("Internal error. Please come back later.");
    }

    const urlCode = shortid.generate();

    if(validUrl.isUri(longUrl)){
        console.log("Succeed there");
        try{
            var url = await Url.findOne({longUrl : longUrl});
            console.log(url);
            if(url){
                return  res.status(200).json(url);
            }else{

                const shortenedUrl = baseUrl + "/" + urlCode;
                console.log("ShortenedUrl is "+shortenedUrl);
                url  = new Url({
                    longUrl,
                    shortenedUrl,
                    urlCode,
                    clickCount: 0
                });

                await url.save()
                return res.status(201).json({"status":"Created","shortenedUrl":shortenedUrl});
            }
        }catch(err){
            console.error(err.message);
            return res.status(500).json("Internal Server error " + err.message);
        }
    }else{
        res.status(400).json("Invalid URL. Please enter a vlaid url for shortening.");
    }
});

router.get('/:shortenedUrl/views', async (req, res) => {
    var shortUrlCode = req.params.shortenedUrl;
    var url = await Url.findOne({ urlCode: shortUrlCode });

    try {
        if (url) {
            res.send({
        		    'viewCount': url.clickCount
        	  })
        } else {
            return res.status(500).json("There is no such shorten link.");
        }
    }
    catch (err) {
        console.error("Error while retrieving long url for shorturlcode " + shortUrlCode);
        return res.status(500).json("There is some internal error.");
    }
})

module.exports = router
