import React from "react";
import { TaskProvider } from "./context/TaskContext";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskFilter from "./components/TaskFilter";
import "./styles.css";

export default function App() {
  return (
    <TaskProvider>
      <div className="app-container">
        <div className="app-card">
          <h1 className="app-title">TODO Management App ✅</h1>
          <TaskForm />
          <TaskFilter />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}
