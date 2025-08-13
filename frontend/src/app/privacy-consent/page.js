"use client";

import PrivacyConsent from "@/components/patients/PrivacyConsent";

export default function PrivacyConsentePage() {


  // Only render the content if authenticated
    return (
      <div className="mx-auto">
        <PrivacyConsent />
      </div>
    );

}
