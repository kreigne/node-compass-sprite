var fs = require("fs"),
    path = require("path"),
    glob = require("glob"),
    sass = require("node-sass"),
    dot = require("dot"),
    spritesmith = require("spritesmith");


function spriteMap(a, kwargs, done){
    var argc = kwargs.getLength();
    for(var i = 0; i<argc; i++){
        var attr = kwargs.getValue(i);
        try {
            var unit = attr.getUnit();
        }catch(e){
            unit = null;
        }
        console.log(attr.getValue(), unit)
    }
    done(new sass.types.String("temp"));
}


function spriteMapName(uri, done){
    done(new sass.types.String("repeat_x"))
}

function spriteURL(map, done){
    console.log(map.getValue());
    done(new sass.types.String("url('http://google.com')"));
}

function spritePosition(kwargs, done){
    done(new sass.types.String("temp"));
}

function createSpritesheet(images, callback) {
    spritesmith({src: images}, function (error, result) {
        if(error !== null){
            callback(error, null, null);
            return;
        }
        // TODO: create filename with MD5 hash and import
        var filename = "something.png";
        fs.writeFile(filename, result.image, "binary", function(err) {
            callback(err, filename, result.coordinates);
        });
    });
}

function compassSpriteImporter(config, url, done){
    var imagesPath = path.join(config.imagesDir, url);
    glob(imagesPath, function(error, images){
        if(error !== null){
            done(error);
            return;
        }
        createSpritesheet(images, function(error, filename, coordinates){
            if(error !== null){
                done(error);
                return;
            }
            var templateContents = fs.readFileSync(path.join(__dirname, "sprite-template.scss"), "utf-8");
            var template = dot.template(templateContents);
            var spriteNames = {}, sprites = [];
            for(var i = 0; i<images.length; i++){
                var imageName = path.basename(images[i], path.extname(images[i]));
                spriteNames[imageName] = i;
                sprites.push(imageName);
            }
            var spriteName = path.basename(path.dirname(imagesPath));
            var data = {
                skipOverrides: false,
                spriteNames: spriteNames,
                sprites: sprites,
                name: spriteName,
                uri: filename
            };
            var fileContents = template(data).replace(/\0/g, "\n");
            fs.writeFileSync("test.scss", fileContents);
            done({file: filename, contents: fileContents});
        });
    });
}

function compassSpriteImporterWrapper(config){
    //TODO (gabriel-laet): define default config values
    var defaultConfig = {
        imagesDir: null,
        imagesPath: null,
        httpImagesPath: null,
        generatedImagesDir: null,
        generatedImagesPath: null,
        httpGeneratedImagesPath: null
    };

    var spritesConfig = config !== null ? {} : defaultConfig;
    if (spritesConfig !== defaultConfig) {
        for (var key in defaultConfig) {
            if (!defaultConfig.hasOwnProperty(key)) {
                continue;
            }
            spritesConfig[key] = config[key] || defaultConfig[key];
        }
    }

    return function(url, prev, done) {
        // TODO (glaet): should we look to prev too?
        if (!glob.hasMagic(url)){
            if (done !== null){
                done(null);
            }
            return sass.NULL;
        }
        try {
            compassSpriteImporter(spritesConfig, url, done);
        }catch(error){
            done(error);
        }
    };
}

module.exports.importer = compassSpriteImporterWrapper;
module.exports.functions = {
    'sprite-map($uri, ...)': spriteMap,
    'sprite-url($map)': spriteURL,
    'sprite-map-name($map)': spriteMapName,
    'sprite-position(...)': spritePosition
};
