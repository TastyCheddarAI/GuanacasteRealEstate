import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Phone, Mail, User, Clock, Check, CheckCheck, Paperclip, Smile, Image, MapPin, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MessagingService, { Conversation, Message as MessageType } from '../services/messaging';

const Messages = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      MessagingService.markAsRead(selectedConversation, user!.id);
    }
  }, [selectedConversation, user]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const convs = await MessagingService.getConversations(user.id);
      setConversations(convs);
      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const msgs = await MessagingService.getMessages(threadId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user?.id) return;

    setSending(true);
    try {
      // Find the other participant's profile ID
      // This is a simplified approach - in a real app, you'd store participant IDs in the conversation
      const otherProfileId = selectedConv.buyer.name === 'Unknown User' ? null :
        // For now, we'll need to get this from the messages
        messages.find(m => m.from_profile_id !== user.id)?.from_profile_id ||
        messages.find(m => m.to_profile_id !== user.id)?.to_profile_id;

      if (!otherProfileId) {
        console.error('Could not determine recipient');
        return;
      }

      const result = await MessagingService.sendMessage(
        user.id,
        otherProfileId,
        newMessage,
        undefined, // property_id - could be extracted from conversation
        selectedConversation!
      );

      if (result.success) {
        setNewMessage('');
        // Reload messages to show the new message
        if (selectedConversation) {
          await loadMessages(selectedConversation);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const MessageBubble = ({ message }: { message: MessageType }) => {
    const isFromCurrentUser = message.from_profile_id === user?.id;
    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} min ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    return (
      <div className={`flex mb-4 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isFromCurrentUser
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
            : 'bg-white border border-slate-200 text-slate-900'
        }`}>
          <p className="text-sm">{message.body}</p>
          <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isFromCurrentUser ? 'text-cyan-100' : 'text-slate-500'
          }`}>
            <span>{formatTime(message.created_at)}</span>
            {isFromCurrentUser && (
              message.read_at ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)]">
          <div className="flex h-full relative">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden fixed top-20 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border border-slate-200"
            >
              <MessageSquare className="w-5 h-5 text-slate-600" />
            </button>

            {/* Mobile Overlay */}
            {showSidebar && (
              <div
                className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Conversations Sidebar */}
            <div className={`${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 fixed md:relative inset-y-0 left-0 z-40 md:z-auto w-80 md:w-80 bg-white md:bg-transparent border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out`}>
              {/* Mobile Close Button */}
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-50"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Messages</h2>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id);
                      setShowSidebar(false); // Close sidebar on mobile when conversation selected
                    }}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-cyan-50 border-r-2 border-r-cyan-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{conversation.buyer.avatar}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 truncate">
                              {conversation.buyer.name}
                            </span>
                            {conversation.buyer.verified && (
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{conversation.time}</span>
                        </div>

                        <p className="text-sm text-slate-600 mb-1 truncate">
                          {conversation.property}
                        </p>

                        <p className="text-sm text-slate-700 truncate">
                          {conversation.lastMessage}
                        </p>

                        {conversation.unread > 0 && (
                          <div className="mt-2">
                            <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unread} new
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{selectedConv.buyer.avatar}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{selectedConv.buyer.name}</h3>
                            {selectedConv.buyer.verified && (
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{selectedConv.property}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Phone className="w-5 h-5 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Mail className="w-5 h-5 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>

                    {/* Typing Indicator (placeholder) */}
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>{selectedConv.buyer.name} is typing...</span>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-slate-200">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type your message..."
                          rows={1}
                          className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none"
                          style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                        <div className="absolute right-3 bottom-3 flex gap-2">
                          <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <Paperclip className="w-4 h-4 text-slate-400" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <Image className="w-4 h-4 text-slate-400" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <Smile className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Quick Replies */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {[
                        'I can show you the property tomorrow',
                        'The price is firm',
                        'What time works for you?',
                        'I need to check with my partner first'
                      ].map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => setNewMessage(reply)}
                          className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
                    <p className="text-slate-600">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;