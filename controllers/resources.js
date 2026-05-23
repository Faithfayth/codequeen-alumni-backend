const Resource = require('../models/resources');
const User = require('../models/users'); 
const cloudinary = require('../config/cloudinary'); 
const streamifier = require('streamifier');

// 1. ADD RESOURCE
const addResource = async (req, res) => {
    try {
        const { title, description, category, url } = req.body;

        const isAuthorizedAlumna = req.user && req.user.role === 'alumna';
        const isAuthorizedAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin === true);

        if (!isAuthorizedAlumna && !isAuthorizedAdmin) {
            return res.status(403).json({ 
                message: "Access Denied: Only Admins and Alumnae can add resources." 
            });
        }

        let finalUrl = url;
        let filePublicId = null;
        let isTypeFile = false;

        if (req.file && req.file.buffer && req.file.buffer.length > 0) {
            isTypeFile = true;
            
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
                return res.status(500).json({ 
                    message: "Error adding resource", 
                    error: "Cloudinary configuration variables are missing on the server environment." 
                });
            }

            const uploadPromise = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "codequeen_resources", resource_type: "raw" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await uploadPromise();
            finalUrl = result.secure_url;
            filePublicId = result.public_id;
        }

        if (!finalUrl && url) {
            finalUrl = url;
            isTypeFile = false;
        }

        if (!finalUrl) {
            return res.status(400).json({ message: "Please provide either a URL link or upload a file asset." });
        }

        const userId = req.user._id || req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication context identity tracking reference could not be resolved." });
        }

        const newResource = new Resource({
            title,
            description,
            url: finalUrl,
            category,
            addedBy: userId,
            filePublicId,
            isTypeFile
        });

        await newResource.save();
        return res.status(201).json({ message: "Resource shared successfully!", result: newResource });

    } catch (error) {
        console.error("SYSTEM TRACE - addResource Exception:", error);
        return res.status(500).json({ message: "Error adding resource", error: error.message });
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

        const currentUserId = (req.user._id || req.user.id)?.toString();
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;

        if (resource.addedBy.toString() !== currentUserId && !isAdmin) {
            return res.status(403).json({ message: "Access Denied: Unauthorized configuration modifications." });
        }

        const updatedResource = await Resource.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Updated successfully!", result: updatedResource });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. DELETE RESOURCE
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) return res.status(404).json({ message: "Resource not found." });

        const currentUserId = (req.user._id || req.user.id)?.toString();
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;

        if (resource.addedBy.toString() !== currentUserId && !isAdmin) {
            return res.status(403).json({ message: "Access Denied: Unauthorized erasure requests." });
        }

        if (resource.filePublicId) {
            await cloudinary.uploader.destroy(resource.filePublicId, { resource_type: 'raw' });
        }

        await Resource.findByIdAndDelete(id);

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