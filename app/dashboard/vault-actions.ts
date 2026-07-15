'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function switchVault(vaultId: string) {
  const cookieStore = await cookies();
  cookieStore.set('ownly_active_vault', vaultId, { 
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/' 
  })
  
  // Revalidate the entire dashboard layout to refetch data for the new vault
  revalidatePath('/dashboard', 'layout')
}

export async function joinVaultByCode(joinCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "You must be logged in to join a vault." }
  }

  const plan = user.user_metadata?.plan || 'Free';
  if (plan === 'Free') {
    return { error: "You must upgrade to the Pro plan to join shared vaults." }
  }

  // Use the admin client to safely bypass RLS for code verification
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: vault, error: fetchError } = await supabaseAdmin
    .from("vaults")
    .select("id, name")
    .eq("join_code", joinCode.trim().toUpperCase())
    .single()

  if (fetchError || !vault) {
    return { error: "Invalid Join Code" }
  }

  const { error: joinError } = await supabaseAdmin
    .from("vault_members")
    .insert({
      vault_id: vault.id,
      user_id: user.id,
      role: "member"
    })

  if (joinError) {
    return { error: "You are already a member of this vault or an error occurred." }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true, vaultName: vault.name }
}

export async function leaveVault(vaultId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "You must be logged in to leave a vault." }
  }

  // Check if they are the owner, owners can't leave their own vault (they would delete it)
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: vault } = await supabaseAdmin.from('vaults').select('owner_id').eq('id', vaultId).single()
  
  if (vault?.owner_id === user.id) {
    return { error: "You cannot leave a vault you own." }
  }

  const { error } = await supabaseAdmin
    .from('vault_members')
    .delete()
    .eq('vault_id', vaultId)
    .eq('user_id', user.id)

  if (error) {
    return { error: "Failed to leave vault." }
  }

  // Reset the active vault cookie to ensure they fall back to their default vault
  const cookieStore = await cookies();
  cookieStore.delete('ownly_active_vault');

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
