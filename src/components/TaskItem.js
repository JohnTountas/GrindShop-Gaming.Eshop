import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";

export default function TaskItem({ task }) {
  const { deleteTask, toggleComplete, editTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  // Καλείται η συνάρτηση editTask και ενημερώνει το task με το συγκεκριμένο id,
  // περνώντας ένα νέο αντικείμενο που περιέχει όλα τα υπάρχοντα δεδομένα του task,
  // με ενημερωμένο τίτλο και περιγραφή από τα editTitle και editDescription.
  const handleEdit = () => {
    editTask(task.id, {
      ...task,
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  // Δημιουργία και λειτουργία φόρμας Editing των tasks και των κουμπιών "save" , "Cancel".

  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      {isEditing ? (
        <>
          <input
            type="text"
            placeholder="Title Update..."
            className="task-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <textarea
            placeholder="Text Update..."
            className="task-area"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <div className="btn-group">
            <button className="save" onClick={handleEdit}>
              Save
            </button>
            <button className="cancel" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        // Δημιουργία και λειτουργία κουμπιών "Undo","Complete", "Edit","Delete"
        <>
          <div className="task-header">
            <h3>{task.title}</h3>
            <div className="task-actions">
              <button onClick={() => toggleComplete(task.id)}>
                {task.completed ? "Undo" : "Complete"}
              </button>
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </div>
          <p>{task.description}</p>
        </>
      )}
    </div>
  );
}
