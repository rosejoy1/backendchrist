const express = require('express');
const xlsx = require('xlsx');
const User = require('./User');  // Adjust this path based on your actual User model
const router = express.Router();

// Export to Excel route
router.get('/export-excel', async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from DB

    // Prepare the data in a format suitable for Excel
    const data = users.map(user => {
      // Prepare children's details as a readable string
      const childrenDetails = user.children && user.children.length > 0
        ? user.children.map(child => `Name: ${child.name}, Age: ${child.age}, Gender: ${child.gender}`).join('; ')
        : 'N/A';  // If no children, return 'N/A'

      return {
        ID: user._id,
        FullName: user.fullName,
        HouseName: user.houseName,
        Place: user.place,
        Parish: user.parish,
        Email: user.email,
        Phone: user.phone,
        DateOfBirth: user.dob ? new Date(user.dob).toLocaleDateString('en-GB') : '',  // Fixed format
        Experience: user.experience,
        Accommodation: user.accommodation,
        Gender: user.gender,
        Category: user.category,
        SpouseName: user.spouseName || '',
        SpousePhone: user.spousePhone || '',
        NumberOfChildren: user.numChildren || 0,
        ChildrenDetails: childrenDetails,  // Full children details included
      };
    });

    // Create a new Excel file
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Users');

    // Write the file as a Blob and send it to the frontend
    const fileBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Set headers for Excel download
    res.setHeader('Content-Disposition', 'attachment; filename=registered_users.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error exporting data:', error);  // More detailed error logging
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
