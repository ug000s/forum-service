import { Router } from 'express';
import {createPost,getPostById,deletePost,updatePost,addComment,addLike,getPostsByTags,getPostsByPeriod,getPostsByAuthor,} from '../controllers/post.controller.js';

const router = Router();

router.post('/post/:author', createPost);
router.get('/post/:id', getPostById);
router.delete('/post/:id', deletePost);
router.patch('/post/:id/like', addLike);
router.get('/posts/author/:author', getPostsByAuthor);
router.patch('/post/:id/comment/:commenter', addComment);
router.get('/posts/tags', getPostsByTags);
router.get('/posts/period', getPostsByPeriod);
router.patch('/post/:id', updatePost);

export default router;