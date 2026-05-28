const Gallery = require('../models/gallery');
const cloudinary = require('../config/cloudinary');

// 1. ADD IMAGE TO GALLERY (Admin and Alumna Only)
const addImage = async (req, res) => {
    try {
        const { caption, keywords, category } = req.body;

        // Verify if a raw file payload was intercepted by the upload pipeline middleware
        if (!req.file) {
            return res.status(400).json({ message: "Bad Request: No raw image file uploaded." });
        }

        // Convert memory storage buffer directly into a format Cloudinary understands
        const fileBase64 = req.file.buffer.toString('base64');
        const fileUri = `data:${req.file.mimetype};base64,${fileBase64}`;

        // Stream raw data URI straight up to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(fileUri, {
            folder: 'codequeen_gallery'
        });

        // Parse explicit string arrays if keywords come in as a comma-separated string from form-data
        let computedKeywords = [];
        if (keywords) {
            computedKeywords = Array.isArray(keywords) 
                ? keywords 
                : keywords.split(',').map(kw => kw.trim());
        }

        const newImage = new Gallery({
            imageUrl: cloudinaryResponse.secure_url, // Extracted from cloud instance response
            caption,
            keywords: computedKeywords,
            category,
            uploadedBy: req.user.id // Captured securely from the decoded auth token
        });

        await newImage.save();

        // Optional Live Megaphone: Flash new photos instantly onto the UI gallery grid
        const io = req.app.get('io');
        if (io) {
            io.emit('new_gallery_image', newImage);
        }

        res.status(201).json({ message: "Image successfully added to the community gallery!", result: newImage });
    } catch (error) {
        res.status(500).json({ message: "Failed to upload image asset", error: error.message });
    }
};

// 2. FETCH ALL GALLERY IMAGES (Admin and Alumna Only)
const getAllImages = async (req, res) => {
    try {
        // Sort by newest uploads first so the gallery grid looks active and fresh
        const images = await Gallery.find()
            .populate('uploadedBy', 'username role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: images.length,
            result: images
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load gallery stream", error: error.message });
    }
};

// 3. SECURE DELETE IMAGE (Admin can delete ANY, Alumna can only delete THEIR OWN)
const deleteImage = async (req, res) => {
    try {
        const imageId = req.params.id;
        const targetImage = await Gallery.findById(imageId);

        if (!targetImage) {
            return res.status(404).json({ message: "Target gallery asset not found." });
        }

        // 🔥 THE SECURITY GATEWAY INTERCEPTOR 🔥
        if (!req.user.isAdmin && targetImage.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                message: "Access Denied: Alumnae are strictly restricted to removing their own media submissions only." 
            });
        }

        // Optional Clean up Step: If you ever want to destroy the image from Cloudinary workspace 
        // during asset removal, you would parse the publicId from the stored secure_url and call:
        // await cloudinary.uploader.destroy(publicId);

        await Gallery.findByIdAndDelete(imageId);

        // Notify client-side interfaces to remove the image card from view right away
        const io = req.app.get('io');
        if (io) {
            io.emit('gallery_image_removed', imageId);
        }

        res.status(200).json({ message: "Media element permanently removed from gallery indexes." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete gallery asset", error: error.message });
    }
};

const updateImageMetadata = async (req, res) => {
    try {
        const imageId = req.params.id;
        const { caption, keywords, category, imageUrl } = req.body;

        // 1. Locate the existing gallery asset card first
        const targetImage = await Gallery.findById(imageId);
        if (!targetImage) {
            return res.status(404).json({ message: "Target gallery asset not found." });
        }

        // 2. 🔥 THE SECURITY GATEWAY INTERCEPTOR 🔥
        if (!req.user.isAdmin && targetImage.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                message: "Access Denied: You do not possess structural permissions to alter this gallery record." 
            });
        }

        // 3. Build the clean update payload
        const updateData = {
            caption,
            category,
            keywords: keywords ? (Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim())) : targetImage.keywords
        };

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        // 4. Execute the update query transaction safely
        const updatedImage = await Gallery.findByIdAndUpdate(
            imageId,
            updateData,
            { returnDocument: 'after' } // Modern, warning-free Mongoose configuration parameter
        ).populate('uploadedBy', 'username role');

        // 5. Notify client-side interfaces to refresh the updated picture card live
        const io = req.app.get('io');
        if (io) {
            io.emit('gallery_image_updated', updatedImage);
        }

        res.status(200).json({ 
            message: "Gallery asset metadata successfully updated!", 
            result: updatedImage 
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to update gallery asset", error: error.message });
    }
};

module.exports = {
    addImage,
    getAllImages,
    deleteImage,
    updateImageMetadata
};