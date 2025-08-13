"use client";

import PersonalDetails from "@/components/patients/PersonalDetails";

export default function PersonalDetailsPage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <PersonalDetails />
      </div>
    );

}
