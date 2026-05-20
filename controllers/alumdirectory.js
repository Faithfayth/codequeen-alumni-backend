const Alumdirectory = require('../models/alumdirectory');

// 1. ONE-TIME DIRECTORY SUBMISSION (Alumna Action)
const submitToDirectory = async (req, res) => {
    try {
        const userID = req.user.id;
        const { name, email, contact, location, graduationYear, cohort } = req.body;

        // Security Check: Ensure the user is actually an approved alumna
        if (req.user.role !== 'alumna') {
            return res.status(403).json({ 
                message: "Access Denied: Only fully verified Alumnae can register into the directory archive." 
            });
        }

        // Check if a directory document record already exists for this system user
        const existingRecord = await Alumdirectory.findOne({ userID });

        if (existingRecord) {
            // Rule Enforcement: If it exists and is locked, bar them from overwriting it
            if (existingRecord.isLocked) {
                return res.status(423).json({ 
                    message: "Access Denied: Your directory card is submitted and locked. Please contact an admin if you need modifications." 
                });
            }
            
            // If it exists but an admin unlocked it, allow them to resubmit and lock it again
            existingRecord.name = name;
            existingRecord.email = email;
            existingRecord.contact = contact;
            existingRecord.location = location;
            existingRecord.graduationYear = graduationYear;
            existingRecord.cohort = cohort;
            existingRecord.isLocked = true; // Lock it back up on submit

            await existingRecord.save();
            return res.status(200).json({ message: "Directory file updated and locked successfully!", result: existingRecord });
        }

        // Otherwise, create a brand new profile record and set it to locked right away
        const newRecord = new Alumdirectory({
            userID,
            name,
            email,
            contact,
            location,
            graduationYear,
            cohort,
            isLocked: true // Locked immediately upon first completion
        });

        await newRecord.save();
        res.status(201).json({ message: "Directory registration profile completed and locked!", result: newRecord });

    } catch (error) {
        res.status(500).json({ message: "Failed to submit directory data", error: error.message });
    }
};

// 2. FETCH ALL DIRECTORY RECORDS (Admin Only)
const getAllDirectoryRecords = async (req, res) => {
    try {
        const records = await Alumdirectory.find()
            .populate('userID', 'username role')
            .sort({ cohort: -1, name: 1 }); // Sorted cleanly by cohort number, then alphabetically

        res.status(200).json({
            count: records.length,
            result: records
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to load directory ledger", error: error.message });
    }
};

// 3. EDIT / UPDATE A RECORD (Admin Only)
const adminUpdateRecord = async (req, res) => {
    try {
        const { name, email, contact, location, graduationYear, cohort } = req.body;

        const updatedRecord = await Alumdirectory.findByIdAndUpdate(
            req.params.id,
            { name, email, contact, location, graduationYear, cohort },
            { returnDocument: 'after' }
        );

        if (!updatedRecord) return res.status(404).json({ message: "Target directory ledger card not found." });

        res.status(200).json({ message: "Directory record modified successfully by Admin.", result: updatedRecord });
    } catch (error) {
        res.status(500).json({ message: "Admin update transaction failed", error: error.message });
    }
};

// 4. UNLOCK A RECORD FOR AN ALUMNA (Admin Only)
// Use this when an alumna contacts an admin saying they made a mistake or changed contacts
const adminUnlockRecord = async (req, res) => {
    try {
        const unlockedRecord = await Alumdirectory.findByIdAndUpdate(
            req.params.id,
            { isLocked: false }, // Grants temporary edit authorization back to the alumna
            { returnDocument: 'after' }
        );

        if (!unlockedRecord) return res.status(404).json({ message: "Target directory card not found." });

        res.status(200).json({ 
            message: `Successfully unlocked directory profile for ${unlockedRecord.name}. They can now re-submit their form once.`, 
            result: unlockedRecord 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to lift form execution lock parameters", error: error.message });
    }
};

// 5. DELETE A RECORD (Admin Only)
const deleteDirectoryRecord = async (req, res) => {
    try {
        const deleted = await Alumdirectory.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Target record not found." });

        res.status(200).json({ message: "Alumni directory file permanently wiped from administrative databases." });
    } catch (error) {
        res.status(500).json({ message: "Data destruction processing failed", error: error.message });
    }
};

module.exports = {
    submitToDirectory,
    getAllDirectoryRecords,
    adminUpdateRecord,
    adminUnlockRecord,
    deleteDirectoryRecord
};







//npm i json2csv
//const { Parser } = require('json2csv');
//to enable admin download the alumni directory file
// const downloadDirectoryCSV = async (req, res) => {
//     try {
//         // Fetch all records, sorted cleanly by cohort group sequence number
//         const records = await Alumdirectory.find().sort({ cohort: -1, name: 1 });

//         if (!records || records.length === 0) {
//             return res.status(404).json({ message: "No directory records found to export." });
//         }

//         // 2. Define the exact column headers for the spreadsheet layout grid matrix
//         const fields = [
//             { label: 'Full Name', value: 'name' },
//             { label: 'Email Address', value: 'email' },
//             { label: 'Contact Phone Number', value: 'contact' },
//             { label: 'Current Location', value: 'location' },
//             { label: 'Cohort Number', value: 'cohort' },
//             { label: 'Graduation Year', value: 'graduationYear' },
//             { label: 'Record Lock Status', value: 'isLocked' },
//             { label: 'Submission Timestamp', value: 'createdAt' }
//         ];

//         // 3. Transform data objects into the CSV string structure format
//         const json2csvParser = new Parser({ fields });
//         const csvData = json2csvParser.parse(records);

//         // 4. Configure structural HTTP response headers to trigger an immediate browser file attachment stream
//         const filename = `CodeQueen_Alumni_Directory_Export_${new Date().toISOString().split('T')[0]}.csv`;
        
//         res.setHeader('Content-Type', 'text/csv');
//         res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

//         // 5. Stream the compiled text grid payload straight back to the client down-channel link
//         return res.status(200).send(csvData);

//     } catch (error) {
//         res.status(500).json({ message: "Failed to generate spreadsheet download compilation file", error: error.message });
//     }
// };