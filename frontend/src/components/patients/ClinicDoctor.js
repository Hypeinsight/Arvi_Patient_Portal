"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import ProgressSteps from "@/components/ProgressSteps";
import NavigationButtons from "@/components/NavigationButtons";
import InfoCard from "../InfoCard";
import Title from "../Title";
import useIntakeStore from "@/lib/intakeStore";
import { getClinics, getDoctors, selectDoctor } from "@/lib/api/clinics";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const triggerClass = (hasValue) =>
  `w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-poppins focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    hasValue ? "text-gray-900" : "text-gray-300"
  }`;

// Shown in place of a dropdown when its list can't be loaded
function LoadError({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 border border-red-200 bg-red-50 rounded-lg text-sm font-poppins text-red-700">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1 shrink-0 font-medium cursor-pointer hover:underline"
      >
        <RotateCw className="w-3.5 h-3.5" />
        Try again
      </button>
    </div>
  );
}

function LoadingField({ text }) {
  return (
    <div className="flex items-center gap-2 h-10 px-4 border border-gray-200 rounded-lg text-sm font-poppins text-gray-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      {text}
    </div>
  );
}

export default function ClinicDoctor({ onNext, onBack }) {
  const { sessionId, formData } = useIntakeStore();

  // Returning patients start with the clinic and doctor from their last intake
  const [organizationId, setOrganizationId] = useState(
    formData.doctor?.organization_id ?? "",
  );
  const [doctorId, setDoctorId] = useState(formData.doctor?.doctor_id ?? "");

  const [clinics, setClinics] = useState([]);
  const [clinicsStatus, setClinicsStatus] = useState("loading");
  const [doctors, setDoctors] = useState([]);
  const [doctorsStatus, setDoctorsStatus] = useState("idle");
  const [saving, setSaving] = useState(false);

  const loadClinics = useCallback(async () => {
    setClinicsStatus("loading");
    try {
      const data = await getClinics();
      if (!data.success) throw new Error(data.message);
      const list = data.clinics ?? [];
      setClinics(list);
      setClinicsStatus("ready");
      // Drop a remembered clinic that is no longer offered
      setOrganizationId((current) =>
        list.some((clinic) => String(clinic.id) === current) ? current : "",
      );
    } catch {
      setClinicsStatus("error");
    }
  }, []);

  const loadDoctors = useCallback(async (orgId) => {
    if (!orgId) {
      setDoctors([]);
      setDoctorsStatus("idle");
      return;
    }
    setDoctorsStatus("loading");
    try {
      const data = await getDoctors(orgId);
      if (!data.success) throw new Error(data.message);
      const list = data.doctors ?? [];
      setDoctors(list);
      setDoctorsStatus("ready");
      setDoctorId((current) =>
        list.some((doctor) => String(doctor.id) === current) ? current : "",
      );
    } catch {
      setDoctorsStatus("error");
    }
  }, []);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  useEffect(() => {
    loadDoctors(organizationId);
  }, [organizationId, loadDoctors]);

  const handleClinicChange = (value) => {
    setOrganizationId(value);
    setDoctorId("");
  };

  const handleNext = async () => {
    const clinic = clinics.find((c) => String(c.id) === organizationId);
    const doctor = doctors.find((d) => String(d.id) === doctorId);
    if (!clinic || !doctor) return;

    const payload = {
      organization_id: organizationId,
      organization_name: clinic.name,
      doctor_id: doctorId,
      doctor_name: doctor.name,
    };

    setSaving(true);
    try {
      const data = await selectDoctor(sessionId, payload);
      if (!data.success) {
        toast.error(data.message || "Could not save your clinic and doctor");
        return;
      }
      onNext(payload, "doctor");
    } catch {
      toast.error("Could not save your clinic and doctor. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-16">
      <div className="pb-8 short:pb-2">
        <div className="max-w-8xl mx-auto">
          <ProgressSteps />

          <div className="relative mt-4 short:mt-2 bg-white rounded-4xl">
            <div className="relative z-10 p-4 md:p-6 short:md:px-6 short:md:py-4 tall:p-8">
              <Title title="Choose Your Clinic & Doctor" />

              {/* No bottom margin: NavigationButtons adds its own top margin */}
              <div className="mt-5 short:mt-2 tall:mt-8">
                <InfoCard
                  title="Who should receive your details?"
                  description="Your intake summary will be sent securely to the doctor you choose, so they can prepare for your appointment."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 short:md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 short:mb-1 font-poppins">
                      Clinic<span className="text-red-500">*</span>
                    </label>
                    {clinicsStatus === "loading" ? (
                      <LoadingField text="Loading clinics..." />
                    ) : clinicsStatus === "error" ? (
                      <LoadError
                        message="Couldn't load clinics."
                        onRetry={loadClinics}
                      />
                    ) : (
                      <Select
                        value={organizationId}
                        onValueChange={handleClinicChange}
                        disabled={saving}
                      >
                        <SelectTrigger className={triggerClass(organizationId)}>
                          <SelectValue placeholder="Select Clinic" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinics.map((clinic) => (
                            <SelectItem key={clinic.id} value={String(clinic.id)}>
                              {clinic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 short:mb-1 font-poppins">
                      Doctor<span className="text-red-500">*</span>
                    </label>
                    {doctorsStatus === "loading" ? (
                      <LoadingField text="Loading doctors..." />
                    ) : doctorsStatus === "error" ? (
                      <LoadError
                        message="Couldn't load doctors."
                        onRetry={() => loadDoctors(organizationId)}
                      />
                    ) : (
                      <Select
                        value={doctorId}
                        onValueChange={setDoctorId}
                        disabled={!organizationId || saving}
                      >
                        <SelectTrigger className={triggerClass(doctorId)}>
                          <SelectValue
                            placeholder={
                              organizationId
                                ? "Select Doctor"
                                : "Choose a clinic first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={String(doctor.id)}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {doctorsStatus === "ready" && doctors.length === 0 && (
                      <p className="mt-1 text-xs text-gray-500 font-poppins">
                        No doctors are available at this clinic yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <NavigationButtons
                onBack={onBack}
                onNext={handleNext}
                isNextDisabled={!organizationId || !doctorId}
                loading={saving}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
