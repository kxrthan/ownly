"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSubscription(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const serviceName = formData.get('service_name') as string
  const price = parseFloat(formData.get('price') as string)
  const billingCycle = formData.get('billing_cycle') as string
  const nextBillingDate = formData.get('next_billing_date') as string

  if (!serviceName || isNaN(price)) {
    throw new Error('Service name and valid price are required')
  }

  const { error } = await supabase
    .from('subscriptions')
    .insert([
      { 
        user_id: user.id, 
        service_name: serviceName, 
        price: price, 
        billing_cycle: billingCycle,
        next_billing_date: nextBillingDate
      }
    ])

  if (error) {
    throw new Error('Failed to add subscription: ' + error.message)
  }

  revalidatePath('/dashboard/subscriptions')
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to delete subscription: ' + error.message)
  }

  revalidatePath('/dashboard/subscriptions')
}

export async function bulkDeleteSubscriptions(ids: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to bulk delete subscriptions: ' + error.message)
  }

  revalidatePath('/dashboard/subscriptions')
}

export async function updateSubscription(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const serviceName = formData.get('service_name') as string
  const price = parseFloat(formData.get('price') as string)
  const billingCycle = formData.get('billing_cycle') as string
  const nextBillingDate = formData.get('next_billing_date') as string

  if (!serviceName || isNaN(price)) {
    throw new Error('Service name and valid price are required')
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      service_name: serviceName,
      price: price,
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to update subscription: ' + error.message)
  }

  revalidatePath('/dashboard/subscriptions')
}
