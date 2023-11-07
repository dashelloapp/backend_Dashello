import { Router } from 'express';
import { createUser, createUserAndOrg, getUser, getallUsers, googleSignIn, loginUser, verify } from '../controllers/userController';

const router = Router();

router.get('/', getallUsers);
router.get('/:id', getUser);
router.post('/verify', verify);

router.post('/register', createUserAndOrg);
// router.post('/twoFactor/:id', twoFactor)
router.post('/add-user', createUser);

router.post('/signin', loginUser);
router.post('/google-signin', googleSignIn)


export default router;