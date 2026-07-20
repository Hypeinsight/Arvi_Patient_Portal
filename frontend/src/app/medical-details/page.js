"use client";

import MedicalDetails from "@/components/patients/MedicalDetails";

export default function MedicalDetailsPage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <MedicalDetails />
      </div>
    );

}
