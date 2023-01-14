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

const stringifyBirthday = (birthday) => {
  // we will add 10 hours to the date, making GMT-midnight dates work when they
  // are converted to US locales. This is obviously NOT the best way for
  // international support, but it'll do for a demo being used by folks in the
  // US
  const offset = birthday.getTimezoneOffset() * 60000;
  return new Date(birthday.getTime() + offset).toLocaleDateString();
}

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

  // extract some variables to be injected into the page
  const showConfirmUserCreated = !!req.query.createdOK;
  const showMissingRequiredFields = !!req.query.missingRequiredField;
  // id of -1 will indicate that the id is unassigned. We will choose to
  // interpret this as effectively the same as null, and the post request
  // handler will use this as a hook to know that a new user id needs to be
  // generated.
  const userId = currentUser ? currentUser.id : -1;
  const userName = currentUser ? currentUser.name : "";
  const userBirthday = currentUser ? stringifyBirthday(currentUser.birthday) : "";
  const showUsersTable = database.users.length !== 0;
  const usersList = database.users;


  res.send(`
    <style>${css}</style>
    <div class="container">
      <h1>Hi There!</h1>
      <p>Welcome to a very, <i>very</i> simple website!</p>

      <form action="" method="post">
        <h2>Add User</h2>

        ${showConfirmUserCreated ? (`
          <div style="margin: 1rem 0;">
            <span class="ok">user ${nextUserId} was created</span>
            <a href="/">dismiss</a>
          </div>
        `) : ''}

        ${showMissingRequiredFields ? (`
          <div style="margin: 1rem 0;">
            <span class="warn">required fields were missing</span>
            <a href="/">dismiss</a>
          </div>
          `) : ''}

        <input type="hidden" name="id" value="${userId}" />

        <label for="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="name"
          value="${userName}"
        />

        <label for="birthday">Birthday</label>
        <input
          id="birthday"
          name="birthday"
          type="date"
          value="${userBirthday}"
        />

        <button>save</button>
      </form>

      ${
        showUsersTable
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
              ${usersList.map(
                ({ id, name, birthday }) => `
                <tr>
                  <td>${id}</td>
                  <td>${name}</td>
                  <td>${stringifyBirthday(birthday)}</td> <td>
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
