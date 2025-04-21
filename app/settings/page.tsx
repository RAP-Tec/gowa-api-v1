"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/app/components/login-dialog";

export default function SettingsPage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Show login dialog if not authenticated
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      {isAuthenticated ? (
        <div className="space-y-6">
          {/* Your settings content here */}
          <p>Conteúdo das configurações aqui...</p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Autenticação necessária para acessar esta página.</p>
        </div>
      )}

      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

