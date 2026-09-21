import { createClient } from '@/lib/supabase/server';
import UsersManager from '@/components/UsersManager';
import type { Profile } from '@/lib/types';

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  return <UsersManager users={(data ?? []) as Profile[]} currentUserId={auth.user?.id ?? ''} />;
}
