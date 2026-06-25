import { Router } from 'express';
import {hasRole, isOwner, isOwnerOrHasRole, isPostAuthor} from "../middlewares/authorization.middleware.js";
import {ADMIN} from "../configuration/constants.js";

const router = Router();

router.all('/account/user/:login/role/:role', hasRole(ADMIN));
router.patch(['/account/user/:user', '/forum/post/:id/comment/:user'], isOwner('user'));
router.delete('/account/user/:login', isOwnerOrHasRole('login', ADMIN));
router.post('/forum/post/:author', isOwner('author'));
router.patch('/forum/post/:id', isPostAuthor());

export default router;