import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SetupConfig, GeneratedFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          filename: { type: Type.STRING, description: "Name of the file (e.g., install.R, setup.sh)" },
          language: { type: Type.STRING, description: "Programming language for syntax highlighting (r, bash, markdown)" },
          content: { type: Type.STRING, description: "The actual code content of the file" },
          description: { type: Type.STRING, description: "A short one-line description of what this file does" }
        },
        required: ["filename", "language", "content", "description"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "A brief summary of the environment strategy."
    }
  },
  required: ["files", "summary"]
};

export const generateREnvironment = async (config: SetupConfig): Promise<{ files: GeneratedFile[], summary: string }> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are a DevOps and Bioinformatics expert specializing in the UK Biobank Research Analysis Platform (UKB-RAP) and R.
    
    The user wants to set up an R environment on a UKB-RAP instance (typically Ubuntu-based).
    
    User Goal: ${config.goal}
    Requested R Packages: ${config.packages}
    R Version Preference: ${config.rVersion}
    Include Bioconductor: ${config.includeBioconductor}
    Include Tidyverse: ${config.includeTidyverse}

    Your task is to generate the necessary configuration files to establish this environment. 
    You MUST infer the necessary Linux system dependencies (via apt-get) required for the requested R packages (e.g., libxml2-dev for XML, libgdal-dev for sf).

    Please generate the following files:
    1. 'system_dependencies.sh': A bash script to update apt and install system libraries.
    2. 'install_packages.R': An R script to install CRAN and Bioconductor packages with error checking. Use 'renv' or 'remotes' if appropriate, or base install.packages. Set a CRAN mirror.
    3. 'startup_script.sh': A master shell script that calls the system update and then runs the R install script. This is what the user would run on instance startup.
    4. 'README.md': Instructions on how to use these files on UKB-RAP (e.g., uploading to the project, running via tty or Cloud Workstation).

    Ensure the code is production-ready, handles errors, and is specifically tailored for the UKB-RAP environment constraints.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for deterministic code generation
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};