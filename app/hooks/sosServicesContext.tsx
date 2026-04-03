import React, { createContext, useState, useContext } from "react";

interface SOSContextType {
  isLocationSharing: boolean;
  setIsLocationSharing: React.Dispatch<React.SetStateAction<boolean>>;
  isVideoRecording: boolean;
  setIsVideoRecording: React.Dispatch<React.SetStateAction<boolean>>;
  isAudioRecording: boolean;
  setIsAudioRecording: React.Dispatch<React.SetStateAction<boolean>>;
  stealthMode: boolean;
  setStealthMode: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a proper initial value
export const sosChoicesContext = createContext<SOSContextType>({
  isLocationSharing: false,
  setIsLocationSharing: () => undefined,  // Changed to proper no-op function
  isVideoRecording: false,
  setIsVideoRecording: () => undefined,
  isAudioRecording: false,
  setIsAudioRecording: () => undefined,
  stealthMode: false,
  setStealthMode: () => undefined,
});

// Provider Component
export const SOSChoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);

  return (
    <sosChoicesContext.Provider
      value={{
        isLocationSharing,
        setIsLocationSharing,
        isVideoRecording,
        setIsVideoRecording,
        isAudioRecording,
        setIsAudioRecording,
        stealthMode,
        setStealthMode,
      }}
    >
      {children}
    </sosChoicesContext.Provider>
  );
};

// Custom Hook for accessing the context
export const useSOSChoicesContext = () => {
  const context = useContext(sosChoicesContext);
  if (!context) {
    throw new Error('useSOSChoicesContext must be used within a SOSChoicesProvider');
  }
  return context;
};
