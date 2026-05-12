const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// @desc    Get pre-signed S3 URL for audio upload
// @route   POST /api/upload/audio-presign
// @access  Host
const getAudioPresign = async (req, res) => {
    const { fileName, fileType } = req.body;
    const key = `audio/${req.user._id}/${Date.now()}-${fileName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.json({ url, key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pre-signed S3 URL for cover/thumbnail upload
// @route   POST /api/upload/image-presign
// @access  Host
const getImagePresign = async (req, res) => {
    const { fileName, fileType, type } = req.body; // type: 'channel' or 'episode'
    const folder = type === 'channel' ? 'covers/channels' : 'covers/episodes';
    const key = `${folder}/${Date.now()}-${fileName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.json({ url, key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pre-signed S3 URL for profile avatar upload
// @route   POST /api/upload/avatar-presign
// @access  All
const getAvatarPresign = async (req, res) => {
    const { fileName, fileType } = req.body;
    const key = `avatars/${req.user._id}/${Date.now()}-${fileName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        res.json({ url, key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAudioPresign,
    getImagePresign,
    getAvatarPresign
};
