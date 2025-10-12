import { supabase } from '../contexts/AuthContext'

export interface Message {
  id: string
  thread_id: string
  property_id?: string
  from_profile_id: string
  to_profile_id: string
  body: string
  read_at?: string
  created_at: string
  from_profile?: {
    full_name: string
  }
  to_profile?: {
    full_name: string
  }
  property?: {
    title: string
  }
}

export interface Conversation {
  id: string
  buyer: {
    name: string
    avatar: string
    verified: boolean
  }
  property: string
  lastMessage: string
  time: string
  unread: number
  status: 'active' | 'archived'
}

export interface MessageThread {
  thread_id: string
  property_id?: string
  participants: {
    from_profile: {
      id: string
      full_name: string
    }
    to_profile: {
      id: string
      full_name: string
    }
  }
  messages: Message[]
  property?: {
    title: string
  }
}

export class MessagingService {
  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          from_profile:profiles!messages_from_profile_id_fkey(full_name),
          to_profile:profiles!messages_to_profile_id_fkey(full_name),
          property:properties(title)
        `)
        .or(`from_profile_id.eq.${userId},to_profile_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages by thread
      const threadMap = new Map<string, Message[]>()

      messages?.forEach(message => {
        if (!threadMap.has(message.thread_id)) {
          threadMap.set(message.thread_id, [])
        }
        threadMap.get(message.thread_id)!.push(message)
      })

      // Convert to conversations
      const conversations: Conversation[] = []

      for (const [threadId, threadMessages] of threadMap) {
        const sortedMessages = threadMessages.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        const lastMessage = sortedMessages[sortedMessages.length - 1]
        const otherProfile = lastMessage.from_profile_id === userId
          ? lastMessage.to_profile
          : lastMessage.from_profile

        if (!otherProfile) continue

        const unreadCount = sortedMessages.filter(msg =>
          msg.to_profile_id === userId && !msg.read_at
        ).length

        conversations.push({
          id: threadId,
          buyer: {
            name: otherProfile.full_name || 'Unknown User',
            avatar: (otherProfile.full_name || 'U')[0].toUpperCase(),
            verified: false // TODO: Add verification status
          },
          property: lastMessage.property?.title || 'Property Discussion',
          lastMessage: lastMessage.body,
          time: this.formatTime(lastMessage.created_at),
          unread: unreadCount,
          status: 'active' // TODO: Add status logic
        })
      }

      return conversations.sort((a, b) => {
        // Sort by most recent message
        const aTime = new Date(a.time).getTime()
        const bTime = new Date(b.time).getTime()
        return bTime - aTime
      })

    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  static async getMessages(threadId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return messages || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  static async sendMessage(
    fromProfileId: string,
    toProfileId: string,
    body: string,
    propertyId?: string,
    threadId?: string
  ): Promise<{ success: boolean; threadId?: string }> {
    try {
      const messageThreadId = threadId || crypto.randomUUID()

      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: messageThreadId,
          property_id: propertyId,
          from_profile_id: fromProfileId,
          to_profile_id: toProfileId,
          body: body.trim()
        })

      if (error) throw error

      return { success: true, threadId: messageThreadId }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false }
    }
  }

  static async markAsRead(threadId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('to_profile_id', userId)
        .is('read_at', null)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return false
    }
  }

  private static formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} min ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }
}

export default MessagingService