const User = require('../models/User');

const ALLOWED_ROLES = ['Employee', 'DepartmentStaff', 'SupportStaff'];
const SUPPORT_DEPARTMENTS = ['IT', 'HR', 'Facilities', 'Finance', 'Access Management'];

function buildSafeUser(user) {
  return {
    UserId: user.UserId,
    Name: user.Name,
    Email: user.Email,
    Department: user.Department,
    Role: user.Role,
    Token: `${user.Role.toLowerCase()}-token-${user.UserId}-${Date.now()}`
  };
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, department, role = 'Employee' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid corporate email address is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    const cleanDepartment = (department || '').trim();
    if (!cleanDepartment) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }

    if (role === 'DepartmentStaff' && !SUPPORT_DEPARTMENTS.includes(cleanDepartment)) {
      return res.status(400).json({
        success: false,
        message: `Department Staff must belong to one of: ${SUPPORT_DEPARTMENTS.join(', ')}`
      });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this corporate email already exists.'
      });
    }

    const createdUser = await User.create({
      Name: name,
      Email: email,
      Password: password,
      Department: cleanDepartment,
      Role: role
    });

    const safeUser = buildSafeUser(createdUser);

    res.status(201).json({
      success: true,
      message: `Account created for ${safeUser.Name} (${safeUser.Role}).`,
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Corporate Email address is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const requestedRole = role || 'Employee';
    const cleanPassword = password.trim();

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No corporate account found with this email.'
      });
    }

    const isPasswordValid = cleanPassword === user.Password || password === user.Password;

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    if (requestedRole === 'SupportStaff' || requestedRole === 'Admin') {
      const isSupportStaff = user.Role === 'SupportStaff' || user.Role === 'Admin';
      if (!isSupportStaff) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Account "${user.Name}" (${user.Role}) does not have Support Staff / Admin privileges.`
        });
      }
    } else if (requestedRole === 'DepartmentStaff') {
      const isDeptStaff = user.Role === 'DepartmentStaff' || user.Role === 'SupportAgent';
      if (!isDeptStaff) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Account "${user.Name}" is an Employee, not a Department Staff Specialist. Please select 'Employee' in the role dropdown.`
        });
      }
    }

    const safeUser = buildSafeUser(user);

    res.status(200).json({
      success: true,
      message: `Authentication successful. Logged in as ${safeUser.Name} (${safeUser.Role}).`,
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
