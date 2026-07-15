'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function internalGetActiveVaultId(supabase: any, userId: string) {
  const cookieStore = await cookies()
  let vaultId = cookieStore.get('ownly_active_vault')?.value
  
  if (!vaultId) {
    const { data } = await supabase
      .from('vault_members')
      .select('vault_id')
      .eq('user_id', userId)
      .limit(1)
      .single()
    vaultId = data?.vault_id
  }
  return vaultId
}

export async function addPurchase(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  
  const plan = user.user_metadata?.plan || 'Free';
  const activeVaultId = await internalGetActiveVaultId(supabase, user.id);

  if (plan === 'Free') {
    const { count } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('vault_id', activeVaultId);
      
    if (count !== null && count >= 8) {
      throw new Error('Free plan limit reached (8 receipts). Please upgrade to Pro to add more.');
    }
  }

  let receipt_url = null
  const receiptFile = formData.get('receipt_file') as File

  if (receiptFile && receiptFile.size > 0) {
    const fileExt = receiptFile.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, receiptFile)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw new Error('Failed to upload receipt: ' + uploadError.message)
    }

    receipt_url = filePath
  }

  const data = {
    user_id: user.id,
    vault_id: activeVaultId,
    item_name: formData.get('item_name') as string,
    store: formData.get('store') as string,
    price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
    warranty_months: formData.get('warranty_months') ? parseInt(formData.get('warranty_months') as string, 10) : 0,
    category: formData.get('category') as string || 'Other',
    purchase_date: new Date().toISOString().split('T')[0],
    receipt_url
  }

  const { error } = await supabase.from('purchases').insert(data)

  if (error) {
    throw new Error('Failed to insert purchase: ' + error.message)
  }

  revalidatePath('/dashboard')
}

export async function deletePurchase(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id)
    // Removed user_id strict check to allow vault members to delete

  if (error) {
    throw new Error('Failed to delete purchase: ' + error.message)
  }

  revalidatePath('/dashboard')
}

export async function bulkDeletePurchases(ids: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // First, fetch the purchases to get their receipt URLs
  const { data: purchasesToDrop } = await supabase
    .from('purchases')
    .select('receipt_url')
    .in('id', ids)
    .not('receipt_url', 'is', null)

  // If there are receipts to delete, delete them from storage
  if (purchasesToDrop && purchasesToDrop.length > 0) {
    const urlsToDelete = purchasesToDrop.map(p => p.receipt_url as string)
    const { error: storageError } = await supabase.storage
      .from('receipts')
      .remove(urlsToDelete)
    
    if (storageError) {
      console.error("Failed to delete receipts from storage:", storageError)
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('purchases')
    .delete()
    .in('id', ids)

  if (error) {
    throw new Error('Failed to bulk delete purchases: ' + error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/receipts')
  revalidatePath('/dashboard/warranties')
}

export async function updatePurchase(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const itemName = formData.get('item_name') as string
  const store = formData.get('store') as string
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const warrantyMonths = formData.get('warranty_months') ? parseInt(formData.get('warranty_months') as string) : 0
  const purchaseDate = formData.get('purchase_date') as string || new Date().toISOString().split('T')[0]

  if (!itemName) {
    throw new Error('Item name is required')
  }

  const { error } = await supabase
    .from('purchases')
    .update({
      item_name: itemName,
      store: store,
      price: price,
      warranty_months: warrantyMonths,
      purchase_date: purchaseDate,
    })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update purchase: ' + error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/purchases')
  revalidatePath('/dashboard/warranties')
}



import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function getActiveVaultId() {
  const cookieStore = await cookies();
  let activeVaultId = cookieStore.get('ownly_active_vault')?.value;
  if (!activeVaultId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const supabaseAdmin = createSupabaseAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { data: vaultMembers } = await supabaseAdmin.from('vault_members').select('vault_id, role, vaults!inner(owner_id)').eq('user_id', user.id);
      if (vaultMembers && vaultMembers.length > 0) {
        const personal = vaultMembers.find(v => {
          const vault: any = Array.isArray(v.vaults) ? v.vaults[0] : v.vaults;
          return vault?.owner_id === user.id;
        });
        activeVaultId = personal ? personal.vault_id : vaultMembers[0].vault_id;
      }
    }
  }
  return activeVaultId;
}
