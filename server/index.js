const express = require('express');
const multer = require('multer');
const cors = require('cors');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors()); 

let csvData = [];

// Route to handle CSV file upload
app.post('/upload', upload.single('file'), (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            csvData = results;
            fs.unlinkSync(req.file.path);
            res.send('File uploaded and data saved.');
        });
});

// Route to handle CSV file download
app.get('/download', (req, res) => {
    console.log(csvData,"csvData")
    const fields = ['Email', 'Name', 'MobileNumber'];
    const opts = { fields };
    try {
        const parser = new Parser(opts);
        const csv = parser.parse(csvData);
        res.attachment('data.csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
