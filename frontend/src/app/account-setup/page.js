"use client";

import AccountSetup from "@/components/patients/AccountSetup";

export default function PersonalDetailsPage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <AccountSetup />
      </div>
    );

}
