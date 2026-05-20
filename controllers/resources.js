const Resource = require('../models/resources');
const User = require('../controllers/users');
const cloudinary = require('../config/cloudinary'); 
const streamifier = require('streamifier');

// 1. ADD RESOURCE (Supports Link OR File Upload)
const addResource = async (req, res) => {
    try {
        const { title, description, category, url } = req.body;

        // Role Authorization
        if (req.user.role !== 'admin' && req.user.role !== 'alumna') {
            return res.status(403).json({ message: "Access Denied: Only Admins and Alumnae can add resources." });
        }

        let finalUrl = url;
        let filePublicId = null;
        let isTypeFile = false;

        // If a file is being uploaded via Multer
        if (req.file) {
            isTypeFile = true;
            const uploadPromise = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "codequeen_resources", resource_type: "raw" },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await uploadPromise();
            finalUrl = result.secure_url;
            filePublicId = result.public_id;
        }

        if (!finalUrl) {
            return res.status(400).json({ message: "Please provide either a URL or upload a file." });
        }

        const newResource = new Resource({
            title,
            description,
            url: finalUrl,
            category,
            addedBy: req.user.id,
            filePublicId,
            isTypeFile
        });

        await newResource.save();
        res.status(201).json({ message: "Resource shared successfully!", result: newResource });
    } catch (error) {
        res.status(500).json({ message: "Error adding resource", error: error.message });
    }
};

// 2. FETCH ALL RESOURCES
const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find()
            .populate('addedBy', 'username role')
            .sort({ createdAt: -1 });

        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. UPDATE RESOURCE
const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) return res.status(404).json({ message: "Resource not found." });

        if (resource.addedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized." });
        }

        const updatedResource = await Resource.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Updated!", result: updatedResource });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. DELETE RESOURCE (Cleans up Cloudinary too)
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) return res.status(404).json({ message: "Resource not found." });

        if (resource.addedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized." });
        }

        // If it was a file, delete it from Cloudinary to save space
        if (resource.filePublicId) {
            await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
        }

        await Resource.findByIdAndDelete(id);

        // Notify Frontend
        const io = req.app.get('io');
        if (io) {
            io.emit('resource_deleted', { id, title: resource.title });
        }

        res.status(200).json({ message: "Deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addResource, getAllResources, updateResource, deleteResource };