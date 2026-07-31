"use client";

import { useState } from "react";
import { PasswordLogin } from "./password-login";
import { AccountSelector } from "./account-selector";
import { DriveDashboard } from "./drive-dashboard";

export function FilesAuthWrapper({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <PasswordLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!selectedAccountId) {
    return <AccountSelector onSelect={setSelectedAccountId} />;
  }

  return (
    <DriveDashboard 
      accountId={selectedAccountId} 
      onSwitchAccount={() => setSelectedAccountId(null)} 
    />
  );
}
