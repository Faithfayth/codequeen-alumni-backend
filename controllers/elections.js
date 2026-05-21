const Election = require('../models/elections');

// 1. CREATE ELECTION (Admin Only)
const createElection = async (req, res) => {
    try {
        const { electionName, description, startDate, endDate } = req.body;

        const newElection = new Election({
            electionName,
            description,
            startDate,
            endDate,
            posts: [], // Starts with no positions defined
            votersRecord: [], 
            isActive: false   
        });

        await newElection.save();
        res.status(201).json({ message: "Election created! Go ahead and add posts/positions.", election: newElection });
    } catch (error) {
        res.status(500).json({ message: "Creation failed", error: error.message });
    }
};

// [NEW HELPER] 2. ADD POST/POSITION TO ELECTION (Admin Only)
// e.g., Body: { "postName": "Vice President" }
const addPostToElection = async (req, res) => {
    try {
        const { electionId } = req.params;
        const { postName } = req.body;

        if (!postName) return res.status(400).json({ message: "Post name is required." });

        // Check if the post structure already exists in this election
        const exists = await Election.findOne({ _id: electionId, "posts.postName": postName });
        if (exists) return res.status(400).json({ message: "This post position already exists." });

        const updatedElection = await Election.findByIdAndUpdate(
            electionId,
            { $push: { posts: { postName, candidates: [] } } },
            { new: true }
        );

        res.status(200).json({ message: `Position '${postName}' initialized!`, election: updatedElection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. ADD CANDIDATE TO SPECIFIC POST ARRAY (Admin Only)
const addCandidate = async (req, res) => {
    try {
        const { electionId } = req.params;
        const { candidateID, name, postName, manifesto, imageurl } = req.body;

        if (!candidateID || !name || !postName || !manifesto || !imageurl) {
            return res.status(400).json({ message: "All candidate fields are required." });
        }

        // Check if candidate is already running somewhere inside this election
        const exists = await Election.findOne({ _id: electionId, "posts.candidates.candidateID": candidateID });
        if (exists) return res.status(400).json({ message: "This user is already a candidate in this election." });

        // Push candidate directly into the matched posts sub-document array
        const updated = await Election.findOneAndUpdate(
            { _id: electionId, "posts.postName": postName },
            { 
                $push: { 
                    "posts.$.candidates": { candidateID, name, manifesto, imageurl, votesCount: 0 } 
                } 
            },
            { new: true }
        ).populate('posts.candidates.candidateID', 'username');

        if (!updated) return res.status(404).json({ message: "Target post position not found in this election." });

        res.status(200).json({ message: `Candidate added to ${postName}`, result: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. TOGGLE ELECTION STATUS (Admin Only)
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

// 5. GET ACTIVE ELECTIONS (Alumnae Only)
const getActiveElections = async (req, res) => {
    try {
        const now = new Date();
        const elections = await Election.find({ 
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('posts.candidates.candidateID', 'username');

        res.status(200).json(elections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. CAST VOTE (Alumnae Only)
const castVote = async (req, res) => {
    try {
        const { electionId, candidateId, postName } = req.body;
        const userId = req.user.id;

        const election = await Election.findById(electionId);
        if (!election || !election.isActive) {
            return res.status(400).json({ message: "This election is not active." });
        }

        // Verify single vote clearance condition
        const alreadyVoted = election.votersRecord.some(
            record => record.userID.toString() === userId && record.postVotedFor === postName
        );
        if (alreadyVoted) {
            return res.status(403).json({ message: `You have already cast your vote for the ${postName} position.` });
        }

        // Deep matching step to find election, postName, and candidateId inside nested schemas
        const result = await Election.findOneAndUpdate(
            { 
                _id: electionId
            },
            { 
                $inc: { "posts.$[p].candidates.$[c].votesCount": 1 },
                $push: { votersRecord: { userID: userId, postVotedFor: postName } } 
            },
            { 
                arrayFilters: [ { "p.postName": postName }, { "c.candidateID": candidateId } ],
                new: true 
            }
        );

        if (!result) return res.status(404).json({ message: "Candidate or Post structural mapping failed." });

        res.status(200).json({ message: `Vote for ${postName} submitted successfully.` });
    } catch (error) {
        res.status(500).json({ message: "Voting failed", error: error.message });
    }
};

// 7. GET ELECTION RESULTS (Admin/Alumnae)
const getElectionResults = async (req, res) => {
    try {
        const { id } = req.params;
        const election = await Election.findById(id).populate('posts.candidates.candidateID', 'username');
        if (!election) return res.status(404).json({ message: "Election not found" });

        res.status(200).json({
            name: election.electionName,
            posts: election.posts // Directly groups everything by position for the UI!
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createElection,
    addPostToElection, 
    addCandidate,
    toggleElectionActive,
    getActiveElections,
    castVote,
    getElectionResults
};