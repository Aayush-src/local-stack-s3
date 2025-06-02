const express = require('express')
const app = express()
const port = 3000
const multer = require('multer')
const storage = multer.memoryStorage()
require('dotenv').config()
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, S3 } = require("@aws-sdk/client-s3");
const bucketname = process.env.BUCKET_NAME
const bucketregion = process.env.BUCKET_REGION
const accesskey = process.env.ACCESS_KEY_ID
const secretkey = process.env.SECRETACCESSKEY
app.use(express.json());
const upload = multer({ storage: storage }) // 
const client = new S3Client({

    region: bucketregion,
    endpoint: "http://localhost:4566",
    credentials: {
        accessKeyId: accesskey,
        secretAccessKey: secretkey
    },
    forcePathStyle: true
});

app.post('/posts', async (req, res) => {
    const name = req.body.name;
    console.log(name);
    const getObjectParams = {
        Bucket: bucketname,
        Key: name
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    res.send(url);
})
app.post('/', upload.single('image'), async (req, res) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketname,
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype

        })
        console.log(bucketname);
        await client.send(command);
        console.log(req.file);
        res.status(200).send("File sent successfully into the bucket");
    } catch (error) {
        console.log('error', error);
        res.send(error);

    }


})


app.listen(port, () => {
    console.log(`server is listening on the port named as ${port}`)
})