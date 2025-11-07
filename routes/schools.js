const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Student = require('../models/Student');

// GET /api/schools - Get all schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find().populate('students', 'firstName lastName email grade');
    res.json({
      success: true,
      count: schools.length,
      data: schools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schools',
      error: error.message
    });
  }
});

// GET /api/schools/:id - Get a specific school
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id).populate('students', 'firstName lastName email grade dateOfBirth');
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.json({
      success: true,
      data: school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching school',
      error: error.message
    });
  }
});

// POST /api/schools - Create a new school
router.post('/', async (req, res) => {
  try {
    const school = new School(req.body);
    const savedSchool = await school.save();
    
    res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: savedSchool
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating school',
      error: error.message
    });
  }
});

// PUT /api/schools/:id - Update a school
router.put('/:id', async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('students', 'firstName lastName email grade');

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.json({
      success: true,
      message: 'School updated successfully',
      data: school
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating school',
      error: error.message
    });
  }
});

// DELETE /api/schools/:id - Delete a school
router.delete('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Remove school reference from all students
    await Student.updateMany(
      { school: req.params.id },
      { $unset: { school: 1 } }
    );

    await School.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'School deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting school',
      error: error.message
    });
  }
});

// GET /api/schools/:id/students - Get all students in a school
router.get('/:id/students', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const students = await Student.find({ school: req.params.id });
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

module.exports = router;
