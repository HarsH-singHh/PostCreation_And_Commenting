var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
  
var fs = require('fs');
var path = require('path');

mongoose.connect('mongodb://localhost:27017/imagesInMongoApp',
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static("public"));

// Set EJS as templating engine 
app.set("view engine", "ejs");

var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
var upload = multer({ storage: storage });

var imgModel = require('./models/Image');

app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});

app.post('/upload', upload.single('image'), async (req, res, next) => {
  
    var obj = {
        name: req.body.name,
        filename: req.file.filename,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }

    imgModel.create(obj, async (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            await item.save();
            res.redirect('/');
        }
    });
});

app.listen(3001, err => {
    if (err)
        throw err
    console.log('Server listening on port 3001')
})