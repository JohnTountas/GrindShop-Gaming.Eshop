import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskForm() {
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 1. Ελέγχει αν το πεδίο τίτλου είναι κενό ή περιέχει μόνο κενά. Αν ναι, δεν κάνει τίποτα.
  // 2. Καλείται η συνάρτηση addTask για να προσθέσει τον τίτλο του νέου task, την περιγραφή του και καθαρίζει τα πεδία "Τίτλου" και "Περιγραφής" μετά την υποβολή.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, description);
    setTitle("");
    setDescription("");
  };

  //Δημιουργία φόρμας. Δημιουργεί τα πεδία Τίτλου, Κειμένου και κουμπιού Submit.
  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Enter your task title here ..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="text-area"
        placeholder="Task description (Optional) ..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
}
