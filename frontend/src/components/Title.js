import React from "react";

export default function Title({title, className = ""}) {
  return (
    <h2 className={`leading-6 text-base sm:text-2xl md:text-[1.75rem] 2xl:text-[2rem] font-medium text-gray-800 mb-4 2xl:mb-6 font-poppins ${className}`}>
      {title}
    </h2>
  );
}
