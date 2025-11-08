  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;


// Listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 School Management API is ready!`);
  console.log(`🌐 API Base URL: http://51.20.44.144:${PORT}/api`);
  console.log(`📖 Health Check: http://51.20.44.144:${PORT}/api/health`);
});
