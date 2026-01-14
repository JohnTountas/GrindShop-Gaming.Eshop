import React, { createContext, useContext, useState, useEffect } from "react";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Δημιουργία του Task με μοναδικό id, τίτλο, περιγραφή και εμφάνισής του πρώτο-πρώτο στην λίστα
  const addTask = (title, description) => {
    const newTask = {
      id: Date.now(),
      title,
      description,
      completed: false,
    };
    setTasks([newTask, ...tasks]); // Προσθέτει το νέο task στην αρχή της λίστας tasks
  };

  // Δημιουργία των functions για "Edit", "Delete" και "Complete"
  const editTask = (id, updatedTask) => {
    setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Task filtering implementation
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    return true;
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        addTask,
        editTask,
        deleteTask,
        toggleComplete,
        setFilter,
        filter,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
