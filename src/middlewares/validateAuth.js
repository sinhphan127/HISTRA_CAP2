import Joi from 'joi';

// Register Validation Schema
const registerSchema = Joi.object({
  full_name: Joi.string().required().messages({
    'string.empty': 'Họ và tên không được để trống',
    'any.required': 'Trường Họ và tên là bắt buộc'
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Trường Email là bắt buộc'
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'))
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      'any.required': 'Trường Mật khẩu là bắt buộc'
    }),
  confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'any.required': 'Vui lòng nhập mật khẩu xác nhận'
  }),
  phone_number: Joi.string().optional().allow('')
});

// Login Validation Schema
const loginSchema = Joi.object({
  loginIdentifier: Joi.string().required().messages({
    'string.empty': 'Username hoặc Email không được để trống',
    'any.required': 'Trường Username hoặc Email là bắt buộc'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Trường Mật khẩu là bắt buộc'
  })
});

// Middleware cho Đăng ký
export const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const formattedErrors = error.details.map(err => ({ field: err.path[0], message: err.message }));
    return res.status(400).json({ success: false, message: 'Dữ liệu đầu vào không hợp lệ', errors: formattedErrors });
  }
  next();
};

// Middleware cho Đăng nhập
export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const formattedErrors = error.details.map(err => ({ field: err.path[0], message: err.message }));
    return res.status(400).json({ success: false, message: 'Dữ liệu đầu vào không hợp lệ', errors: formattedErrors });
  }
  next();
};

// Forgot Password Schemas
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Trường Email là bắt buộc'
  })
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Trường Email là bắt buộc'
  }),
  otp: Joi.string().length(6).required().messages({
    'string.empty': 'Mã OTP không được để trống',
    'string.length': 'Mã OTP phải có đúng 6 ký tự',
    'any.required': 'Trường mã OTP là bắt buộc'
  })
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không đúng định dạng',
    'any.required': 'Trường Email là bắt buộc'
  }),
  resetToken: Joi.string().required().messages({
    'string.empty': 'Token không hợp lệ',
    'any.required': 'Thiếu token đặt lại mật khẩu'
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$'))
    .required()
    .messages({
      'string.empty': 'Mật khẩu mới không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      'any.required': 'Trường Mật khẩu mới là bắt buộc'
    })
});

export const validateForgotPassword = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const formattedErrors = error.details.map(err => ({ field: err.path[0], message: err.message }));
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: formattedErrors });
  }
  next();
};

export const validateVerifyOtp = (req, res, next) => {
  const { error } = verifyOtpSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const formattedErrors = error.details.map(err => ({ field: err.path[0], message: err.message }));
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: formattedErrors });
  }
  next();
};

export const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const formattedErrors = error.details.map(err => ({ field: err.path[0], message: err.message }));
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: formattedErrors });
  }
  next();
};
