import * as postService from '../services/post.service.js';

export const createPost = async (req, res) => {
    const post = await postService.createPost(req.params.author, req.body);
    return res.status(201).json(post);
}

export const getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.id);
        return res.json(post);
    } catch (e) {
        return res.status(404).json({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": e.message,
            "path": req.path
        });
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await postService.deletePost(req.params.id);
        return res.json(post);
    } catch (e) {
        return res.status(404).json({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": e.message,
            "path": req.path
        });
    }
}

export const addLike = async (req, res) => {
    try {
        await postService.addLike(req.params.id);
        return res.sendStatus(204)
    } catch (e) {
        return res.status(404).json({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": e.message,
            "path": req.path
        });
    }
}

export const getPostsByAuthor = async (req, res) => {
    return res.json(await postService.getPostsByAuthor(req.params.author));
}

export const addComment = async (req, res) => {
    try {
        const post = await postService.addComment(req.params.id, req.params.commenter, req.body.message);
        return res.json(post);
    } catch (e) {
        return res.status(404).json({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": e.message,
            "path": req.path
        });
    }
}

export const getPostsByTags = async (req, res) => {
    let values = req.query.values;
    if (Array.isArray(req.query.values)) {
        values = req.query.values.join(',');
    }
    return res.json(await postService.getPostsByTags(values));
}

export const getPostsByPeriod = async (req, res) => {
    const {dateFrom, dateTo} = req.query;
    return res.json(await postService.getPostsByPeriod(dateFrom, dateTo));
}

export const updatePost = async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.body);
        return res.json(post);
    } catch (e) {
        return res.status(404).json({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": e.message,
            "path": req.path
        });
    }
}