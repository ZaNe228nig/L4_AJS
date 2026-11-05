const https = require('https');

const BASE_URL = 'https://jsonplaceholder.typicode.com';

function sortPostsByTitleLengthDesc(posts) {
  return [...posts].sort((a, b) => b.title.length - a.title.length);
}

function sortCommentsByAuthorName(comments) {
  return [...comments].sort((a, b) => a.name.localeCompare(b.name));
}

function pickUserFields({ id, name, username, email, phone }) {
  return { id, name, username, email, phone };
}

function pickFieldsFromUsers(users) {
  return users.map(pickUserFields);
}

function filterUncompletedTodos(todos) {
  return todos.filter((todo) => !todo.completed);
}

function requestWithCallback(path, callback) {
  https
    .get(`${BASE_URL}${path}`, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          callback(null, JSON.parse(raw));
        } catch (err) {
          callback(err);
        }
      });
    })
    .on('error', callback);
}

function getSortedPostsCallback(callback) {
  requestWithCallback('/posts', (err, posts) => {
    if (err) return callback(err);
    callback(null, sortPostsByTitleLengthDesc(posts));
  });
}

function getSortedCommentsCallback(callback) {
  requestWithCallback('/comments', (err, comments) => {
    if (err) return callback(err);
    callback(null, sortCommentsByAuthorName(comments));
  });
}

function requestWithPromise(path) {
  return fetch(`${BASE_URL}${path}`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
  });
}

function getUsersPromise() {
  return requestWithPromise('/users').then(pickFieldsFromUsers);
}

function getUncompletedTodosPromise() {
  return requestWithPromise('/todos').then(filterUncompletedTodos);
}

async function requestAsync(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

async function getSortedPostsAsync() {
  const posts = await requestAsync('/posts');
  return sortPostsByTitleLengthDesc(posts);
}

async function getSortedCommentsAsync() {
  const comments = await requestAsync('/comments');
  return sortCommentsByAuthorName(comments);
}

async function getUsersAsync() {
  const users = await requestAsync('/users');
  return pickFieldsFromUsers(users);
}

async function getUncompletedTodosAsync() {
  const todos = await requestAsync('/todos');
  return filterUncompletedTodos(todos);
}

function runCallbacks() {
  getSortedPostsCallback((err, posts) => {
    if (err) return console.error('[callback] posts:', err);
    console.log('[callback] posts (top 3):', posts.slice(0, 3));
  });

  getSortedCommentsCallback((err, comments) => {
    if (err) return console.error('[callback] comments:', err);
    console.log('[callback] comments (top 3):', comments.slice(0, 3));
  });
}

function runPromises() {
  getUsersPromise()
    .then((users) => console.log('[promise] users (top 3):', users.slice(0, 3)))
    .catch((err) => console.error('[promise] users:', err));

  getUncompletedTodosPromise()
    .then((todos) => console.log('[promise] todos (top 3):', todos.slice(0, 3)))
    .catch((err) => console.error('[promise] todos:', err));
}

async function runAsync() {
  try {
    const [posts, comments, users, todos] = await Promise.all([
      getSortedPostsAsync(),
      getSortedCommentsAsync(),
      getUsersAsync(),
      getUncompletedTodosAsync(),
    ]);
    console.log('[async] posts (top 3):', posts.slice(0, 3));
    console.log('[async] comments (top 3):', comments.slice(0, 3));
    console.log('[async] users (top 3):', users.slice(0, 3));
    console.log('[async] todos (top 3):', todos.slice(0, 3));
  } catch (err) {
    console.error('[async] error:', err);
  }
}

runCallbacks();
runPromises();
runAsync();
