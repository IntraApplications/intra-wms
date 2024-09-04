"use client";

import { CodeOutlined, ChevronRight } from "@mui/icons-material";
import withAuth from "@/hoc/withAuth";

function WorkspacePage() {
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

      <div className="flex h-full justify-center items-center">
        <div className="bg-red-900 h-[600px] w-[1000px]"></div>
      </div>
    </div>
  );
}

export default withAuth(WorkspacePage);
