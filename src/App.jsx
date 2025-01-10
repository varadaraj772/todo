import "./index.css";
import { useState, useEffect } from "react";
function App() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [deletedTodo, setDeletedTodo] = useState(null);
  const [deleteTimeout, setDeleteTimeout] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (deletedTodo) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      const timeoutId = setTimeout(() => {
        setDeletedTodo(null);
        setSecondsLeft(5);
      }, 5000);
      setDeleteTimeout(timeoutId);
      return () => {
        clearInterval(interval);
        clearTimeout(timeoutId);
      };
    }
  }, [deletedTodo]);

  const handleSubmit = () => {
    if (text.trim() && text.length <= 100) {
      const newTodo = {
        id: Date.now().toString(),
        title: text,
        completed: false,
        dueDate: null,
        priority: "medium",
      };
      setTodos([...todos, newTodo]);
      setText("");
    }
  };

  const handleDelete = (id) => {
    const deleted = todos.find((todo) => todo.id === id);
    setDeletedTodo(deleted);
    setTodos(todos.filter((todo) => todo.id !== id));
    setSecondsLeft(5);
  };

  const handleUndoDelete = () => {
    if (deletedTodo) {
      setTodos([...todos, deletedTodo]);
      setDeletedTodo(null);
      clearTimeout(deleteTimeout);
      setSecondsLeft(5);
    }
  };

  const handleEdit = (id, title) => {
    setEditingId(id);
    setEditText(title);
  };

  const handleSave = (id) => {
    if (editText.trim() && editText.length <= 100) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, title: editText } : todo
        )
      );
      setEditingId(null);
      setEditText("");
    }
  };

  const toggleCompletion = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Todo App</h1>
      <div style={styles.form}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new todo (max 100 chars)"
          style={styles.input}
          maxLength={100}
        />
        <button onClick={handleSubmit} style={styles.button}>
          Add Todo
        </button>
      </div>
      <div style={styles.filters}>
        <button
          onClick={() => setFilter("all")}
          style={{
            ...styles.button,
            backgroundColor: filter === "all" ? "#007bff" : "#ccc",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          style={{
            ...styles.button,
            backgroundColor: filter === "active" ? "#007bff" : "#ccc",
          }}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{
            ...styles.button,
            backgroundColor: filter === "completed" ? "#007bff" : "#ccc",
          }}
        >
          Completed
        </button>
        <button
          onClick={clearCompleted}
          style={{ ...styles.button, backgroundColor: "#ff4444" }}
        >
          Clear Completed
        </button>
      </div>
      <div style={styles.todoList}>
        {filteredTodos.map((todo) => (
          <div key={todo.id} style={styles.todoItem}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleCompletion(todo.id)}
              style={styles.checkbox}
            />
            {editingId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={styles.input}
                  maxLength={100}
                />
                <button
                  onClick={() => handleSave(todo.id)}
                  style={styles.button}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    ...styles.todoText,
                    textDecoration: todo.completed ? "line-through" : "none",
                    color: todo.completed ? "#888" : "#333",
                  }}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => handleEdit(todo.id, todo.title)}
                  style={styles.button}
                >
                  Edit
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(todo.id)}
              style={{ ...styles.button, backgroundColor: "#ff4444" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {deletedTodo && (
        <div style={styles.undoContainer}>
          <span>Todo deleted: {deletedTodo.title}</span>
          <button onClick={handleUndoDelete} style={styles.button}>
            Undo ({secondsLeft}s)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    color: "#333",
  },
  form: {
    display: "flex",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginRight: "8px",
  },
  button: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    marginLeft: "8px",
  },
  filters: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  todoList: {
    marginTop: "20px",
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  todoText: {
    flex: 1,
    marginRight: "10px",
  },
  checkbox: {
    marginRight: "10px",
  },
  undoContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    marginTop: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
};
