const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/mailer');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('Email already in use', 400, 'email'));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Send welcome email
        const message = `
            <h1>Welcome to NexusAuth</h1>
            <p>Hi ${user.name}, your account has been successfully created!</p>
            <p>You can now login with your credentials.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Welcome to NexusAuth',
                text: message
            });

            res.status(201).json({
                success: true,
                data: 'Account created successfully. Please login.'
            });
        } catch (emailErr) {
            console.error('Email send error:', emailErr);
            return next(new ErrorResponse('Account created but email could not be sent', 500));
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Generate token (you can implement JWT here)
        // const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            // token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(new ErrorResponse('Email could not be sent', 404));
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save();

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Email message
        const message = `
            <h1>You requested a password reset</h1>
            <p>Please click the following link to reset your password:</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
            <p>This link will expire in 10 minutes.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                text: message
            });

            res.status(200).json({
                success: true,
                data: 'Email sent successfully'
            });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return next(new ErrorResponse('Email could not be sent', 500));
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get reset password form
// @route   GET /api/auth/reset-password/:token
// @access  Public
exports.getResetPasswordForm = async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ErrorResponse('Invalid or expired token', 400));
        }

        // In a real app, you would serve a reset password form
        res.status(200).json({
            success: true,
            token: req.params.token
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ErrorResponse('Invalid or expired token', 400));
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send confirmation email
        const message = `
            <h1>Password Changed Successfully</h1>
            <p>Your password has been successfully updated.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Changed',
                text: message
            });

            res.status(200).json({
                success: true,
                data: 'Password reset successful'
            });
        } catch (err) {
            console.error('Email send error:', err);
            return next(new ErrorResponse('Password reset but email could not be sent', 500));
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
    // Implement Google OAuth logic here
    res.status(200).json({
        success: true,
        data: 'Google login endpoint'
    });
};
