"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
}

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // If already authenticated, close the dialog
  useEffect(() => {
    if (isAuthenticated && open) {
      onLoginSuccess();
    }
  }, [isAuthenticated, open, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        // Wait a moment before triggering success callback
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        setError("Credenciais inválidas. Por favor, tente novamente.");
      }
    } catch (err) {
      setError("Ocorreu um erro durante a autenticação. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Prevent closing the dialog by clicking outside if not authenticated
        if (!newOpen && !isAuthenticated) {
          // Allow the parent component to handle this
          onOpenChange(newOpen);
        } else if (isAuthenticated) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acesso Restrito</DialogTitle>
          <DialogDescription>
            Por favor, faça login para acessar as configurações.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}