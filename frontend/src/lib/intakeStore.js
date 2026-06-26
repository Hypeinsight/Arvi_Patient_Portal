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
    medical: null,
    referral: null,
  },

  // Upload references returned by the server
  uploadedFiles: [],

  // OCR state — personal ID document only
  ocrText: null,        // raw string returned by backend
  uploadedFile: null,   // JS File object — lives in memory for this session

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

  goNext: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.screens.length - 1),
    })),

  goBack: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
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
  setOcrResult: (file, text) =>    // file = JS File object, text = raw OCR string
    set({ uploadedFile: file, ocrText: text }),

  clearOcrResult: () =>
    set({ uploadedFile: null, ocrText: null }),

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
        medical: null,
        referral: null,
      },
      uploadedFiles: [],
      ocrText: null,
      uploadedFile: null,
    }),
}));

export default useIntakeStore;