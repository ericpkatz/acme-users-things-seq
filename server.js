const express = require('express');
const app = express();
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({ extended: false }));

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

app.get('/', (req, res)=> res.redirect('/things'));

app.get('/things', async(req, res, next)=> {
  try {
    const things = await Thing.findAll({
      include: [ User ]
    });
    res.send(`
    <html>
      <head>
        <title>Acme User Things SEQ</title>
      </head>
      <body>
        <h1>Acme User Things SEQ</h1>
        <a href='/things/add'>Add</a>
        <ul>
          ${
            things.map( thing => {
              return `
                <li>
                  <a href='/things/${thing.id}'>${ thing.name }</a> owned by ${ thing.user ? thing.user.name : 'nobody'}
                </li>
              `;
            }).join('')
          }
        </ul>
      </body>
    </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/things', async(req, res, next)=> {
  try {
    if(req.body.userId === ''){
      req.body.userId = null;
    }
    const thing = await Thing.create(req.body);
    res.redirect(`/things/${thing.id}`);

  }
  catch(ex){
    next(ex);
  }
});

app.get('/things/add', async(req, res, next)=> {
  try {
    const users = await User.findAll();
    res.send(`
    <html>
      <head>
        <title>Acme User Things SEQ</title>
        <link rel='stylesheet' href='/assets/styles.css' />
      </head>
      <body>
        <h1>Acme User Things SEQ</h1>
        <a href='/things'>Back</a>
        <form method='POST' action='/things' >
          <input name='name' />
          <select name='userId'>
            <option value=''>-- choose a user --</option>
            ${
              users.map( user => {
                return `
                  <option value='${user.id}'>${ user.name }</option>
                `;
              }).join('')
            }
          </select>
          <button>Create</button>
        </form>
      </body>
    </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/things/:id', async(req, res, next)=> {
  try {
    const thing = await Thing.findByPk(req.params.id, {
      include: [ User ]
    });
    res.send(`
    <html>
      <head>
        <title>Acme User Things SEQ</title>
      </head>
      <body>
        <h1>Acme User Things SEQ</h1>
        <a href='/things'>Back</a>
        <h2>${ thing.name }</h2>
        <p>
          Owned by ${ thing.user ? thing.user.name : 'nobody'}
        </p>
      </body>
    </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  console.log(err);
  next(err);
});

const port = process.env.PORT || 3000;
app.listen(port, async()=> {
  try {
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
    console.log(`listening on port ${port}`);
  }
  catch(ex){
    console.log(ex);
  }
});
