"use client";

import AppointmentType from "@/components/patients/AppointmentType";

export default function AppointmentTypePage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <AppointmentType />
      </div>
    );

}
