const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    techStack: [String],
    liveLink: { type: String },
    githubLink: { type: String },
    image: { type: String },
    category: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Project', projectSchema);
