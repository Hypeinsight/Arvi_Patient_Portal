import React from "react";

export default function Title({title, className = ""}) {
  return (
    <h2 className={`leading-6 tracking-tight text-base sm:text-2xl md:text-[1.75rem] 2xl:text-[2rem] short:md:text-2xl font-medium text-gray-800 mb-4 2xl:mb-6 short:mb-2 font-poppins ${className}`}>
      {title}
    </h2>
  );
}
