var sass = require("node-sass"),
    compassSprite = require("../lib"),
    path = require("path");

var fixturesPath = path.join(__dirname, "fixtures"),
    imagesDir = path.join(fixturesPath, "sprites");

describe("debug", function() {
    it("should create a spritesheet", function () {
        sass.render({
            file: path.join(fixturesPath, "integration.scss"),
            importer: [compassSprite.importer({imagesDir: imagesDir})]
        }, function(err, result){
            console.log(err, result);
        })
    })
});

