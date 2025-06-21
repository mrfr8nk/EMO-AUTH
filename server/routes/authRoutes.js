const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getResetPasswordForm,
    googleLogin
} = require('../controllers/authController');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', getResetPasswordForm);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleLogin);

module.exports = router;
