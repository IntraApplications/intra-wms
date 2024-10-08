import { createStore } from "zustand/vanilla";

export type EnvironmentVariable = {
  key: string;
  value: string;
};

export type EnvironmentAnalysisData = {
  notes: string;
  projectType: string;
  languageVersion: string;
  dependencies: string[];
  environmentVariables: EnvironmentVariable[];
  dockerfile: string;
  startupCommands: string[];
  ports: number[];
};

export type PodCreationState = {
  vcs: string;
  repositoryName: string;
  repositoryURL: string;
  repositoryDir: string;
  environmentAnalysis: EnvironmentAnalysisData;
};

export type PodCreationActions = {
  setVCS: (vcs: string) => void;
  setRepositoryName: (name: string) => void;
  setRepositoryDir: (dir: string) => void;
  setRepositoryURL: (url: string) => void;
  setEnvironmentAnalysis: (data: Partial<EnvironmentAnalysisData>) => void;
  reset: () => void;
};

export type PodCreationStore = PodCreationState & PodCreationActions;

const initialState: PodCreationState = {
  vcs: "",
  repositoryName: "",
  repositoryDir: "",
  repositoryURL: "",
  environmentAnalysis: {
    notes: "",
    projectType: "",
    languageVersion: "",
    dependencies: [],
    environmentVariables: [],
    dockerfile: "",
    ports: [],
    startupCommands: [],
  },
};

export const createPodCreationStore = () =>
  createStore<PodCreationStore>()((set) => ({
    ...initialState,
    setVCS: (vcs) => set({ vcs }),
    setRepositoryName: (repositoryName) => set({ repositoryName }),
    setRepositoryDir: (repositoryDir) => set({ repositoryDir }),
    setRepositoryURL: (repositoryURL) => set({ repositoryURL }),
    setEnvironmentAnalysis: (data) =>
      set((state) => ({
        environmentAnalysis: { ...state.environmentAnalysis, ...data },
      })),
    reset: () => set(initialState),
  }));
