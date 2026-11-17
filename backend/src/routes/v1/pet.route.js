import express from 'express';
import petController from '../../controllers/pet.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  petIdParamSchema,
  petQuerySchema,
  createPetSchema,
  updatePetSchema,
} from '../../validators/pet.validator.js';

const router = express.Router();

// Public: danh sách loài và giống thú cưng
router.get('/species', petController.listSpecies);

// Authenticated routes cho hồ sơ thú cưng
router.use(verifyToken);

router.get('/', validate(petQuerySchema, 'query'), petController.listMyPets);
router.get('/:id', validate(petIdParamSchema, 'params'), petController.getPetById);
router.post('/', validate(createPetSchema), petController.createPet);
router.put(
  '/:id',
  validate({ params: petIdParamSchema, body: updatePetSchema }),
  petController.updatePet
);
router.delete('/:id', validate(petIdParamSchema, 'params'), petController.deletePet);

export default router;

