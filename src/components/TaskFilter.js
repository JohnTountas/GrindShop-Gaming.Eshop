import React from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskFilter() {
  const { filter, setFilter, tasks } = useTasks();

  // Γίνεται η μέτρηση όλων των tasks και εμφανίζει δίπλα από κάθε φίλτρο, την ποσότητα που περιέχει. π.χ "All (1)"
  const counts = {
    All: tasks.length,
    Completed: tasks.filter((t) => t.completed).length,
    Incomplete: tasks.filter((t) => !t.completed).length,
  };

  // Εμφανίζει τα φίλτρα "All", "Completed" και "Incomplete" με τα emoji τους και τον αριθμό των Tasks που έχει αποθηκεύσει το καθένα τους.
  return (
    <div className="task-filter">
      <button
        onClick={() => setFilter("all")}
        className={filter === "all" ? "active" : ""}
      >
        🥇 All ({tasks.length})
      </button>
      <button
        onClick={() => setFilter("completed")}
        className={filter === "completed" ? "active" : ""}
      >
        ✅ Completed ({tasks.filter((t) => t.completed).length})
      </button>
      <button
        onClick={() => setFilter("incomplete")}
        className={filter === "incomplete" ? "active" : ""}
      >
        ⚠️ Incomplete ({tasks.filter((t) => !t.completed).length})
      </button>
    </div>
  );
}
