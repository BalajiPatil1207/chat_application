/**
 * 🔴 401
 */
export const handle401 = (res, message = "Unauthorized") => {
  return res.status(401).json({
    status: false,
    errors: { auth: message }
  });
};

/**
 * 🔴 404
 */
export const handle404 = (res, message = "Resource not found") => {
  return res.status(404).json({
    status: false,
    errors: { route: message }
  });
};

/**
 * 🔴 400
 */
export const handle400 = (res, message = "Bad Request") => {
  return res.status(400).json({
    status: false,
    errors: { message }
  });
};

/**
 * 🔴 500
 */
export const handle500 = (res, error) => {
  console.error("🔥 Internal Server Error:", error);

  return res.status(500).json({
    status: false,
    errors: {
      server: error?.message || "Internal Server Error"
    }
  });
};

/**
 * Format all Mongoose & general errors
 */
export const formatMongooseError = (res, error) => {
  let errors = {};

  // 🔴 Validation Error
  if (error.name === "ValidationError") {
    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });

    return res.status(422).json({ status: false, errors });
  }

  // 🔴 Duplicate Key (unique)
  if (error.code === 11000) {
    const field = error.keyValue ? Object.keys(error.keyValue)[0] : "field";
    errors[field] = `${field} already exists`;

    return res.status(422).json({ status: false, errors });
  }

  // 🔴 Cast Error (Invalid ObjectId)
  if (error.name === "CastError") {
    errors[error.path] = `Invalid ${error.path}: ${error.value}`;

    return res.status(400).json({ status: false, errors });
  }

  // 🔴 JWT Error
  if (error.name === "JsonWebTokenError") {
    return handle401(res, "Invalid token");
  }

  if (error.name === "TokenExpiredError") {
    return handle401(res, "Token expired");
  }

  // 🔴 Default → 500
  return handle500(res, error);
};
