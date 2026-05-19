const Election = require('../models/elections');

// 1. CREATE ELECTION (Admin Only)
// Initializes the election shell. Candidates are added later.
const createElection = async (req, res) => {
    try {
        const { electionName, description, startDate, endDate } = req.body;

        const newElection = new Election({
            electionName,
            description,
            startDate,
            endDate,
            candidates: [],
            votersRecord: [], // Tracks {userID, postVotedFor}
            isActive: false   // Admin must toggle this to start the election
        });

        await newElection.save();
        res.status(201).json({ message: "Election created! You can now add candidates.", election: newElection });
    } catch (error) {
        res.status(500).json({ message: "Creation failed", error: error.message });
    }
};

// 2. ADD CANDIDATE TO POST (Admin Only)
// Adds a candidate and assigns them to a specific post (e.g., President)
const addCandidate = async (req, res) => {
    try {
        const { electionId } = req.params;
        const { candidateID, post, manifesto, imageurl } = req.body;

        // Validation
        if (!candidateID || !post || !manifesto || !imageurl) {
            return res.status(400).json({ message: "All candidate fields are required." });
        }

        // Check if candidate is already in this election (any post)
        const exists = await Election.findOne({ _id: electionId, "candidates.candidateID": candidateID });
        if (exists) return res.status(400).json({ message: "This person is already a candidate." });

        const updated = await Election.findByIdAndUpdate(
            electionId,
            { 
                $push: { 
                    candidates: { candidateID, post, manifesto, imageurl, votesCount: 0 } 
                } 
            },
            { new: true }
        ).populate('candidates.candidateID', 'username');

        res.status(200).json({ message: `Candidate added to ${post}`, result: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. TOGGLE ELECTION STATUS (Admin Only)
// Opens or closes the voting booth
const toggleElectionActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const election = await Election.findByIdAndUpdate(id, { isActive }, { new: true });
        res.status(200).json({ message: `Election is now ${isActive ? 'Live' : 'Closed'}`, election });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. GET ACTIVE ELECTIONS (Alumnae Only)
// Used by the frontend to build the ballot UI
const getActiveElections = async (req, res) => {
    try {
        const now = new Date();
        const elections = await Election.find({ 
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('candidates.candidateID', 'username');

        res.status(200).json(elections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. CAST VOTE (Alumnae Only)
// The core logic for voting: one vote allowed per position (post)
const castVote = async (req, res) => {
    try {
        const { electionId, candidateId, postName } = req.body;
        const userId = req.user.id;

        const election = await Election.findById(electionId);
        if (!election || !election.isActive) {
            return res.status(400).json({ message: "This election is not active." });
        }

        // SECURITY: Check if this user has already voted for this specific post in this election
        const alreadyVoted = election.votersRecord.some(
            record => record.userID.toString() === userId && record.postVotedFor === postName
        );

        if (alreadyVoted) {
            return res.status(403).json({ message: `You have already cast your vote for the ${postName} position.` });
        }

        // ATOMIC UPDATE: 
        // 1. Match election, the specific candidate ID, and the specific postName
        // 2. Increment that candidate's vote count
        // 3. Push the user to the votersRecord for that specific post
        const result = await Election.findOneAndUpdate(
            { 
                _id: electionId, 
                "candidates.candidateID": candidateId,
                "candidates.post": postName 
            },
            { 
                $inc: { "candidates.$.votesCount": 1 },
                $push: { votersRecord: { userID: userId, postVotedFor: postName } } 
            },
            { new: true }
        );

        if (!result) return res.status(404).json({ message: "Candidate or Post mapping failed." });

        res.status(200).json({ message: `Vote for ${postName} submitted successfully.` });
    } catch (error) {
        res.status(500).json({ message: "Voting failed", error: error.message });
    }
};

// 6. GET ELECTION RESULTS (Admin/Alumnae)
const getElectionResults = async (req, res) => {
    try {
        const { id } = req.params;
        const election = await Election.findById(id).populate('candidates.candidateID', 'username');
        if (!election) return res.status(404).json({ message: "Election not found" });

        res.status(200).json({
            name: election.electionName,
            results: election.candidates
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createElection,
    addCandidate,
    toggleElectionActive,
    getActiveElections,
    castVote,
    getElectionResults
};