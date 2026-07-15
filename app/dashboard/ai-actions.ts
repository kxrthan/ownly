'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function extractReceiptDetails(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file provided')
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString('base64')

    const mimeType = file.type

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
      You are an expert receipt analyzer. Look at this receipt/invoice and extract the following information.
      Return ONLY a raw JSON object (no markdown formatting, no code blocks) with these exact keys:
      {
        "item_name": "Main item purchased (string, keep it concise)",
        "store": "Name of the store or retailer (string)",
        "price": "Total price as a number, without currency symbols or commas (number)",
        "warranty_months": "If a warranty is explicitly mentioned, return the duration in months. Otherwise return 0 (number)",
        "category": "Categorize the item into exactly one of these: Electronics, Groceries, Clothing, Subscriptions, Utilities, Travel, Home, Other (string)"
      }
    `

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ]

    const result = await model.generateContent([prompt, ...imageParts])
    const responseText = result.response.text()

    // Clean up potential markdown formatting from Gemini's response
    const cleanJsonString = responseText.replace(/```json\n?|\n?```/g, '').trim()
    
    return JSON.parse(cleanJsonString)
  } catch (error: unknown) {
    console.error("AI Extraction Error:", error)
    throw new Error(error instanceof Error ? error.message : 'Failed to extract details from receipt')
  }
}

export async function generateFinancialInsights(purchases: any[]) {
  try {
    if (!purchases || purchases.length === 0) {
      return "You don't have any purchases yet. Add some data to get personalized insights!";
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const summaryData = purchases.map(p => ({
      item: p.item_name,
      price: p.price,
      store: p.store,
      date: p.purchase_date || p.created_at,
      category: p.category
    }))

    const prompt = `
      You are an elite, proactive AI Chief Financial Officer (CFO) for a business.
      Analyze the following recent purchase data for this business.
      Provide a highly personalized, insightful 2-3 sentence financial summary or recommendation.
      Do not use formatting like bolding or bullet points, just write a smooth, professional paragraph.
      Focus on spending trends, highest expenses, or cost-saving opportunities.
      
      Purchase Data:
      ${JSON.stringify(summaryData)}
    `

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error: unknown) {
    console.error("AI Insight Error:", error)
    return "Our AI CFO is currently analyzing your data. Please check back later."
  }
}
