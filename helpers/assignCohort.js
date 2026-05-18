const Cohort = require('../models/cohort');
const User = require('../models/users'); // 1. IMPORTED: Added the User model import here

// The automated sync utility
const autoAssignToCohort = async (userId, cohortNumber) => {
    try {
        if (!cohortNumber) return;

        // 1. Clear any old cohort traces for this user (safeguard)
        await Cohort.updateMany(
            { students: userId },
            { $pull: { students: userId } }
        );

        // 2. Scan and push user ID to the matching cohort number index
        const targetCohort = await Cohort.findOneAndUpdate(
            { cohortname: Number(cohortNumber) },
            { $addToSet: { students: userId } },
            { returnDocument: 'after' }
        );

        if (!targetCohort) {
            console.log(`\x1b[33m[Automation Alert]\x1b[0m Cohort ${cohortNumber} does not exist yet. Student created but not grouped.`);
        } else {
            // 🔥 2. PLACEMENT: Log the cohort into the user's history here because the cohort is verified!
            // $addToSet ensures that if they are re-assigned to the same cohort twice, it won't duplicate the number in their history array.
            await User.findByIdAndUpdate(
                userId,
                { $addToSet: { cohortHistory: Number(cohortNumber) } }
            );

            console.log(`\x1b[32m[Success]\x1b[0m Automatically synced User ${userId} to Cohort ${cohortNumber} and updated history profile.`);
        }
    } catch (error) {
        console.error("Cohort automation assignment sync failed:", error.message);
    }
};

module.exports = { autoAssignToCohort };