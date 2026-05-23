const Cohort = require('../models/cohort');

// 1. CREATE COHORT
const createCohort = async (req, res) => {
    try {
        const { cohortname, year, graduationYear } = req.body;

        // Check if cohort already exists
        const existingCohort = await Cohort.findOne({ cohortname });
        if (existingCohort) {
            return res.status(400).json({ 
                message: `Validation Error: Cohort ${cohortname} already exists.` 
            });
        }

        const newCohort = new Cohort({
            cohortname,
            year: Number(year),
            graduationYear: new Date(graduationYear), // Explicitly cast to Date
            students: [] 
        });

        await newCohort.save();
        res.status(201).json(newCohort);
    } catch (error) {
        res.status(500).json({ message: "Failed to create cohort", error: error.message });
    }
};

// 2. GET ALL COHORTS
const getAllCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort.find().sort({ createdAt: -1 });

        // Map database fields to the property names expected by your frontend logic
        const formattedCohorts = cohorts.map(cohort => ({
            _id: cohort._id,
            name: cohort.cohortname, 
            year: cohort.year,
            graduationYear: cohort.graduationYear, 
            studentCount: cohort.students.length
        }));

        // Send the array directly so the frontend can use .forEach() immediately
        res.status(200).json(formattedCohorts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cohorts registry", error: error.message });
    }
};

// 3. GET SINGLE COHORT
const getSingleCohort = async (req, res) => {
    try {
        const cohort = await Cohort.findById(req.params.id).populate('students', 'name email role');
        
        if (!cohort) return res.status(404).json({ message: "Cohort not found." });

        res.status(200).json({
            _id: cohort._id,
            name: cohort.cohortname,
            year: cohort.year,
            graduationYear: cohort.graduationYear,
            students: cohort.students
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving cohort", error: error.message });
    }
};

// 4. DELETE COHORT
const deleteCohort = async (req, res) => {
    try {
        const cohort = await Cohort.findByIdAndDelete(req.params.id);
        if (!cohort) return res.status(404).json({ message: "Cohort not found." });
        res.status(200).json({ message: "Cohort successfully deleted." });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error: error.message });
    }
};

module.exports = { createCohort, getAllCohorts, getSingleCohort, deleteCohort };