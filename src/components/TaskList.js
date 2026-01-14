import React from "react";
import { useTasks } from "../context/TaskContext";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const { filteredTasks } = useTasks();

  // Εμφάνιση όλων των tasks στην περιοχή "No tasks to display"
  return (
    <div className="task-list">
      {filteredTasks.length === 0 ? (
        <p className="no-tasks">No tasks to display.</p>
      ) : (
        filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)
      )}
    </div>
  );
}
