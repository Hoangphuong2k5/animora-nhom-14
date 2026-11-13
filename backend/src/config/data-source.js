const { DataSource } = require('typeorm');
const config = require('./env.config');
const { UserEntity, AddressEntity, PasswordResetTokenEntity } = require('../entities/user.entity');
const { ServiceEntity, ExpertServiceEntity } = require('../entities/service.entity');

const AppDataSource = new DataSource({
  type: 'mssql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: false,
  logging: config.env === 'development',
  options: {
    encrypt: config.db.encrypt,
    trustServerCertificate: config.db.trustServerCertificate,
  },
  entities: [
    UserEntity,
    AddressEntity,
    PasswordResetTokenEntity,
    ServiceEntity,
    ExpertServiceEntity,
  ],
});

module.exports = { AppDataSource };
