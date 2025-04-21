// Biblioteca auxiliar para interagir com a API Evolution

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  steps?: string
}

interface Instance {
  instanceName: string
  instanceId?: string
  status: "connected" | "disconnected" | "connecting"
  number?: string
}

// URL base da API Evolution
const API_BASE_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
const API_KEY = process.env.EVOLUTION_API_KEY || ""

// Função auxiliar para fazer requisições à API
async function fetchFromApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    apikey: API_KEY,
    ...options.headers,
  }

  console.log(`Fazendo requisição para: ${url}`)

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Erro na API (${response.status}):`, errorText)

    try {
      const errorJson = JSON.parse(errorText)
      throw new Error(errorJson.message || errorJson.error || `Erro ${response.status}`)
    } catch (e) {
      throw new Error(`Erro ${response.status}: ${errorText}`)
    }
  }

  return response.json()
}

// Objeto com métodos para interagir com a API Evolution
export const evolutionApi = {
  // Listar instâncias
  async listInstances(): Promise<ApiResponse<Instance[]>> {
    try {
      const response = await fetchFromApi<any>("/instance/fetchInstances")
      console.log("Resposta da API:", JSON.stringify(response, null, 2))

      let instances: Instance[] = []

      // Verificar se a resposta é um array (formato observado nos logs)
      if (Array.isArray(response)) {
        instances = response.map((item: any) => ({
          instanceName: item.name || "unknown",
          instanceId: item.id || item.name || "unknown",
          status: mapStatusFromApi(item.connectionStatus || "disconnected"),
          number: item.number || undefined,
        }))
      }
      // Verificar outros formatos possíveis
      else if (response.instances && Array.isArray(response.instances)) {
        instances = response.instances.map((item: any) => ({
          instanceName: item.instance?.instanceName || item.instance?.name || "unknown",
          instanceId:
            item.instance?.instanceId ||
            item.instance?.id ||
            item.instance?.instanceName ||
            item.instance?.name ||
            "unknown",
          status: mapStatusFromApi(item.instance?.status || item.instance?.connectionStatus || "disconnected"),
          number: item.instance?.number || undefined,
        }))
      }
      // Formato de objeto com chaves como nomes de instância
      else if (typeof response === "object" && response !== null) {
        instances = Object.entries(response).map(([key, value]: [string, any]) => ({
          instanceName: key,
          instanceId: key,
          status: mapStatusFromApi(value.status || value.connectionStatus || "disconnected"),
          number: value.number || undefined,
        }))
      }

      console.log("Instâncias mapeadas:", instances)
      return {
        success: true,
        data: instances,
      }
    } catch (error) {
      console.error("Erro ao listar instâncias:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  },

  // Verificar se uma instância já existe
  async instanceExists(instanceName: string): Promise<boolean> {
    try {
      const response = await this.listInstances()

      if (response.success && response.data) {
        return response.data.some((instance) => instance.instanceName.toLowerCase() === instanceName.toLowerCase())
      }

      return false
    } catch (error) {
      console.error("Erro ao verificar existência da instância:", error)
      return false
    }
  },

  // Criar instância
  async createInstance(instanceName: string, number?: string): Promise<ApiResponse> {
    try {
      // Verificar se a instância já existe
      const exists = await this.instanceExists(instanceName)
      if (exists) {
        return {
          success: false,
          error: "Uma instância com este nome já existe",
        }
      }
  
      // Payload mínimo com apenas os campos essenciais
      const payload = {
        instanceName,
        name: instanceName, // Adicionando campo name como backup
        integration: "WHATSAPP-BAILEYS", // Campo obrigatório
        qrcode: true,
        ...(number && { number }),
      }
  
      console.log("Payload para criação de instância:", JSON.stringify(payload))
  
      const response = await fetchFromApi("/instance/create", {
        method: "POST",
        body: JSON.stringify(payload),
      })
  
      console.log("Resposta da criação de instância:", response)
  
      return {
        success: true,
        message: "Device instance created successfully",
        steps: "Send the QR Code or pairing Code to the customer, and ask them to read it within 30 seconds",
        data: {
          instanceName,
          instanceId: instanceName, // Adicionando instanceId (usando instanceName como valor padrão)
          number: number || null
        }
      }
    } catch (error) {
      console.error("Erro ao criar instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  },

  // Obter QR Code
  async getQrCode(
    instanceName: string,
  ): Promise<ApiResponse<{ qrcode?: string; base64?: string; pairingCode?: string }>> {
    try {
      const response = await fetchFromApi<any>(`/instance/connect/${instanceName}`)

      console.log("Resposta do QR Code:", JSON.stringify(response, null, 2))

      let qrcode = null
      let pairingCode = null

      if (response.qrcode) {
        qrcode = response.qrcode
      } else if (response.base64) {
        qrcode = response.base64
      } else if (response.data && response.data.qrcode) {
        qrcode = response.data.qrcode
      } else if (response.data && response.data.base64) {
        qrcode = response.data.base64
      }

      if (response.pairingCode) {
        pairingCode = response.pairingCode
      } else if (response.data && response.data.pairingCode) {
        pairingCode = response.data.pairingCode
      }

      return {
        success: true,
        data: {
          qrcode: qrcode,
          pairingCode: pairingCode,
        },
      }
    } catch (error) {
      console.error("Erro ao obter QR Code:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  },

  // Verificar status da instância
  async checkInstanceStatus(instanceName: string): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await fetchFromApi<any>(`/instance/connectionState/${instanceName}`)

      console.log("Resposta do status da instância:", JSON.stringify(response, null, 2))

      let status = "disconnected"

      if (response.state) {
        status = mapStatusFromApi(response.state)
      } else if (response.status) {
        status = mapStatusFromApi(response.status)
      } else if (response.connectionStatus) {
        status = mapStatusFromApi(response.connectionStatus)
      }

      return {
        success: true,
        data: {
          status,
        },
      }
    } catch (error) {
      console.error("Erro ao verificar status da instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  },

  // Desconectar instância
  async disconnectInstance(instanceName: string): Promise<ApiResponse> {
    try {
      const response = await fetchFromApi(`/instance/logout/${instanceName}`, {
        method: "DELETE",
      })

      console.log("Resposta da desconexão:", response)

      return {
        success: true,
        message: "Instance disconnected successfully",
      }
    } catch (error) {
      console.error("Erro ao desconectar instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  },

  // Deletar instância
  async deleteInstance(instanceName: string): Promise<ApiResponse> {
    try {
      const response = await fetchFromApi(`/instance/delete/${instanceName}`, {
        method: "DELETE",
      })

      console.log("Resposta da exclusão:", response)

      return {
        success: true,
        message: "Instance deleted successfully",
      }
    } catch (error) {
      console.error("Erro ao deletar instância:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  },

  // Obter detalhes da instância
  async getInstanceDetails(instanceName: string): Promise<{ exists: boolean; number?: string; status?: string }> {
    try {
      const response = await this.listInstances();
      
      if (response.success && response.data) {
        const instance = response.data.find(
          (inst) => inst.instanceName.toLowerCase() === instanceName.toLowerCase()
        );
        
        if (instance) {
          return {
            exists: true,
            number: instance.number,
            status: instance.status
          };
        }
      }
      
      return { exists: false };
    } catch (error) {
      console.error("Erro ao obter detalhes da instância:", error);
      return { exists: false };
    }
  },
  
  // Obter detalhes da instância pelo número
  async getInstanceDetailsByNumber(number: string): Promise<{ exists: boolean; instanceName?: string; status?: string }> {
    try {
      const response = await this.listInstances();
      
      if (response.success && response.data) {
        // Normalize the number by removing any non-digit characters
        const normalizedSearchNumber = number.replace(/\D/g, '');
        
        const instance = response.data.find(
          (inst) => {
            // If the instance has a number, normalize it and compare
            if (inst.number) {
              const normalizedInstNumber = inst.number.replace(/\D/g, '');
              return normalizedInstNumber === normalizedSearchNumber;
            }
            return false;
          }
        );
        
        if (instance) {
          return {
            exists: true,
            instanceName: instance.instanceName,
            status: instance.status
          };
        }
      }
      
      return { exists: false };
    } catch (error) {
      console.error("Erro ao obter detalhes da instância pelo número:", error);
      return { exists: false };
    }
  }
}

// Função auxiliar para mapear o status da API para o formato esperado pelo frontend
function mapStatusFromApi(apiStatus: string): "connected" | "disconnected" | "connecting" {
  if (!apiStatus) return "disconnected"

  switch (apiStatus.toLowerCase()) {
    case "connected":
    case "online":
    case "active":
    case "open":
    case "true":
      return "connected"
    case "connecting":
    case "loading":
    case "syncing":
    case "starting":
      return "connecting"
    default:
      return "disconnected"
  }
}

