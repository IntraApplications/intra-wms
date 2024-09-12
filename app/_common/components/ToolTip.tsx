import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div className="relative inline-block" ref={targetRef}>
      {React.cloneElement(children, {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
        "aria-describedby": "tooltip",
      })}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg"
          style={{
            top: "calc(100% + 5px)",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: "150px",
          }}
        >
          <div className="flex flex-col space-y-1">
            {React.Children.map(content, (item, index) => (
              <div key={index} className="flex items-center space-x-2">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
