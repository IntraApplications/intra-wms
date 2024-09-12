"use client";
import { useState } from "react";
import {
  HomeOutlined,
  PeopleOutline,
  SchoolOutlined,
  StoreOutlined,
  DvrOutlined,
  AccountTreeOutlined,
  AppsOutlined,
  CodeOutlined,
  Brush,
  Campaign,
  ExpandMore,
} from "@mui/icons-material";
import Image from "next/image";
import IntraLogo from "@/_assets/intra-icon-large-transparent.png";
import { createClient } from "@/lib/supabase/supabase-client";
import { redirect } from "next/navigation";

const navItems = [
  { name: "Home", icon: HomeOutlined },
  { name: "Employees", icon: PeopleOutline },
  { name: "Onboarding", icon: SchoolOutlined },
  { name: "Marketplace", icon: StoreOutlined },
  { name: "Workspaces", icon: DvrOutlined },
  { name: "Worktrees", icon: AccountTreeOutlined },
  { name: "Integrations", icon: AppsOutlined },
];

const dropdownItems = [
  { name: "Engineering", icon: CodeOutlined },
  { name: "Design", icon: Brush },
  { name: "Marketing", icon: Campaign },
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDropdownItem, setSelectedDropdownItem] = useState(0);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownClick = (index) => {
    setSelectedDropdownItem(index);
    setDropdownOpen(false);
  };

  return (
    <div className="flex h-screen w-screen flex-row bg-dashboard">
      <div className="bg-primary w-52 rounded-md pr-0 p-3">
        <div className="w-full rounded-[3px] h-full">
          <div className="flex items-center ml-1 mt-2">
            <div className="flex rounded-[3px] bg-secondary justify-center items-center mr-2 h-8 w-8">
              <Image
                src={IntraLogo}
                alt="Intra Logo"
                width={20}
                height={20}
                className=""
              />
            </div>
            <p className="text-white text-md font-medium">Intra app</p>
          </div>
          <div className="relative mb-4 mt-6">
            <div
              className="flex items-center justify-between bg-dashboard border border-border px-2 py-3 rounded-[3px] cursor-pointer"
              onClick={toggleDropdown}
            >
              <div className="flex items-center ml-0.5">
                {/* Render the selected dropdown icon with size control */}
                {(() => {
                  const SelectedIcon = dropdownItems[selectedDropdownItem].icon;
                  return (
                    <SelectedIcon
                      className="text-tertiaryBorder mr-2"
                      fontSize="small"
                    />
                  );
                })()}
                <p className="text-white font-semibold text-xs">
                  {dropdownItems[selectedDropdownItem].name}
                </p>
              </div>
              <ExpandMore
                className={`text-white transform transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
                fontSize="small"
              />
            </div>
            {dropdownOpen && (
              <div className="absolute w-full bg-secondary mt-2 rounded-[3px] shadow-lg z-10">
                {dropdownItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleDropdownClick(index)}
                  >
                    <item.icon className="text-white mr-2" fontSize="small" />
                    <p className="text-white font-normal text-sm">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-full grid gap-2 ml">
            {navItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded-[3px] cursor-pointer ${
                  activeIndex === index
                    ? "bg-secondary text-white"
                    : "text-sidenav"
                } hover:bg-secondary hover:text-white transition-all duration-100`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="w-7 mr-2 flex justify-center">
                  <item.icon fontSize="small" />
                </div>
                <p className="font-medium text-xs">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-full w-full p-3 bg-primary flex items-center">
        <div className="h-full w-full bg-dashboard rounded-md border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
