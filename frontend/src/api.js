const API_URL = import.meta.env.VITE_API_URL || 'https://car-detection-api-bmggcjf2ceetfghm.westeurope-01.azurewebsites.net'

export async function detectCar(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_URL}/api/detect`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) throw new Error('Detection failed')
  return response.json()
}

export async function getHistory(limit = 10, offset = 0) {
  const response = await fetch(`${API_URL}/api/history?limit=${limit}&offset=${offset}`)
  if (!response.ok) throw new Error('Failed to fetch history')
  return response.json()
}

export async function getStats() {
  const response = await fetch(`${API_URL}/api/stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}
