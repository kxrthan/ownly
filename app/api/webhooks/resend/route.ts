import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // 1. Verify this is a valid POST request
    const payload = await req.json();
    
    // Resend sends the email payload with 'from', 'to', 'subject', 'text', 'html'
    const toAddress = payload.to || '';
    const emailText = payload.text || payload.html || '';
    
    if (!toAddress || !emailText) {
      return NextResponse.json({ error: 'Missing necessary email data' }, { status: 400 });
    }

    // 2. Extract User ID from the To address (e.g. sync+USER_ID@ownly.app)
    // We look for the pattern +uuid@
    const uuidRegex = /\+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})@/i;
    const match = toAddress.match(uuidRegex);
    
    if (!match || !match[1]) {
      return NextResponse.json({ error: 'No valid user ID found in recipient address.' }, { status: 400 });
    }

    const userId = match[1];

    // 3. Authenticate with Supabase using Service Role (to bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Verify user exists and is on a Pro/Business plan
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userPlan = userData.user.user_metadata?.plan || 'Free';
    if (userPlan === 'Free') {
      return NextResponse.json({ error: 'Email sync is a Pro/Business feature.' }, { status: 403 });
    }

    // 5. Use Google Gemini to extract data from the receipt
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      You are an expert AI assistant that parses messy forwarded receipt emails. 
      Look at this raw email text and extract the store name, the main item purchased, the total price paid, and categorize it.
      Return ONLY a raw JSON object (no markdown formatting, no code blocks) with these exact keys:
      {
        "item_name": "Main item purchased (string, keep it concise)",
        "store": "Name of the store or retailer (string)",
        "price": "Total price as a number, without currency symbols or commas (number)",
        "category": "Categorize the item into exactly one of these: Electronics, Groceries, Clothing, Subscriptions, Utilities, Travel, Home, Other (string)"
      }
      
      Here is the raw email text:
      ---
      ${emailText.substring(0, 5000)} 
      ---
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini's response
    const cleanJsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
    let receiptData;
    
    try {
      receiptData = JSON.parse(cleanJsonString);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", cleanJsonString);
      return NextResponse.json({ error: 'AI failed to extract valid data' }, { status: 500 });
    }

    // 6. Insert the extracted data into Supabase
    const purchaseData = {
      user_id: userId,
      item_name: receiptData.item_name || 'Unknown Item',
      store: receiptData.store || 'Unknown Store',
      price: typeof receiptData.price === 'number' ? receiptData.price : 0,
      category: receiptData.category || 'Other',
      warranty_months: 0, // Default to 0 for auto-synced emails
      purchase_date: new Date().toISOString().split('T')[0],
      receipt_url: null 
    };

    const { error: insertError } = await supabase
      .from('purchases')
      .insert(purchaseData);

    if (insertError) {
      console.error('Failed to insert auto-synced purchase:', insertError);
      return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Receipt synced successfully',
      data: purchaseData 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
