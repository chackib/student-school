const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const School = require('../models/School');

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    const { school, grade, isActive } = req.query;
    let filter = {};

    if (school) filter.school = school;
    if (grade) filter.grade = grade;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const students = await Student.find(filter).populate('school', 'name address');
    
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

// GET /api/students/:id - Get a specific student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('school', 'name address phone email');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
});

// POST /api/students - Create a new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    
    // If student is assigned to a school, add to school's students array
    if (savedStudent.school) {
      await School.findByIdAndUpdate(
        savedStudent.school,
        { $addToSet: { students: savedStudent._id } }
      );
    }

    const populatedStudent = await Student.findById(savedStudent._id).populate('school', 'name address');
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully ✅ (v5)',
      data: populatedStudent
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
      message: 'Error creating student',
      error: error.message
    });
  }
});

// PUT /api/students/:id - Update a student
router.put('/:id', async (req, res) => {
  try {
    const oldStudent = await Student.findById(req.params.id);
    
    if (!oldStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('school', 'name address');

    // Handle school changes
    if (oldStudent.school && oldStudent.school.toString() !== student.school?.toString()) {
      // Remove from old school
      await School.findByIdAndUpdate(
        oldStudent.school,
        { $pull: { students: student._id } }
      );
    }

    if (student.school && (!oldStudent.school || oldStudent.school.toString() !== student.school.toString())) {
      // Add to new school
      await School.findByIdAndUpdate(
        student.school,
        { $addToSet: { students: student._id } }
      );
    }

    res.json({
      success: true,
      message: 'Student updated successfully✅ (v5)',
      data: student
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
      message: 'Error updating student',
      error: error.message
    });
  }
});

// DELETE /api/students/:id - Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove student from school's students array
    if (student.school) {
      await School.findByIdAndUpdate(
        student.school,
        { $pull: { students: student._id } }
      );
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// PATCH /api/students/:id/enroll - Enroll student in a school
router.patch('/:id/enroll', async (req, res) => {
  try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required'
      });
    }

    const student = await Student.findById(req.params.id);
    const school = await School.findById(schoolId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Remove from old school if exists
    if (student.school) {
      await School.findByIdAndUpdate(
        student.school,
        { $pull: { students: student._id } }
      );
    }

    // Add to new school
    student.school = schoolId;
    await student.save();

    await School.findByIdAndUpdate(
      schoolId,
      { $addToSet: { students: student._id } }
    );

    const updatedStudent = await Student.findById(student._id).populate('school', 'name address');

    res.json({
      success: true,
      message: 'Student enrolled successfully',
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling student',
      error: error.message
    });
  }
});

// PATCH /api/students/:id/unenroll - Unenroll student from school
router.patch('/:id/unenroll', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!student.school) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in any school'
      });
    }

    // Remove from school
    await School.findByIdAndUpdate(
      student.school,
      { $pull: { students: student._id } }
    );

    student.school = null;
    await student.save();

    res.json({
      success: true,
      message: 'Student unenrolled successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unenrolling student',
      error: error.message
    });
  }
});

module.exports = router;
