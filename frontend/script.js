const apiBase = 'http://localhost:4000/api/todos';

async function fetchTodos() {
  const res = await fetch(apiBase);
  const todos = await res.json();
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.textContent = todo.text;
    li.onclick = () => deleteTodo(todo.id);
    list.appendChild(li);
  });
}

async function addTodo() {
  const text = document.getElementById('new-todo').value;
  await fetch(apiBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  fetchTodos();
}

async function deleteTodo(id) {
  await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
  fetchTodos();
}

fetchTodos();

