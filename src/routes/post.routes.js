import {Router} from 'express';
import {
    createPost,
    getPostById,
    deletePost,
    addLike,
    getPostsByAuthor,
    addComment,
    getPostsByTags,
    getPostsByPeriod,
    updatePost
} from '../controllers/post.controller.js';

const router = Router();

router.post('/forum/post/:author', createPost);
router.get('/forum/post/:id', getPostById);
router.delete('/forum/post/:id', deletePost);
router.patch('/forum/post/:id/like', addLike);
router.get('/forum/posts/author/:author', getPostsByAuthor);
router.patch('/forum/post/:id/comment/:commenter', addComment);
router.get('/forum/posts/tags', getPostsByTags);
router.get('/forum/posts/period', getPostsByPeriod);
router.put('/forum/post/:id', updatePost);

export default router;