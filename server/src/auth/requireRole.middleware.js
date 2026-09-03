// Use after verifyToken. Blocks the request unless req.user has the given role.
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      const err = new Error('Forbidden');
      err.status = 403;
      err.publicMessage = `This action requires a ${role} account.`;
      return next(err);
    }
    next();
  };
}