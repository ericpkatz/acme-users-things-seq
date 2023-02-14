const express = require('express');
const app = express.Router();
const { conn, User, Thing } = require('../db');

module.exports = app;

app.get('/', async(req, res, next)=> {
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

app.post('/', async(req, res, next)=> {
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

app.get('/add', async(req, res, next)=> {
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

app.get('/:id', async(req, res, next)=> {
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

