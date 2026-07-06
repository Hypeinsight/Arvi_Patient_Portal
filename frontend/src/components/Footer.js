import React from "react";

export default function Footer() {
  return (
    <div className="flex gap-4 text-sm text-gray-600 px-4 md:px-8 lg:px-16">
      <button className="hover:text-gray-900 transition-colors underline">
        Privacy Policy
      </button>
      <span>|</span>
      <button className="hover:text-gray-900 transition-colors underline">
        Terms of Use
      </button>
    </div>
  );
}
