const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_users_and_things_database');

const User = conn.define('user', {
  name: {
    type: Sequelize.STRING
  }
});

const Thing = conn.define('thing', {
  name: {
    type: Sequelize.STRING
  }
});

Thing.belongsTo(User);

const syncAndSeed = async()=> {
  await conn.sync({force: true });
  const [moe, larry, lucy] = await Promise.all([
    User.create({ name: 'moe' }),
    User.create({ name: 'larry' }),
    User.create({ name: 'lucy' }),
  ]);
  await Promise.all([
    Thing.create({ name: 'foo', userId: lucy.id }),
    Thing.create({ name: 'bar', userId: lucy.id }),
    Thing.create({ name: 'bazz' }),
  ]);
};

module.exports = {
  conn,
  User,
  Thing,
  syncAndSeed
};

