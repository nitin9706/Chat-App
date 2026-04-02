const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    // #region agent log
    console.error(
      "[agent-log][H5] asyncHandler caught error",
      err?.statusCode,
      err?.message,
    );
    // #endregion
    const statusCode = Number(err?.statusCode) || 500;
    res.status(statusCode).json({
      success: false,
      message: err?.message || "Internal server error",
      errors: err?.errors || [],
    });
  }
};
export { asyncHandler };
