import {Router} from "express";
import {
    addRole,
    deleteRole,
    deleteUser,
    login,
    register,
    changePassword,
    getUser,
    updateUser
} from "../controllers/userAccount.controller.js";
import validate from "../middlewares/validation.middleware.js";
import {hasRole} from "../middlewares/authorization.middleware.js";
import {ADMIN} from "../configuration/constants.js";


const router = Router();

router.post('/register', validate('register'), register);
router.post('/login', login);
router.delete('/user/:login', deleteUser);
router.patch('/user/:login', validate('updateUser'), updateUser);
router.patch('/user/:login/role/:role', hasRole(ADMIN), validate('changeRoles', 'params'), addRole);
router.delete('/user/:login/role/:role', hasRole(ADMIN), validate('changeRoles', 'params'), deleteRole);
router.patch('/password', changePassword);
router.get('/user/:login', getUser);

export default router;