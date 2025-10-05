import React, { useState } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Phone, Mail, User, Clock, Check, CheckCheck, Paperclip, Smile, Image, MapPin } from 'lucide-react';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      buyer: {
        name: 'John Smith',
        avatar: 'JS',
        verified: true
      },
      property: 'Modern Oceanfront Villa',
      lastMessage: 'Hi, I\'m interested in your property. Can we schedule a viewing?',
      time: '2 hours ago',
      unread: 2,
      status: 'active'
    },
    {
      id: 2,
      buyer: {
        name: 'Maria Garcia',
        avatar: 'MG',
        verified: false
      },
      property: 'Beachfront Condo',
      lastMessage: 'Is the price negotiable?',
      time: '5 hours ago',
      unread: 0,
      status: 'active'
    },
    {
      id: 3,
      buyer: {
        name: 'David Johnson',
        avatar: 'DJ',
        verified: true
      },
      property: 'Modern Oceanfront Villa',
      lastMessage: 'Can you provide more details about the utilities?',
      time: '1 day ago',
      unread: 1,
      status: 'active'
    },
    {
      id: 4,
      buyer: {
        name: 'Sarah Wilson',
        avatar: 'SW',
        verified: true
      },
      property: 'Mountain View Cabin',
      lastMessage: 'Thanks for the information. I\'ll be in touch soon.',
      time: '2 days ago',
      unread: 0,
      status: 'archived'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'buyer',
      content: 'Hi! I saw your listing for the Modern Oceanfront Villa. It looks amazing!',
      time: '2 hours ago',
      read: true
    },
    {
      id: 2,
      sender: 'seller',
      content: 'Thank you! I\'m glad you like it. It\'s been in our family for 10 years.',
      time: '2 hours ago',
      read: true
    },
    {
      id: 3,
      sender: 'buyer',
      content: 'Can we schedule a viewing? I\'m in Tamarindo next week.',
      time: '2 hours ago',
      read: true
    },
    {
      id: 4,
      sender: 'seller',
      content: 'Absolutely! How about Thursday at 2 PM? I can show you around the property.',
      time: '1 hour ago',
      read: true
    },
    {
      id: 5,
      sender: 'buyer',
      content: 'Thursday works perfect. Should I bring anything?',
      time: '30 min ago',
      read: false
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const MessageBubble = ({ message }) => (
    <div className={`flex mb-4 ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        message.sender === 'seller'
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
          : 'bg-white border border-slate-200 text-slate-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
          message.sender === 'seller' ? 'text-cyan-100' : 'text-slate-500'
        }`}>
          <span>{message.time}</span>
          {message.sender === 'seller' && (
            message.read ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-slate-200 flex flex-col">
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
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
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
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
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
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
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