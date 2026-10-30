/**
 * Switchable Authentication & Authorization Middleware
 * Governed by process.env.AUTH_ENABLED
 * 
 * - When AUTH_ENABLED is not 'true' (default): Pass-through mode (no auth enforced)
 * - When AUTH_ENABLED is 'true': Validates Bearer token against MCP_API_TOKEN,
 *   API_SECRET_KEY, or ADMIN_API_TOKEN
 */
export const requireWriteAuth = (req, res, next) => {
  if (process.env.AUTH_ENABLED !== 'true') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: A valid Bearer token is required for write operations.',
    });
  }

  const token = authHeader.split(' ')[1]?.trim();
  const validTokens = [
    process.env.MCP_API_TOKEN,
    process.env.API_SECRET_KEY,
    process.env.ADMIN_API_TOKEN,
  ].filter(Boolean);

  if (validTokens.length > 0 && validTokens.includes(token)) {
    req.user = { authenticated: true, tokenType: 'bearer' };
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Invalid or expired authentication token.',
  });
};

