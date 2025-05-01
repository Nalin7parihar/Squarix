import { cookies } from 'next/headers';
import FriendsPageClient from './client';
import { AUTH_CONFIG } from '@/lib/config';

async function getInitialFriendsData() {
  try {
    const cookieStore = await cookies();
    // Use the cookie name from our auth config
    const token = cookieStore.get(AUTH_CONFIG.cookieName);

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Fetch friends and groups in parallel
    const [friendsRes, groupsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends`, {
        headers: {
          Authorization: `${AUTH_CONFIG.tokenType} ${token.value}`
        },
        cache: 'no-store' // Disable caching to always get fresh data
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups`, {
        headers: {
          Authorization: `${AUTH_CONFIG.tokenType} ${token.value}`
        },
        cache: 'no-store'
      })
    ]);

    if (!friendsRes.ok || !groupsRes.ok) {
      console.error('Friends Response:', await friendsRes.text().catch(() => 'Failed to get response text'));
      console.error('Groups Response:', await groupsRes.text().catch(() => 'Failed to get response text'));
      throw new Error('Failed to fetch data');
    }

    const friends = await friendsRes.json();
    const groupsData = await groupsRes.json();

    // Transform data to match the expected format
    const transformedFriends = friends.map((friend: any) => ({
      id: friend.friend._id,
      name: friend.friend.name,
      email: friend.friend.email,
      totalOwed: 0,
      totalOwes: 0
    }));

    const transformedGroups = groupsData.groups?.map((group: any) => ({
      id: group._id,
      name: group.name,
      description: group.description || '',
      members: group.members?.map((member: any) => member._id) || [],
      expenses: group.expenses || [],
      totalExpenses: group.totalExpense || 0
    })) || [];

    return {
      friends: transformedFriends,
      groups: transformedGroups
    };
  } catch (error) {
    console.error('Error fetching friends data:', error);
    return {
      friends: [],
      groups: []
    };
  }
}

export default async function FriendsPage() {
  const data = await getInitialFriendsData();
  return <FriendsPageClient initialData={data} />;
}