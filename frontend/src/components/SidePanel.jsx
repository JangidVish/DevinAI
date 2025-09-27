import React from "react";
import userAvatar from "../assets/userAvatar.webp";
import toast from "react-hot-toast";
import api from "../config/axios";

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
      className={`sidePanel w-80 h-full absolute bg-gradient-to-b from-indigo-400/80 to-blue-200/80 transition-all duration-300 top-0 z-50 ${
        sidePanel ? "right-0" : "right-[-320px]"
      } flex flex-col`}
    >
      <header className="flex justify-between p-4  bg-indigo-400 text-white items-center">
        <button
          className="text-lg font-serif flex items-center gap-2"
          onClick={() => setAddCollaborator(true)}
        >
          <i className="ri-user-add-fill text-white" /> Add Collaborators
        </button>
        <button onClick={() => setSidePanel(false)}>
          <i className="ri-close-large-line font-bold text-black" />
        </button>
      </header>
      <div className="user-tiles mt-2 flex flex-col gap-2 flex-grow">
        {project.users?.map((u, index) => (
          <div
            key={u._id || index}
            className="tile w-full bg-indigo-300 hover:bg-indigo-400 rounded flex gap-4 items-center flex-row justify-between px-4"
          >
            <div className="flex flex-row justify-center items-center ">
              <div className="avatar p-2">
                <div className="w-12 rounded-full">
                  <img src={userAvatar} alt="avatar" />
                </div>
              </div>
              <div className="name font-semibold text-black">
                {u.username || "user@gmail.com"}
              </div>
            </div>

            <div
              className="remove collaborater px-10"
              onClick={() => handleRemoveCollaborator(u._id)}
            >
              <i className="ri-delete-bin-line text-red-700 text-xl cursor-pointer"></i>
            </div>
          </div>
        ))}
      </div>
      <div className="tile w-full text-white bg-red-400 rounded-2xl rounded-b-none justify-center p-2 text-lg mt-2 flex items-center">
        <button onClick={handleDelete} className="w-full">
          <i className="ri-delete-bin-line text-xl " /> Delete Project
        </button>
      </div>
    </div>
  );
};

export default SidePanel;
