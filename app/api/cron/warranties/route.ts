import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function GET(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch purchases that have a warranty but haven't been reminded yet
    const { data: purchases, error: purchaseError } = await supabase
      .from('purchases')
      .select('id, user_id, product_name, warranty_expires_at')
      .neq('warranty_reminder_sent', true)
      .gt('warranty_months', 0);

    if (purchaseError) {
      console.error('Error fetching purchases:', purchaseError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ message: 'No expiring warranties found' });
    }

    const sentReminders = [];
    const today = new Date();
    
    // We want to alert them 30 days before it expires
    const ALERT_THRESHOLD_DAYS = 30;

    for (const purchase of purchases) {
      if (!purchase.purchase_date) continue;
      
      const purchaseDate = new Date(purchase.purchase_date);
      const expirationDate = new Date(purchaseDate);
      expirationDate.setMonth(expirationDate.getMonth() + purchase.warranty_months);
      
      const timeDiff = expirationDate.getTime() - today.getTime();
      const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // If it expires in 30 days or less (and hasn't already expired wildly in the past)
      if (daysUntilExpiration <= ALERT_THRESHOLD_DAYS && daysUntilExpiration >= 0) {
        
        // Check if the user is on Pro or Business plan
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(purchase.user_id);
        
        if (userError || !userData.user) {
          console.error(`Could not fetch user ${purchase.user_id}`);
          continue;
        }

        const userPlan = userData.user.user_metadata?.plan || 'Free';
        
        // Skip free users
        if (userPlan === 'Free') {
          continue;
        }

        // In a real production app, we would use SUPABASE_SERVICE_ROLE_KEY 
        // to fetch the user's email address from auth.users.
        // For this demo, we will use Resend's testing delivery address or a hardcoded email.
        // In production: const userEmail = userData.user.email;
        const userEmail = 'delivered@resend.dev'; 
        
        try {
          await resend.emails.send({
            from: 'Ownly Reminders <onboarding@resend.dev>',
            to: [userEmail],
            subject: `Action Required: Warranty Expiring for ${purchase.item_name}`,
            html: `
              <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #FCF5EB; color: #3E2723; padding: 40px; border-radius: 16px; border: 1px solid #E8DAC8;">
                
                <div style="text-align: center; margin-bottom: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 8px;">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <circle cx="7.5" cy="7.5" r=".5" fill="#FBBF24" stroke="none" />
                      <path d="m7.9 7.9 2.7 2.7" />
                      <circle cx="16.5" cy="7.5" r=".5" fill="#FBBF24" stroke="none" />
                      <path d="m13.4 10.6 2.7-2.7" />
                      <circle cx="7.5" cy="16.5" r=".5" fill="#FBBF24" stroke="none" />
                      <path d="m7.9 16.1 2.7-2.7" />
                      <circle cx="16.5" cy="16.5" r=".5" fill="#FBBF24" stroke="none" />
                      <path d="m13.4 13.4 2.7 2.7" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #3E2723; letter-spacing: -0.5px;">Ownly</h1>
                  <p style="color: #7D665B; font-size: 14px; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Warranty Alert</p>
                </div>

                <div style="background-color: #ffffff; border: 1px solid #E8DAC8; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 8px; color: #3E2723;">Expiring Soon: ${purchase.item_name}</h2>
                  <p style="color: #7D665B; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    This is an automated reminder that your warranty is about to expire. You have <strong style="color: #3E2723;">${daysUntilExpiration} days</strong> left to file any claims or seek replacements.
                  </p>

                  <div style="background-color: #FCF5EB; border: 1px solid #E8DAC8; border-radius: 8px; padding: 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #7D665B; font-size: 14px; border-bottom: 1px solid #E8DAC8;">Item</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; color: #3E2723; border-bottom: 1px solid #E8DAC8;">${purchase.item_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #7D665B; font-size: 14px; border-bottom: 1px solid #E8DAC8;">Retailer</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 14px; color: #3E2723; border-bottom: 1px solid #E8DAC8;">${purchase.store || 'Unknown'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #7D665B; font-size: 14px;">Expiration Date</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: 700; font-size: 14px; color: #ef4444;">${expirationDate.toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://ownly.app/dashboard/warranties" style="display: inline-block; background-color: #FBBF24; color: #3E2723; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.4);">
                    View Warranty Details
                  </a>
                </div>
                
                <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #E8DAC8;">
                  <p style="color: #7D665B; font-size: 12px; margin: 0; line-height: 1.5;">
                    You are receiving this because you enabled Warranty Reminders in your Ownly Pro account.
                  </p>
                </div>
              </div>
            `
          });

          // Mark it as sent in the database
          await supabase
            .from('purchases')
            .update({ warranty_reminder_sent: true })
            .eq('id', purchase.id);
            
          sentReminders.push(purchase.item_name);
          
        } catch (emailError) {
          console.error(`Failed to send email for purchase ${purchase.id}:`, emailError);
        }
      }
    }

    return NextResponse.json({ 
      message: `Processed ${purchases.length} items. Sent ${sentReminders.length} reminders.`,
      sent: sentReminders
    });

  } catch (err) {
    console.error('Cron job failed:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
