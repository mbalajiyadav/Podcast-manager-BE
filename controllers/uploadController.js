const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');

// S3 Client Configuration (Lazy initialization to prevent crashes if env vars are missing)
let s3Client;
const getS3Client = () => {
    if (!s3Client) {
        if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
            throw new Error('S3 Credentials are missing. Please check your environment variables.');
        }
        s3Client = new S3Client({
            region: process.env.AWS_REGION || 'ap-southeast-2',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            }
        });
    }
    return s3Client;
};

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Generic function to upload a file to S3
 */
const uploadToS3 = async (file, folder) => {
    const client = getS3Client();
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await client.send(command);
    
    // Return the public URL (assuming bucket is public or using a CDN)
    return {
        key: key,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
};

// @desc    Upload Audio File (Direct)
// @route   POST /api/upload/audio
// @access  Host
const uploadAudio = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an audio file' });
    }

    try {
        console.log(`Attempting S3 upload for user ${req.user._id}...`);
        const folder = `audio/${req.user._id}`;
        const result = await uploadToS3(req.file, folder);
        console.log(`S3 upload successful: ${result.url}`);
        res.json(result);
    } catch (error) {
        console.error('S3 UPLOAD ERROR:', {
            message: error.message,
            code: error.code,
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_BUCKET_NAME
        });
        res.status(500).json({ 
            message: 'Failed to upload to S3', 
            error: error.message,
            tip: 'Check if your AWS credentials have s3:PutObject permission and the bucket name/region are correct.'
        });
    }
};

// @desc    Upload Image File (Direct)
// @route   POST /api/upload/image
// @access  Host
const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image file' });
    }

    const { type } = req.body; // 'channel' or 'episode'
    if (!type) {
        return res.status(400).json({ message: 'Type (channel or episode) is required' });
    }

    try {
        const folder = type === 'channel' ? 'covers/channels' : 'covers/episodes';
        const result = await uploadToS3(req.file, folder);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload Avatar (Direct)
// @route   POST /api/upload/avatar
// @access  All
const uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image file' });
    }

    try {
        const folder = `avatars/${req.user._id}`;
        const result = await uploadToS3(req.file, folder);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    upload, // Exporting multer instance to use in routes
    uploadAudio,
    uploadImage,
    uploadAvatar
};
