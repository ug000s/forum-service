export const hasRole = role => (req, res, next) => req.principal.roles.includes(role.toUpperCase().trim())  ? next() : res.status(403).json({message: 'Access denied'});

export const isOwner = paramName => (req, res, next) => req.params[paramName] === req.principal.userName ? next() : res.status(403).json({message: 'Access denied'});