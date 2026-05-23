const Enrollment = require('../models/enrollments');
const User = require('../models/users');
const Cohort = require('../models/cohort');
const { autoAssignToCohort } = require('../helpers/assignCohort');

// 1. JOIN COHORT
const enrollInCohort = async (req, res) => {
    try {
        const { cohortID } = req.body;
        const userID = req.user.id;

        const existing = await Enrollment.findOne({ userID, cohortID });
        if (existing) return res.status(400).json({ message: "Already enrolled in this cohort." });

        const newEnrollment = new Enrollment({
            userID,
            cohortID,
            attendance: false,
            projectSubmission: 'not-eligible', // Aligned with new schema enum
            adminverified: false               // Aligned with new schema boolean
        });

        await newEnrollment.save();
        res.status(201).json({ message: "Enrolled successfully!", enrollment: newEnrollment });
    } catch (error) {
        res.status(500).json({ message: "Enrollment failed", error: error.message });
    }
};

// 2. UPDATE PROGRESS (Admin toggles attendance/submission)
const updateProgressByStudent = async (req, res) => {
    try {
        const { studentId, cohortID, attendance, hasSubmittedProject } = req.body; 

        if (!cohortID) return res.status(400).json({ message: "cohortID is required." });

        // Logic: If admin marks project as submitted (via a checkbox/toggle)
        // we move projectSubmission from 'not-eligible' to 'pending'
        let submissionStatus = 'not-eligible';
        if (hasSubmittedProject) {
            submissionStatus = 'pending';
        }

        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { userID: studentId, cohortID: cohortID }, 
            { 
                attendance, 
                projectSubmission: submissionStatus,
                adminverified: false // Reset verification if progress is changed
            },
            { new: true }
        ).populate('userID', 'username');

        if (!updatedEnrollment) return res.status(404).json({ message: "Enrollment record not found." });

        res.status(200).json({ message: "Progress updated", result: updatedEnrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. FETCH PENDING (Now queries projectSubmission: 'pending')
const getPendingApprovals = async (req, res) => {
    try {
        // Updated query to match your new interchanged fields
        const pending = await Enrollment.find({ projectSubmission: 'pending' })
            .populate('userID', 'username email')
            .populate('cohortID', 'cohortname');
            
        res.status(200).json({ result: pending });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. FINAL APPROVAL
const approveByStudentId = async (req, res) => {
    try {
        const { studentId, cohortID } = req.body;

        const enrollment = await Enrollment.findOneAndUpdate(
            { userID: studentId, cohortID: cohortID, projectSubmission: 'pending' },
            { 
                projectSubmission: 'approved', // Update enum
                adminverified: true            // Update boolean
            },
            { new: true }
        );

        if (!enrollment) return res.status(404).json({ message: "No pending project found for this student." });

        const targetCohortDoc = await Cohort.findById(cohortID);
        
        // Promote User
        const user = await User.findByIdAndUpdate(studentId, { role: 'alumna' }, { new: true });
        await autoAssignToCohort(studentId, targetCohortDoc.cohortname);

        res.status(200).json({ message: "Student promoted to Alumna!", user: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { enrollInCohort, updateProgressByStudent, getPendingApprovals, approveByStudentId };