import { Router } from 'express';
import {createPost,getPostById,deletePost,updatePost,addComment,addLike,getPostsByTags,getPostsByPeriod,getPostsByAuthor,} from '../controllers/post.controller.js';
import validate from "../middlewares/validation.middleware.js";

const router = Router();

router.post('/post/:author', validate('createPost'), createPost);
router.get('/post/:id', getPostById);
router.delete('/post/:id', deletePost);
router.patch('/post/:id/like', addLike);
router.get('/posts/author/:author', getPostsByAuthor);
router.patch('/post/:id/comment/:commenter', validate('addComment'), addComment);
router.get('/posts/tags', getPostsByTags);
router.get('/posts/period', validate('dateFormatPeriod', 'query'), getPostsByPeriod);
router.patch('/post/:id', validate('updatePost'), updatePost);

export default router;