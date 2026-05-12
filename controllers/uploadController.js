const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');

// S3 Client Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Generic function to upload a file to S3
 */
const uploadToS3 = async (file, folder) => {
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(command);
    
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
        const folder = `audio/${req.user._id}`;
        const result = await uploadToS3(req.file, folder);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
