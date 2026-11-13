const { AppDataSource } = require('../config/data-source');
const { UserEntity, PasswordResetTokenEntity } = require('../entities/user.entity');

const getUserRepo = (manager) => (manager ? manager.getRepository(UserEntity) : AppDataSource.getRepository(UserEntity));
const getTokenRepo = (manager) => (manager ? manager.getRepository(PasswordResetTokenEntity) : AppDataSource.getRepository(PasswordResetTokenEntity));

const findByEmail = async (email) => {
  return await getUserRepo().findOne({
    where: { email: email.toLowerCase().trim() },
  });
};

const findById = async (id) => {
  return await getUserRepo().findOne({
    where: { id },
  });
};

const createUser = async (userData, manager = null) => {
  const repo = getUserRepo(manager);
  const newUser = repo.create({
    ...userData,
    email: userData.email.toLowerCase().trim(),
  });
  return await repo.save(newUser);
};

const updatePassword = async (id, passwordHash, manager = null) => {
  const repo = getUserRepo(manager);
  await repo.update({ id }, { password_hash: passwordHash });
  return true;
};

// [ACC-07] Password reset tokens
const createPasswordResetToken = async ({ userId, tokenHash, expiresAt }, manager = null) => {
  const repo = getTokenRepo(manager);
  const tokenRecord = repo.create({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    used: false,
  });
  return await repo.save(tokenRecord);
};

const findValidResetToken = async (tokenHash) => {
  const repo = getTokenRepo();
  return await repo
    .createQueryBuilder('token')
    .where('token.token_hash = :tokenHash', { tokenHash })
    .andWhere('token.used = :used', { used: false })
    .andWhere('token.expires_at > :now', { now: new Date() })
    .getOne();
};

const markTokenUsed = async (tokenId, manager = null) => {
  const repo = getTokenRepo(manager);
  await repo.update({ id: tokenId }, { used: true });
  return true;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updatePassword,
  createPasswordResetToken,
  findValidResetToken,
  markTokenUsed,
};
