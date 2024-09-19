"use client";

import { useState, useEffect } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CodeOutlined, ChevronRight, DvrOutlined } from "@mui/icons-material";
import Button from "@/_common/components/Button";
import Modal from "@/_common/components/Modal";
import PodCreationModal from "@/_common/components/workspace/PodCreationModal";
import { useGitHubIntegration } from "@/hooks/useGitHubIntegration";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { createClient } from "@/lib/supabase/supabase-client";
import { usePodCreationStore } from "@/contexts/PodCreationStoreContext";

export default function WorkspacePage() {
  const [hasWorkspaces, setHasWorkspaces] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { message } = useWebSocketContext();
  const { showNotification } = useNotificationContext();
  const reset = usePodCreationStore((state) => state.reset);

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const supabase = createClient();
      const data = await supabase.auth.getUser();
    };

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);
  }, []);
  const handleCreateWorkspace = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    reset(); // resets the pod creation modal data when the modal closes
    setIsModalOpen(false);
  };

  return (
    <div className="h-full">
      <div className="border-b border-border w-full h-11 flex items-center">
        <div className="ml-5 flex gap-2 items-center">
          <CodeOutlined fontSize="medium" className="text-tertiaryBorder" />
          <p className="text-xs text-accent">Team - Engineering</p>
          <ChevronRight fontSize="small" className="text-sidenav" />
          <p className="text-xs text-white">Virtual Workspaces</p>
        </div>
      </div>

      <div className="flex justify-center items-center h-[calc(100vh-44px)]">
        <div className="h-[600px] w-[1100px]">
          {hasWorkspaces ? (
            <div className="flex justify-between">
              <h1 className="text-accent text-2xl">Virtual Workspaces</h1>
              <Button
                text={"Create new workspace"}
                type={"button"}
                colorType="tertiary"
                size="small"
                handleClick={handleCreateWorkspace}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center text-center max-w-[400px]">
                <DvrOutlined
                  style={{ fontSize: "50px" }}
                  className="text-white text-5xl mb-6"
                />
                <h1 className="text-white text-md mb-2">Virtual Workspaces</h1>
                <p className="text-sidenav text-[13px] mb-8">
                  Workspaces give your team a dedicated space to code,
                  collaborate, and manage projects. Install the Intra GitHub App
                  to start working efficiently and track progress in real-time.
                </p>
                <Button
                  text={"Create new workspace"}
                  type={"button"}
                  size="small"
                  colorType="tertiary"
                  handleClick={handleCreateWorkspace}
                  className="mt-10"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <PodCreationModal onClose={handleCloseModal} />
      </Modal>
    </div>
  );
}
