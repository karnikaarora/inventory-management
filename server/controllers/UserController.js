import User from '../models/user.js';

/**
 * Get all users
 */
export const getUsers = async (req, res) => {
    try {
        console.log('Fetching all users...');
        
        const users = await User.find({}).sort({ createdAt: -1 });
        console.log('Users found:', users.length);
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Update user role
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        console.log('Updating user role:', { id, role });
        
        // Validate input
        if (!role || !['admin', 'customer'].includes(role)) {
            return res.status(400).json({ message: 'Valid role is required' });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User role updated successfully:', updatedUser);
        
        res.status(200).json({
            success: true,
            message: 'User role updated successfully!',
            data: updatedUser
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Deleting user:', id);
        
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User deleted successfully:', deletedUser);
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully!',
            data: deletedUser
        });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
    try {
        console.log('Fetching user statistics...');
        
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const customerUsers = await User.countDocuments({ role: 'customer' });
        
        // Get recent users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const stats = {
            totalUsers,
            adminUsers,
            customerUsers,
            recentUsers
        };
        
        console.log('User stats calculated:', stats);
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
