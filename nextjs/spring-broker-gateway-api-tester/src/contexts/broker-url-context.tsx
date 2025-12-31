'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BrokerUrlContextType {
  brokerUrl: string;
  setBrokerUrl: (url: string) => void;
}

const BrokerUrlContext = createContext<BrokerUrlContextType | undefined>(undefined);

export function BrokerUrlProvider({ children }: { children: ReactNode }) {
  const [brokerUrl, setBrokerUrl] = useState<string>(() => {
    // Return a default value during SSR, we'll update it on the client side
    // This prevents localStorage access during server-side rendering
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_BROKER_SERVICE_URL ||
             process.env.BROKER_SERVICE_URL ||
             'http://localhost:8080/api/broker/submitRequest';
    }

    // On the client, check localStorage first
    const savedUrl = localStorage.getItem('brokerUrl');
    if (savedUrl) {
      return savedUrl;
    }

    // Fallback to environment variable or default
    return process.env.NEXT_PUBLIC_BROKER_SERVICE_URL ||
           process.env.BROKER_SERVICE_URL ||
           'http://localhost:8080/api/broker/submitRequest';
  });

  // Update the state after hydration to ensure we have the correct value from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('brokerUrl');
      if (savedUrl && savedUrl !== brokerUrl) {
        setBrokerUrl(savedUrl);
      }
    }
  }, []);

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