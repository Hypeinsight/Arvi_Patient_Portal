"use client";

import { useState } from "react";
import ProgressSteps from "@/components/ProgressSteps";
import ProgressIndicator from "@/components/ProgressIndicator";
import NavigationButtons from "@/components/NavigationButtons";
import Title from "../Title";
import SearchableSelect from "@/components/ui/SearchableSelect";
import useIntakeStore from "@/lib/intakeStore";
import { searchClinics, searchClinicDoctors } from "@/lib/api/clinics";
import {
  createClinicDetails,
  updateClinicDetails,
} from "@/lib/api/clinic_details";

export default function ClinicDetails({ onNext, onBack }) {
  const { formData: storeData, sessionId } = useIntakeStore();

  const [clinic, setClinic] = useState(() =>
    storeData.clinic
      ? { org_id: storeData.clinic.clinic_org_id, name: storeData.clinic.clinic_name }
      : null,
  );
  const [doctor, setDoctor] = useState(() =>
    storeData.clinic
      ? { doctor_id: storeData.clinic.doctor_id, name: storeData.clinic.doctor_name }
      : null,
  );
  const [errors, setErrors] = useState({});

  const handleClinicSelect = (selected) => {
    setClinic(selected);
    setDoctor(null);
    setErrors((prev) => ({ ...prev, clinic: "", doctor: "" }));
  };

  const handleDoctorSelect = (selected) => {
    setDoctor(selected);
    if (selected) setErrors((prev) => ({ ...prev, doctor: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!clinic) newErrors.clinic = "Please select a clinic.";
    if (!doctor) newErrors.doctor = "Please select a doctor.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    const payload = {
      clinic_org_id: clinic.org_id,
      clinic_name: clinic.name,
      doctor_id: doctor.doctor_id,
      doctor_name: doctor.name,
    };

    const data = storeData.clinic
      ? await updateClinicDetails(sessionId, payload)
      : await createClinicDetails(sessionId, payload);

    if (data.success) onNext(payload, "clinic");
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="pb-8">
        <div className="max-w-8xl mx-auto">
          <ProgressSteps />

          <div className="relative mt-4 bg-white rounded-4xl">
            <div className="relative z-10 p-4 md:p-8">
              <Title title="Clinic Details" />
              <ProgressIndicator />

              <div className="mt-8 mb-16">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Clinic*
                      </label>
                      <SearchableSelect
                        value={clinic}
                        onSelect={handleClinicSelect}
                        onSearch={searchClinics}
                        getOptionLabel={(item) => item.name}
                        getOptionValue={(item) => item.org_id}
                        placeholder="Search for a clinic"
                        error={errors.clinic}
                      />
                      {errors.clinic && (
                        <p className="text-red-500 text-sm mt-1">{errors.clinic}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                        Doctor*
                      </label>
                      <SearchableSelect
                        value={doctor}
                        onSelect={handleDoctorSelect}
                        onSearch={(query) => searchClinicDoctors(clinic?.org_id, query)}
                        getOptionLabel={(item) => item.name}
                        getOptionValue={(item) => item.doctor_id}
                        placeholder="Search for a doctor"
                        disabledPlaceholder="Select a clinic first"
                        disabled={!clinic}
                        error={errors.doctor}
                      />
                      {errors.doctor && (
                        <p className="text-red-500 text-sm mt-1">{errors.doctor}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <NavigationButtons onBack={onBack} onNext={handleNext} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
