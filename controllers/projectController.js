const Project = require('../models/Project');
const { isDbConnected, readData, writeData } = require('../utils/storage');

exports.getProjects = async (req, res) => {
    try {
        if (isDbConnected()) {
            const projects = await Project.find().sort({ createdAt: -1 });
            return res.json(projects);
        }
        const projects = readData('projects').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        if (isDbConnected()) {
            const project = new Project(req.body);
            const newProject = await project.save();
            return res.status(201).json(newProject);
        }

        const projects = readData('projects');
        const newProject = {
            _id: Date.now().toString(),
            name: req.body.name,
            description: req.body.description,
            techStack: Array.isArray(req.body.techStack)
                ? req.body.techStack
                : (req.body.techStack ? req.body.techStack.split(',').map(s => s.trim()) : []),
            liveLink: req.body.liveLink || '',
            githubLink: req.body.githubLink || '',
            image: req.body.image || '',
            category: req.body.category || 'General',
            createdAt: new Date().toISOString()
        };

        projects.unshift(newProject);
        writeData('projects', projects);
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        if (isDbConnected()) {
            await Project.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Project deleted' });
        }

        let projects = readData('projects');
        const initialLength = projects.length;
        projects = projects.filter(p => p._id !== req.params.id);
        if (projects.length === initialLength) {
            return res.status(404).json({ message: 'Project not found' });
        }
        writeData('projects', projects);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        if (isDbConnected()) {
            const project = await Project.findById(req.params.id);
            if (!project) return res.status(404).json({ message: 'Project not found' });
            return res.json(project);
        }

        const projects = readData('projects');
        const project = projects.find(p => p._id === req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        if (isDbConnected()) {
            const updatedProject = await Project.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );
            if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
            return res.json(updatedProject);
        }

        let projects = readData('projects');
        const index = projects.findIndex(p => p._id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Project not found' });

        const updated = {
            ...projects[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        projects[index] = updated;
        writeData('projects', projects);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
