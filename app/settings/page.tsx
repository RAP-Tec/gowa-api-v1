"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/app/components/login-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      setShowLoginDialog(true);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    // Force a re-render after successful login
    window.location.reload();
  };

  // If still loading, show minimal content
  if (isLoading) {
    return <div className="container mx-auto py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
      
      {isAuthenticated ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da API</CardTitle>
              <CardDescription>Gerencie as configurações da sua API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">URL da API Evolution</h3>
                  <p className="text-sm text-muted-foreground">{process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "Não configurado"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Chave de Autenticação</h3>
                  <p className="text-sm text-muted-foreground">
                    {process.env.AUTH_KEY ? "Configurado" : "Não configurado"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Usuário Administrador</h3>
                  <p className="text-sm text-muted-foreground">{process.env.LOGIN_ADMIN || "Não configurado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Autenticação necessária para acessar esta página.</p>
        </div>
      )}

      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={(open) => {
          setShowLoginDialog(open);
          // If dialog is closed without successful login, redirect to home
          if (!open && !isAuthenticated) {
            router.push('/');
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

