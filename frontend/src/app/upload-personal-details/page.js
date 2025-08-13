"use client";

import UploadPersonalDetails from "@/components/patients/UploadPersonalDetails";

export default function UploadPersonalDetailsPage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <UploadPersonalDetails />
      </div>
    );

}
