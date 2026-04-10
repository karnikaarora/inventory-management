import Supplier from '../models/supplier.js';

/**
 * Add Supplier API - Sequence and Explanation:
 *
 * 1. Frontend sends a POST request to /api/supplier/add with supplier data.
 *    - The request includes an Authorization header with a JWT token.
 *    - The token is verified and user must have admin role.
 *
 * 2. This controller receives the request and extracts the data from req.body.
 *    - User info is available in req.user (from authentication middleware).
 *    - Admin role is already verified by requireAdmin middleware.
 *
 * 3. It validates that all required fields are provided.
 *    - If not, responds with 400 Bad Request.
 *
 * 4. It creates a new Supplier document using the Mongoose model.
 *    - If the email already exists (unique constraint), responds with 409 Conflict.
 *
 * 5. If successful, saves the supplier to MongoDB and responds with 201 Created.
 *    - Returns the new supplier object and a success message.
 *
 * 6. If any other error occurs, responds with 500 Server Error.
 */
export const addSupplier = async (req, res) => {
  try {
    // Step 2: Extract data from request body
    const { name, email, phone, address } = req.body;
    
    // Step 3: Validate input
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Step 4: Create new supplier
    const supplier = new Supplier({ name, email, phone, address });
    await supplier.save();
    
    // Step 5: Respond with success
    res.status(201).json({ message: 'Supplier added successfully', supplier });
  } catch (error) {
    // Step 4 (error): Handle duplicate supplier
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Supplier with this email already exists' });
    }
    // Step 6: Handle other errors
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find and update supplier
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Supplier with this email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete supplier
    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};