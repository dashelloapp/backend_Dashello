import { Router } from 'express';
import { createUser, createUserAndOrg, getUser, getallUsers, loginUser, verify, verifyTwoFactor } from '../controllers/userController';

const router = Router();

router.get('/', getallUsers);
router.get('/:id', getUser);
router.post('/verify', verify);

router.post('/register', createUserAndOrg);
router.post('/twoFactor/:id', verifyTwoFactor)
router.post('/add-user', createUser);

router.post('/signin', loginUser);


export default router;