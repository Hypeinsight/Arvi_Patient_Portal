"use client";

import MainPage from "@/components/patients/MainPage";

export default function PatientsPage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <MainPage />
      </div>
    );

}
