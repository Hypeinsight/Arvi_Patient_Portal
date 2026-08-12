import { create } from "zustand";

const useIntakeStore = create((set, get) => ({
  // Session
  sessionId: null,
  patientType: null,
  screens: [],
  currentIndex: 0,

  // Form data — accumulated across steps, sent in one payload at the end
  formData: {
    appointment: null,
    consent: null,
    account: null,
    personal: null,
    clinic: null,
    medical: null,
    referral: null,
  },

  // Upload references returned by the server
  uploadedFiles: [],

  // OCR state — personal ID document only
  ocrPersonalText: null,        // raw string returned by backend
  uploadedPersonalFile: null,   // JS File object — lives in memory for this session

  ocrMedicalText: null,        // raw string returned by backend
  uploadedMedicalFile: null,   // JS File object — lives in memory for this session

  // Progress
  getProgress: () => {
    const { screens, currentIndex } = get();
    const countable = screens.filter((s) => s !== "all_set");
    const percent = countable.length
      ? Math.round((currentIndex / countable.length) * 100)
      : 0;
    return { percent, current: currentIndex, total: countable.length };
  },

  // Actions
  initSession: (sessionId, patientType, screens) =>
    set({ sessionId, patientType, screens, currentIndex: 0 }),

  updatePatientFlow: (patientType, screens) =>
    set((state) => {
      const currentScreen = state.screens[state.currentIndex];
      const nextIndex = screens.indexOf(currentScreen);
      return {
        patientType,
        screens,
        currentIndex: nextIndex >= 0 ? nextIndex : 0,
      };
    }),

  goNext: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.screens.length - 1), // To prevent going beyond the last screen
    })),

  goBack: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0), // To prevent going before the first screen
    })),

  saveStepData: (section, data) =>
    set((state) => ({
      formData: { ...state.formData, [section]: data },
    })),

  addUploadedFile: (file) =>
    set((state) => ({
      uploadedFiles: [...state.uploadedFiles, file],
    })),

  removeUploadedFile: (uploadId) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter((f) => f.upload_id !== uploadId),
    })),

  // OCR actions
  setPersonalOcrResult: (file, text) =>    // file = JS File object, text = raw OCR string
    set({ uploadedPersonalFile: file, ocrPersonalText: text }),

  clearPersonalOcrResult: () =>
    set({ uploadedPersonalFile: null, ocrPersonalText: null }),

  setMedicalOcrResult: (file, text) =>    // file = JS File object, text = raw OCR string
    set({ uploadedMedicalFile: file, ocrMedicalText: text }),

  clearMedicalOcrResult: () =>
    set({ uploadedMedicalFile: null, ocrMedicalText: null }),

  setPrefillData: (prefill) =>
    set((state) => ({
      formData: {
        ...state.formData,
        personal: prefill.personal ?? state.formData.personal,
        medical: prefill.medical ?? state.formData.medical,
        referral: prefill.referral ?? state.formData.referral,
      },
    })),

  clearFormData: () =>
    set({
      formData: {
        appointment: null,
        consent: null,
        account: null,
        personal: null,
        clinic: null,
        medical: null,
        referral: null,
      },
      uploadedFiles: [],
    }),

  reset: () =>
    set({
      sessionId: null,
      patientType: null,
      screens: [],
      currentIndex: 0,
      formData: {
        appointment: null,
        consent: null,
        account: null,
        personal: null,
        clinic: null,
        medical: null,
        referral: null,
      },
      uploadedFiles: [],
      ocrText: null,
      uploadedFile: null,
    }),
}));

export default useIntakeStore;
