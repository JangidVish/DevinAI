import React from "react";
import userAvatar from "../assets/userAvatar.webp";
import toast from "react-hot-toast";
import api from "../config/axios";
import "../styles/components/SidePanel.css";

const SidePanel = ({
  sidePanel,
  setSidePanel,
  setAddCollaborator,
  project,
  handleDelete,
  onCollaboratorRemoved,
}) => {
  const handleRemoveCollaborator = async (selectedUserId) => {
    try {
      const response = await api.delete("/project/remove-collaborator", {
        data: {
          projectId: project._id,
          userId: selectedUserId,
        },
      });
      toast.success("Collaborator removed successfully");
      // Refresh the project data to update the UI
      if (onCollaboratorRemoved) {
        onCollaboratorRemoved();
      }
    } catch (error) {
      return toast.error("Error removing collaborator: " + error.message);
    }
  };
  return (
    <div
      className={`side-panel ${
        sidePanel ? "side-panel--open" : "side-panel--closed"
      }`}
    >
      <header className="side-panel__header">
        <button
          className="side-panel__add-btn"
          onClick={() => setAddCollaborator(true)}
        >
          <i className="ri-user-add-fill text-white" /> Add Collaborators
        </button>
        <button
          className="side-panel__close-btn"
          onClick={() => setSidePanel(false)}
        >
          <i className="ri-close-large-line" />
        </button>
      </header>
      <div className="side-panel__user-list">
        {project.users?.map((u, index) => (
          <div key={u._id || index} className="side-panel__user-tile">
            <div className="side-panel__user-info">
              <div className="side-panel__avatar">
                <div className="side-panel__avatar-img">
                  <img src={userAvatar} alt="avatar" />
                </div>
              </div>
              <div className="side-panel__username">
                {u.username || "user@gmail.com"}
              </div>
            </div>

            <div
              className="side-panel__remove-btn"
              onClick={() => handleRemoveCollaborator(u._id)}
            >
              <i className="ri-delete-bin-line"></i>
            </div>
          </div>
        ))}
      </div>
      <div className="side-panel__delete-section">
        <button onClick={handleDelete} className="side-panel__delete-btn">
          <i className="ri-delete-bin-line" /> Delete Project
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
