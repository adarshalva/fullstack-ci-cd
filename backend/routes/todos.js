const express = require('express');
const router = express.Router();

let todoList = [
  { id: 1, text: "Sample Task 1" },
  { id: 2, text: "Sample Task 2" }
];

router.get('/', (req, res) => {
  res.json(todoList);
});

router.post('/', (req, res) => {
  const newTodo = { id: Date.now(), text: req.body.text };
  todoList.push(newTodo);
  res.status(201).json(newTodo);
});

router.delete('/:id', (req, res) => {
  todoList = todoList.filter(todo => todo.id !== parseInt(req.params.id));
  res.status(204).send();
});

module.exports = router;

