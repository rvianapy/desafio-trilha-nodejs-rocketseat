const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  
  if (!user) {
    return response.status(400).json({error: "User not found!"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  let user = {};
  
  const usernameAlreadyExists = users.some(user => user.username === username);
    
  if (usernameAlreadyExists) {
    return response.status(400).json(
      {
        error: "Username already exists!"
      }
    )
  } else {
    user = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: []
    }
  
    users.push(user);
  }

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  
  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);
  
  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const task = user.todos.find(todo => todo.id === id);
  
  if (task) {
    task.title = title;
    task.deadline = new Date(deadline);

    return response.status(200).json(task);

  } else {
    return response.status(404).json({ error: "Task not found!" });
  }
    
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find(todo => todo.id === id);
  
  if (task) {
    task.done = true;

    return response.status(200).json(task);

  } else {
    return response.status(404).json({ error: "Task not found!" });
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex(todo => todo.id === id);
  
  if (index !== -1) {
    user.todos.splice(index, 1);

    return user.todos.lenght > 0 ? response.status(200).json(user.todos) : response.status(204).send();
  }  
  
  return response.status(404).json({ error: "Task not found!" });
   
});

module.exports = app;