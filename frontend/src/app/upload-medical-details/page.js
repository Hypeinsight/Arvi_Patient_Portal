"use client";

import UploadMedicalDetails from "@/components/patients/UploadMedicalDetails";

export default function UploadMedicalDetailsPage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <UploadMedicalDetails />
      </div>
    );

}
