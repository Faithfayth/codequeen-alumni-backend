const Cohort = require('../models/cohort');

// 1. CREATE A COHORT (Admin Only)
const createCohort = async (req, res) => {
    try {
        const { cohortname, year, graduationYear } = req.body;

        // Validation Check: Ensure an admin doesn't create a duplicate cohort number
        const existingCohort = await Cohort.findOne({ cohortname: Number(cohortname) });
        if (existingCohort) {
            return res.status(400).json({ 
                message: `Validation Error: Cohort ${cohortname} already exists in records.` 
            });
        }

        const newCohort = new Cohort({
            cohortname: Number(cohortname), // Saved cleanly as a number index
            year,
            graduationYear,
            students: [] // Starts empty, automatically populates as users register
        });

        await newCohort.save();
        res.status(201).json({ message: "New numerical cohort initialized successfully!", result: newCohort });
    } catch (error) {
        res.status(500).json({ message: "Failed to create cohort", error: error.message });
    }
};

// 2. FETCH ALL COHORTS WITH DYNAMIC COUNTS (Admin Only)
const getAllCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort.find().sort({ cohortname: -1 }); // Sort newest cohort first

        // Transform data array on the fly to return a clean numeric studentCount
        const formattedCohorts = cohorts.map(cohort => ({
            _id: cohort._id,
            cohortname: cohort.cohortname,
            year: cohort.year,
            graduationYear: cohort.graduationYear,
            studentCount: cohort.students.length, // Extracted automatically from array length
            students: cohort.students
        }));

        res.status(200).json({ 
            message: "Cohorts overview log fetched successfully.",
            count: formattedCohorts.length, 
            result: formattedCohorts 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cohorts registry", error: error.message });
    }
};

// 3. FETCH A SINGLE COHORT'S FULL DETAILS (Admin Only)
const getSingleCohort = async (req, res) => {
    try {
        // Deep populate the students array to see member names and emails on the admin panel
        const cohort = await Cohort.findById(req.params.id).populate('students', 'fullname email role');
        
        if (!cohort) return res.status(404).json({ message: "Cohort not found." });

        res.status(200).json({
            _id: cohort._id,
            cohortname: cohort.cohortname,
            year: cohort.year,
            graduationYear: cohort.graduationYear,
            studentCount: cohort.students.length,
            students: cohort.students // Displays full objects instead of just string IDs
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve cohort details", error: error.message });
    }
};

// 4. DELETE COHORT (Admin Only)
const deleteCohort = async (req, res) => {
    try {
        const cohort = await Cohort.findByIdAndDelete(req.params.id);
        if (!cohort) return res.status(404).json({ message: "Cohort not found." });

        res.status(200).json({ message: "Cohort successfully wiped from administrative indexes." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete cohort", error: error.message });
    }
};

module.exports = {
    createCohort,
    getAllCohorts,
    getSingleCohort,
    deleteCohort
};