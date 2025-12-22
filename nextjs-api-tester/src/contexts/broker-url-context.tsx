'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BrokerUrlContextType {
  brokerUrl: string;
  setBrokerUrl: (url: string) => void;
}

const BrokerUrlContext = createContext<BrokerUrlContextType | undefined>(undefined);

export function BrokerUrlProvider({ children }: { children: ReactNode }) {
  const [brokerUrl, setBrokerUrl] = useState<string>(() => {
    // Check if we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('brokerUrl');
      if (savedUrl) {
        return savedUrl;
      }
    }
    // Fallback to environment variable or default
    return process.env.NEXT_PUBLIC_BROKER_SERVICE_URL || 
           process.env.BROKER_SERVICE_URL || 
           'http://localhost:8080/api/broker/submitRequest';
  });

  return (
    <BrokerUrlContext.Provider value={{ brokerUrl, setBrokerUrl }}>
      {children}
    </BrokerUrlContext.Provider>
  );
}

export function useBrokerUrl() {
  const context = useContext(BrokerUrlContext);
  if (context === undefined) {
    throw new Error('useBrokerUrl must be used within a BrokerUrlProvider');
  }
  return context;
}