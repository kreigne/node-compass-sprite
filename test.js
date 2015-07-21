var sass = require("node-sass"),
    fs = require("fs"),
    compassSprite = require("./lib"),
    path = require("path");

var fixturesPath = path.join(__dirname, "test/fixtures"),
    imagesDir = path.join(fixturesPath, "sprites"),
    compassMixinsPath = path.join(__dirname, "node_modules/compass-mixins/lib/");

sass.render({
    file: path.join(fixturesPath, "integration.scss"),
    importer: [compassSprite.importer({imagesDir: imagesDir})],
    functions: compassSprite.functions,
    includePaths: [compassMixinsPath]
}, function(err, result){
    if(err !== null){
        console.log(err);
        return;
    }
    console.log("wow very success");
    fs.writeFileSync("output.css", result.css);
});
