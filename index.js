const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const database = {
  users: [],
};
let nextUserId = 1;
const createUser = (name, birthday) => {
  nextUserId += 1;
  database.users[nextUserId] = { id: nextUserId, name, birthday };
};

const css = `
  * {
    font-family: Arial;
  }
  div.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
  }
  form {
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid gray;
    background-color: #eee;
    transition: 150ms ease-in-out;
  }
  form:hover {
    background-color: #ccc;
  }
  form.h2 {
    text-align: center;
  }
  table {
    border-collapse: collapse;
  }
  tr, td {
    padding: 5px;
  }
  tr {
    border: none;
  }
  td {
    border-right: solid 1px #555; 
    border-left: solid 1px #555;
  }
  .ok {
    color: green;
  }
  .warn {
    color: red;
  }
`;

app.get("/", (req, res) => {
  const currentUser = req.params.userId
    ? database.users[req.params.userId]
    : null;

  console.log(database.users);

  res.send(`
    <style>${css}</style>
    <div class="container">
      <h1>Hi There!</h1>
      <p>Welcome to a very, <i>very</i> simple website!</p>

      <form action="" method="post">
        <h2>Add User</h2>

        ${req.query.createdOK ? (`
          <div style="margin: 1rem 0;">
            <span class="ok">user ${nextUserId} was created</span>
            <a href="/">dismiss</a>
          </div>
        `) : ''}

        ${req.query.missingRequiredField ? (`
          <div style="margin: 1rem 0;">
            <span class="warn">required fields were missing</span>
            <a href="/">dismiss</a>
          </div>
          `) : ''}

        <input type="hidden" name="id" value="${currentUser?.id || -1}" />

        <label for="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="name"
          value="${currentUser ? currentUser.name : ""}"
        />

        <label for="birthday">Birthday</label>
        <input
          id="birthday"
          name="birthday"
          type="date"
          value="${currentUser ? currentUser.birthday : ""}"
        />

        <button>save</button>
      </form>

      ${
        database.users.length !== 0
          ? `
        <table>
          <thead>
            <tr>
              <td>id</td>
              <td>name</td>
              <td>birthday</td>
              <td>actions</td>
            </tr>
            </thead>
            <tbody>
              ${database.users.map(
                ({ id, name, birthday }) => `
                <tr>
                  <td>${id}</td>
                  <td>${name}</td>
                  <td>${birthday.toLocaleDateString()}</td>
                  <td>
                    <a href="/edit/${id}"><button>Edit</button></a>
                    <a href="/delete/${id}"><button>Delete</button></a>
                  </td>
                </tr>
              `
              ).join('')}
          </tbody>
        </table>
      `
          : ""
      }
    </div>
    `);
});

app.post("/", (req, res) => {
  if (!(req.body.name && req.body.birthday)) {
    res.redirect("/?missingRequiredField=1");
    return;
  }
  const id = parseInt(req.body.id);
  const name = req.body.name;
  const birthday = new Date(req.body.birthday);

  if (id === -1) {
    createUser(name, birthday);
  } else {
    database.users[id] = { id, name, birthday };
  }
  res.redirect("/?createdOK=1");
});

app.get("/delete/:userId", (req, res) => {
  delete database.users[req.params.userId];
  res.redirect('/');
})

app.get("/edit/:userId", (req, res) => {
  res.send(`
    <style>${css}</style>
    <h1>WIP!</h1>
    <p>Edit page for user ${req.params.userId} is not ready yet!</p>
    <p>${database.users[req.params.userId].name} is here to stay!</p>
  `);
})

try {
  app.listen(3000, () => console.log("server listening on port 3000"));
} catch (e) {
  console.error("server could not bind to port 3000");
}
