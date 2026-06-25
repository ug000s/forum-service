import { Router } from 'express';
import {
    hasRole,
    isOwner,
    isOwnerOrHasRole,
    isPostAuthor,
    isPostAuthorOrHasRole
} from "../middlewares/authorization.middleware.js";
import {ADMIN, MODERATOR} from "../configuration/constants.js";

const router = Router();

router.all('/account/user/:login/role/:role', hasRole(ADMIN));
router.patch(['/account/user/:user', '/forum/post/:id/comment/:user'], isOwner('user'));
router.delete('/account/user/:login', isOwnerOrHasRole('login', ADMIN));
router.post('/forum/post/:author', isOwner('author'));
router.patch('/forum/post/:id', isPostAuthor());
router.delete('/forum/post/:id', isPostAuthorOrHasRole('id', MODERATOR));

export default router;