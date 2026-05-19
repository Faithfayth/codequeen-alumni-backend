const Enrollment = require('../models/enrollments');
const User = require('../models/users');
const Cohort = require('../models/cohort'); // Imported to find cohort numbers
const { autoAssignToCohort } = require('../helpers/assignCohort'); // Our automation sync helper

// 1. JOIN COHORT (Student-initiated)
const enrollInCohort = async (req, res) => {
    try {
        const { cohortID } = req.body;
        const userID = req.user.id;

        const existing = await Enrollment.findOne({ userID, cohortID });
        if (existing) return res.status(400).json({ message: "Already enrolled in this specific cohort." });

        const newEnrollment = new Enrollment({
            userID,
            cohortID,
            attendance: false,
            projectSubmission: false,
            adminverified: 'not-eligible'
        });

        await newEnrollment.save();
        res.status(201).json({ message: "Enrolled successfully!", enrollment: newEnrollment });
    } catch (error) {
        res.status(500).json({ message: "Enrollment failed", error: error.message });
    }
};

// 2. UPDATE PROGRESS BY STUDENT & COHORT (Admin-facing)
const updateProgressByStudent = async (req, res) => {
    try {
        const { studentId } = req.params; 
        const { attendance, projectSubmission, cohortID } = req.body; // FIX: Pass cohortID from frontend to target the correct track

        if (!cohortID) {
            return res.status(400).json({ message: "Validation Error: cohortID is required to identify the target track." });
        }

        let status = 'not-eligible';
        if (attendance === true && projectSubmission === true) {
            status = 'pending';
        }

        // FIX: Query scopes both user AND specific cohort to prevent overwriting historical records
        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { userID: studentId, cohortID: cohortID }, 
            { attendance, projectSubmission, adminverified: status },
            { returnDocument: 'after' }
        ).populate('userID', 'username');

        if (!updatedEnrollment) return res.status(404).json({ message: "No enrollment record matching this student and cohort combination found." });

        res.status(200).json({ message: "Student progress parameters updated", result: updatedEnrollment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. FETCH PENDING APPROVALS (Admin Dashboard)
const getPendingApprovals = async (req, res) => {
    try {
        const pending = await Enrollment.find({ adminverified: 'pending' })
            .populate('userID', 'username email')
            .populate('cohortID', 'cohortname');
            
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. APPROVE & PROMOTE BY USER ID (Admin Lifecycle Action)
const approveByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { cohortID } = req.body; // FIX: Expect cohortID in payload to identify graduation track

        if (!cohortID) {
            return res.status(400).json({ message: "Validation Error: cohortID must be provided to execute graduation push." });
        }

        // 1. Find enrollment by userID and cohort, then approve
        const enrollment = await Enrollment.findOneAndUpdate(
            { userID: studentId, cohortID: cohortID },
            { adminverified: 'approved' },
            { returnDocument: 'after' }
        );

        if (!enrollment) return res.status(404).json({ message: "Matching pending enrollment record not found." });

        // 2. Fetch the target cohort document to read its numeric cohortname
        const targetCohortDoc = await Cohort.findById(cohortID);
        if (!targetCohortDoc) return res.status(404).json({ message: "Target graduation cohort metadata missing from database indexes." });

        // 3. Update the User role to alumna
        const user = await User.findByIdAndUpdate(
            studentId,
            { role: 'alumna' },
            { returnDocument: 'after' }
        );

        // 🔥 CONNECTING THE LOOPS: Sync student to numerical tracking list and history array automatically
        await autoAssignToCohort(studentId, targetCohortDoc.cohortname);

        // 4. Socket.io Live Notification
        const io = req.app.get('io');
        if (io) {
            // Fires targeted message straight to the student's personal socket channel space
            io.to(studentId).emit('role_updated', {
                message: "Congratulations, sister! Your profile has officially been upgraded to Alumna status!",
                newRole: 'alumna',
                cohort: targetCohortDoc.cohortname
            });
        }

        res.status(200).json({ message: `Successfully promoted ${user.username} to Alumna for Cohort ${targetCohortDoc.cohortname}!`, user: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    enrollInCohort,
    updateProgressByStudent,
    getPendingApprovals,
    approveByStudentId
};