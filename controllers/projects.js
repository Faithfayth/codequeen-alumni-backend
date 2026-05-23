const Project = require('../models/projects');

// 1. UPLOAD PROJECT (Admin or Alumna)
const uploadProject = async (req, res) => {
    try {
        const { title, owner, description, projectthumbnail, demolink, githubLink, participants } = req.body;

        // Validation logic: ensure at least one link exists
        if (!demolink && !githubLink) {
            return res.status(400).json({ message: "You must provide either a Demo link or a GitHub link." });
        }

        const newProject = new Project({
            title,
            owner,
            description,
            projectthumbnail,
            demolink,
            githubLink,
            participants, // This should be an array from the frontend
            submittedBy: req.user.id
        });

        await newProject.save();
        res.status(201).json({ message: "Project uploaded successfully!", project: newProject });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

// 2. FETCH ALL PROJECTS
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('submittedBy', 'username');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. SEARCH PROJECTS (By Title OR Participant Name)
const searchProjects = async (req, res) => {
    try {
        const { query } = req.query; // e.g., /projects/search?query=HealthApp

        const results = await Project.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },       // Case-insensitive title search
                { participants: { $regex: query, $options: 'i' } } // Case-insensitive participant search
            ]
        });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error: error.message });
    }
};

// 4. DELETE PROJECT (Admin Only)
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByIdAndDelete(id);
        if (!project) return res.status(404).json({ message: "Project not found." });

        res.status(200).json({ message: "Project deleted by administrator." });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

module.exports = {
    uploadProject,
    getAllProjects, //verified
    searchProjects,
    deleteProject
};
//get unverified
//verify project
//update