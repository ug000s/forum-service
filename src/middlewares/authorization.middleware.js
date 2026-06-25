import {getPostById} from "../services/post.service.js";

export const hasRole = role => (req, res, next) => req.principal.roles.includes(role.toUpperCase().trim()) ? next() : res.status(403).json({message: 'Access denied'});

export const isOwner = paramName => (req, res, next) => req.params[paramName] === req.principal.userName ? next() : res.status(403).json({message: 'Access denied'});

export const isOwnerOrHasRole = (paramName, role) => (req, res, next) => {
    const isOwner = req.params[paramName] === req.principal.userName;
    const hasRole = req.principal.roles.includes(role.toUpperCase().trim());
    return isOwner || hasRole ? next() : res.status(403).json({message: 'Access denied'});
}

export const isPostAuthor = (postIdParam = 'id') => async (req, res, next) => {
    const postId = req.params[postIdParam];
    const post = await getPostById(postId);
    return post.author === req.principal.userName ? next() : res.status(403).json({message: 'Access denied'});
}
