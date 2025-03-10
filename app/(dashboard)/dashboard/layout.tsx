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

  { name: "Workspaces", icon: DvrOutlined },
  { name: "Worktrees", icon: AccountTreeOutlined },
  { name: "Marketplace", icon: StoreOutlined },
  { name: "Integrations", icon: AppsOutlined },
  { name: "Employees", icon: PeopleOutline },
  { name: "Onboarding", icon: SchoolOutlined },
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
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownClick = (index) => {
    setSelectedDropdownItem(index);
    setDropdownOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-dashboard">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-primary z-20 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-52" : "w-[68px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="w-full rounded-[3px] h-full p-3 border-border">
          {/* Logo */}
          <div className="flex items-center mt-2 ml-1">
            <div className="flex rounded-[3px] bg-secondary justify-center items-center h-8 w-8">
              <Image
                src={IntraLogo}
                alt="Intra Logo"
                width={20}
                height={20}
                className=""
              />
            </div>
            {/*
            <span
              className={`ml-3 font-medium text-white transition-all duration-300 ease-in-out ${
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              Intra app
            </span>
            */}
          </div>
          {/* Dropdown */}
          <div className="relative mb-4 mt-6">
            <div
              className={`flex items-center justify-between bg-dashboard border border-border p-2 rounded-[3px] cursor-pointer transition-all duration-300 ease-in-out`}
              onClick={toggleDropdown}
            >
              <div className="flex items-center">
                {(() => {
                  const SelectedIcon = dropdownItems[selectedDropdownItem].icon;
                  return (
                    <SelectedIcon
                      className="text-tertiaryBorder"
                      fontSize="small"
                    />
                  );
                })()}

                <p
                  className={`text-white font-semibold text-xs ml-2 transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  }`}
                >
                  {dropdownItems[selectedDropdownItem].name}
                </p>
              </div>
              {isExpanded && (
                <ExpandMore
                  className={`text-white transform transition-all duration-300 ease-in-outm ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fontSize="small"
                />
              )}
            </div>
            {isExpanded && dropdownOpen && (
              <div className="absolute w-full bg-secondary mt-2 rounded-[3px] shadow-lg z-10 transition-all duration-300 ease-in-out">
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
          {/* Navigation Items */}
          <div className="w-full  grid gap-2">
            {navItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded-[3px] cursor-pointer ${
                  activeIndex === index
                    ? "bg-secondary text-white"
                    : "text-sidenav"
                } hover:bg-secondary hover:text-white transition-all duration-300 ease-in-out`}
                onClick={() => setActiveIndex(index)}
              >
                <div className=" flex justify-center ">
                  <item.icon fontSize="small" className="ml-1" />
                </div>
                <div
                  className={` overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out mr-0`}
                  style={{
                    maxWidth: isExpanded ? "100px" : "0px",
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <p
                    className={`font-medium text-xs ml-2 transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2"
                    }`}
                  >
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="ml-[56px] h-full w-full p-3 bg-primary flex items-center transition-all duration-300 ease-in-out">
        <div className="h-full w-full bg-dashboard rounded-md border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
