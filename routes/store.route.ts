import {getAllStores,getStoreById,createStore,deleteStore,updateStore} from '../controllers/index.js';
import { authVerify } from "../middleware/auth.middleware.js";
import express from "express";
const router = express.Router();

router.get('/',authVerify, getAllStores);
router.get('/:id', getStoreById);
router.post('/', authVerify, createStore);
router.delete('/:id', authVerify, deleteStore);
router.put('/:id', authVerify, updateStore);

export default router;