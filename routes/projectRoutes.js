const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject, getProjectById, updateProject } = require('../controllers/projectController');
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
module.exports = router;
