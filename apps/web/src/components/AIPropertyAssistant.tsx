import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, MicOff, Camera, FileText, X, Bot, User, Sparkles, MapPin, DollarSign, Shield, TrendingUp, Home, Calculator, FileCheck, Image as ImageIcon, Phone, Mail, Clock, Star, Zap, Heart, Search, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { aiAPI } from '../services/api';
import { marketDataService } from '../services/marketData';
import { feedbackService } from '../services/feedback';
import { performanceMonitor, trackAIResponse } from '../services/performanceMonitor';
import { aiReliabilityService } from '../services/aiReliabilityService';

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'property_analysis' | 'market_data' | 'legal_advice' | 'negotiation' | 'document_analysis' | 'image_analysis' | 'ai_response' | 'error' | 'general_response' | 'school_info' | 'school_overview' | 'location_info' | 'location_unknown' | 'property_recommendations' | 'property_search_results' | 'no_properties_found' | 'legal_info' | 'follow_up' | 'comparison' | 'welcome' | 'welcome_back' | 'feedback_acknowledgment' | 'buying_process' | 'fallback_response';
    data?: any;
    actions?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  };
}

interface ConversationContext {
  userPreferences?: {
    budget?: { min: number; max: number };
    locations?: string[];
    propertyTypes?: string[];
    timeline?: string;
    familySize?: number;
    children?: number;
    priorities?: string[];
    userType?: 'buyer' | 'seller' | 'investor' | 'relocator';
  };
  currentProperty?: any;
  conversationHistory?: Message[];
  lastTopic?: string;
  lastIntent?: string;
  sessionStart?: Date;
  messageCount?: number;
  searchHistory?: Array<{
    query: string;
    results: any[];
    timestamp: Date;
  }>;
  // Enhanced memory features
  conversationPatterns?: {
    frequentlyAskedTopics: string[];
    preferredResponseStyle: 'detailed' | 'concise' | 'balanced';
    engagementLevel: 'high' | 'medium' | 'low';
    knowledgeLevel: 'expert' | 'intermediate' | 'beginner';
  };
  memory?: {
    importantFacts: Array<{
      fact: string;
      category: 'personal' | 'property' | 'legal' | 'financial';
      confidence: number;
      lastMentioned: Date;
    }>;
    pendingQuestions: string[];
    resolvedTopics: string[];
    userGoals: string[];
  };
  personalization?: {
    name?: string;
    preferredLanguage: 'en' | 'es';
    communicationStyle: 'formal' | 'casual' | 'professional';
    responseLength: 'brief' | 'detailed' | 'comprehensive';
  };
}

const AIPropertyAssistant: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialContext?: ConversationContext;
  propertyId?: string;
}> = ({ isOpen, onClose, initialContext, propertyId }) => {

  // Comprehensive knowledge base for Guanacaste areas
  const guanacasteKnowledge = {
    areas: {
      nosara: {
        name: 'Nosara',
        schools: [
          { name: 'Costa Rica International Academy (CIA)', type: 'private', grades: 'PK-12', language: 'bilingual', rating: 9.5, description: 'World-class international school with IB curriculum' },
          { name: 'Nosara Integral School', type: 'public', grades: 'K-11', language: 'spanish', rating: 7.8, description: 'Local public school with growing bilingual programs' },
          { name: 'Living Earth School', type: 'private', grades: 'PK-8', language: 'english', rating: 8.9, description: 'Montessori-inspired international school' }
        ],
        community: {
          expatPopulation: 'High',
          expatNationalities: ['USA', 'Canada', 'Europe', 'Australia'],
          localPopulation: 5000,
          familyFriendly: 9.5,
          safety: 8.8,
          amenities: ['Yoga studios', 'Organic cafes', 'Art galleries', 'Weekly farmers market']
        },
        lifestyle: {
          atmosphere: 'Peaceful, spiritual, eco-conscious',
          activities: ['Surfing', 'Yoga', 'Hiking', 'Wildlife watching'],
          climate: 'Dry season November-April, green season May-October',
          beachAccess: 'Beautiful beaches within 5-15 minutes'
        },
        realEstate: {
          priceRange: '$600k - $2.5M',
          avgPrice: '$950k',
          propertyTypes: ['Beachfront homes', 'Jungle villas', 'Condos', 'Land for development'],
          marketTrend: 'Stable growth, premium positioning'
        }
      },
      'playa grande': {
        name: 'Playa Grande',
        schools: [
          { name: 'Costa Rica International Academy (CIA)', type: 'private', grades: 'PK-12', language: 'bilingual', rating: 9.5, description: 'Excellent international school accessible from Playa Grande' },
          { name: 'Playa Grande Public School', type: 'public', grades: 'K-6', language: 'spanish', rating: 7.2, description: 'Small local school for younger children' }
        ],
        community: {
          expatPopulation: 'High',
          expatNationalities: ['USA', 'Canada', 'Europe'],
          localPopulation: 1200,
          familyFriendly: 9.2,
          safety: 9.1,
          amenities: ['Tamarindo access', 'Golf course', 'Tennis courts', 'Marina']
        },
        lifestyle: {
          atmosphere: 'Upscale, tranquil, resort-like',
          activities: ['Golf', 'Tennis', 'Horseback riding', 'Marina activities'],
          climate: 'Dry season November-April, green season May-October',
          beachAccess: 'Private beach club, beautiful surfing beaches'
        },
        realEstate: {
          priceRange: '$800k - $4M',
          avgPrice: '$1.8M',
          propertyTypes: ['Luxury homes', 'Condo complexes', 'Beachfront villas'],
          marketTrend: 'Premium market, steady appreciation'
        }
      },
      'playa flamingo': {
        name: 'Playa Flamingo',
        schools: [
          { name: 'La Paz Community School', type: 'private', grades: 'PK-12', language: 'bilingual', rating: 9.3, description: 'Highly rated international school with strong academic program' },
          { name: 'Flamingo Montessori School', type: 'private', grades: 'PK-6', language: 'bilingual', rating: 8.7, description: 'Montessori-based international education' },
          { name: 'Playa Flamingo Public School', type: 'public', grades: 'K-6', language: 'spanish', rating: 7.5, description: 'Local public school' }
        ],
        community: {
          expatPopulation: 'Very High',
          expatNationalities: ['USA', 'Canada', 'Europe', 'Latin America'],
          localPopulation: 2500,
          familyFriendly: 9.0,
          safety: 8.9,
          amenities: ['Marina', 'Golf courses', 'Spas', 'Fine dining', 'Shopping center']
        },
        lifestyle: {
          atmosphere: 'Luxury resort, international, sophisticated',
          activities: ['Golf', 'Sailing', 'Spa treatments', 'Fine dining', 'Water sports'],
          climate: 'Dry season November-April, green season May-October',
          beachAccess: 'Beautiful beaches, marina, resort amenities'
        },
        realEstate: {
          priceRange: '$500k - $3M',
          avgPrice: '$1.2M',
          propertyTypes: ['Condo complexes', 'Townhouses', 'Single-family homes', 'Beachfront properties'],
          marketTrend: 'Strong growth, international appeal'
        }
      },
      tamarindo: {
        name: 'Tamarindo',
        schools: [
          { name: 'Tamarindo International School', type: 'private', grades: 'PK-8', language: 'bilingual', rating: 8.5, description: 'Growing international school with good facilities' },
          { name: 'Tamarindo Public School', type: 'public', grades: 'K-11', language: 'spanish', rating: 7.0, description: 'Local public school with basic education' }
        ],
        community: {
          expatPopulation: 'Medium-High',
          expatNationalities: ['USA', 'Canada', 'Europe', 'Australia'],
          localPopulation: 8000,
          familyFriendly: 7.8,
          safety: 7.5,
          amenities: ['Nightlife', 'Restaurants', 'Surf shops', 'Tourist attractions']
        },
        lifestyle: {
          atmosphere: 'Vibrant, touristy, energetic',
          activities: ['Surfing', 'Nightlife', 'Shopping', 'Beach activities'],
          climate: 'Dry season November-April, green season May-October',
          beachAccess: 'Excellent surfing beaches, tourist beach'
        },
        realEstate: {
          priceRange: '$400k - $2M',
          avgPrice: '$750k',
          propertyTypes: ['Beach condos', 'Townhouses', 'Small homes', 'Commercial properties'],
          marketTrend: 'High growth, tourist-driven market'
        }
      },
      samara: {
        name: 'Sámara',
        schools: [
          { name: 'Sámara Pacific School', type: 'private', grades: 'PK-11', language: 'bilingual', rating: 8.2, description: 'Well-established bilingual school' },
          { name: 'Sámara Public School', type: 'public', grades: 'K-11', language: 'spanish', rating: 7.3, description: 'Local public school' }
        ],
        community: {
          expatPopulation: 'Medium',
          expatNationalities: ['USA', 'Canada', 'Germany', 'Switzerland'],
          localPopulation: 3500,
          familyFriendly: 8.8,
          safety: 8.5,
          amenities: ['Local restaurants', 'Yoga studios', 'Art galleries', 'Weekly market']
        },
        lifestyle: {
          atmosphere: 'Charming, laid-back, artistic',
          activities: ['Beachcombing', 'Yoga', 'Art walks', 'Nature hikes'],
          climate: 'Dry season November-April, green season May-October',
          beachAccess: 'Beautiful bay beach, calm waters'
        },
        realEstate: {
          priceRange: '$350k - $1.2M',
          avgPrice: '$650k',
          propertyTypes: ['Beach homes', 'Mountain villas', 'Condos', 'Land'],
          marketTrend: 'Steady growth, affordable luxury'
        }
      },
      'playa potrero': {
        name: 'Playa Potrero',
        schools: [
          { name: 'La Paz Community School', type: 'private', grades: 'PK-12', language: 'bilingual', rating: 9.3, description: 'Highly rated international school with strong academic program' },
          { name: 'Playa Potrero Public School', type: 'public', grades: 'K-6', language: 'spanish', rating: 7.8, description: 'Local public school serving the community' }
        ],
        community: {
          expatPopulation: 'High',
          expatNationalities: ['USA', 'Canada', 'Europe', 'Latin America'],
          localPopulation: 1800,
          familyFriendly: 9.0,
          safety: 8.8,
          amenities: ['Marina access', 'Golf courses nearby', 'Spas', 'Fine dining', 'Shopping center']
        },
        lifestyle: {
          atmosphere: 'Upscale, tranquil, resort-like',
          activities: ['Golf', 'Sailing', 'Spa treatments', 'Fine dining', 'Water sports', 'Horseback riding'],
          climate: 'Dry season November-April, green season May-October',
          beachAccess: 'Beautiful beaches, marina, resort amenities'
        },
        realEstate: {
          priceRange: '$600k - $2.5M',
          avgPrice: '$1.3M',
          propertyTypes: ['Luxury homes', 'Condo complexes', 'Beachfront villas', 'Golf course properties'],
          marketTrend: 'Premium market, strong growth'
        }
      }
    }
  };
  // Translation helper
  const t = (en: string, es: string): string => {
    return language === 'en' ? en : es;
  };

  const getWelcomeMessage = (): Message => {
    if (initialContext?.currentProperty) {
      const property = initialContext.currentProperty;
      return {
        id: 'welcome',
        type: 'assistant',
        content: t(
          `Hello! I'm here to help you with the property "${property.title}" in ${property.location}. I can analyze this specific property, compare it with similar ones, explain legal aspects, or help with any questions about this home. What would you like to know?`,
          `¡Hola! Estoy aquí para ayudarte con la propiedad "${property.title}" en ${property.location}. Puedo analizar esta propiedad específica, comparar con otras similares, explicar aspectos legales, o ayudarte con cualquier pregunta sobre esta casa. ¿Qué te gustaría saber?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'property_analysis',
          actions: [
            { label: t('Analyze this property', 'Analizar esta propiedad'), action: 'analyze_this_property' },
            { label: t('Compare with similar', 'Comparar con similares'), action: 'compare_similar' },
            { label: t('Legal information', 'Información legal'), action: 'legal_info' },
            { label: t('Help with offer', 'Ayuda con oferta'), action: 'negotiation_help' }
          ]
        }
      };
    }

    // Check if we have saved context for returning users
    const savedContext = localStorage.getItem('guanacaste-ai-context');
    let hasSavedPreferences = false;
    let userType = '';
    let location = '';

    if (savedContext) {
      try {
        const parsed = JSON.parse(savedContext);
        const today = new Date().toDateString();
        if (parsed.sessionStart && new Date(parsed.sessionStart).toDateString() === today) {
          hasSavedPreferences = !!(parsed.userPreferences && Object.keys(parsed.userPreferences).length > 0);
          userType = parsed.userPreferences?.userType || '';
          location = parsed.userPreferences?.locations?.[0] || '';
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }

    if (hasSavedPreferences) {
      return {
        id: 'welcome',
        type: 'assistant',
        content: t(
          `Welcome back! I remember you're ${userType ? `looking as a ${userType}` : 'interested in properties'}${location ? ` in ${location}` : ' in Guanacaste'}. How can I help you continue your property search today? I can find new listings, answer questions about the areas, or help with legal aspects.`,
          `¡Bienvenido de vuelta! Recuerdo que estás ${userType ? `buscando como ${userType}` : 'interesado en propiedades'}${location ? ` en ${location}` : ' en Guanacaste'}. ¿Cómo puedo ayudarte a continuar tu búsqueda de propiedades hoy? Puedo encontrar nuevos listados, responder preguntas sobre las zonas, o ayudarte con aspectos legales.`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'welcome_back',
          actions: [
            { label: t('Find properties', 'Buscar propiedades'), action: 'find_properties' },
            { label: t('Market update', 'Actualización mercado'), action: 'market_update' },
            { label: t('Legal questions', 'Preguntas legales'), action: 'legal_help' },
            { label: t('Reset preferences', 'Reiniciar preferencias'), action: 'reset_preferences' }
          ]
        }
      };
    }

    return {
      id: 'welcome',
      type: 'assistant',
      content: t(
        'Hello! I\'m your property assistant in Guanacaste. How can I help you today? I can analyze properties, give market advice, explain Costa Rican laws, or help with negotiations.',
        '¡Hola! Soy tu asistente de propiedades en Guanacaste. ¿En qué puedo ayudarte hoy? Puedo analizar propiedades, dar consejos sobre el mercado, explicar leyes costarricenses, o ayudarte con negociaciones.'
      ),
      timestamp: new Date(),
      metadata: {
        type: 'welcome',
        actions: [
          { label: t('Analyze a property', 'Analizar una propiedad'), action: 'analyze_property' },
          { label: t('Market information', 'Información del mercado'), action: 'market_info' },
          { label: t('Legal questions', 'Preguntas legales'), action: 'legal_help' },
          { label: t('Negotiation help', 'Ayuda con negociación'), action: 'negotiation_help' }
        ]
      }
    };
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en'); // English as default
  const [context, setContext] = useState<ConversationContext>(initialContext || {});
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [conversationId, setConversationId] = useState<string>(() =>
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Enhanced conversation memory functions
  const analyzeConversationPatterns = (messages: Message[]): ConversationContext['conversationPatterns'] => {
    const topics = messages
      .filter(m => m.type === 'user')
      .map(m => {
        const lower = m.content.toLowerCase();
        if (lower.includes('school') || lower.includes('education') || lower.includes('escuela')) return 'education';
        if (lower.includes('legal') || lower.includes('law') || lower.includes('title') || lower.includes('contract')) return 'legal';
        if (lower.includes('price') || lower.includes('market') || lower.includes('value')) return 'market';
        if (lower.includes('buy') || lower.includes('purchase') || lower.includes('comprar')) return 'buying_process';
        if (lower.includes('invest') || lower.includes('rental') || lower.includes('income')) return 'investment';
        return 'general';
      });

    // Count topic frequency
    const topicCount = topics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequentlyAskedTopics = Object.entries(topicCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // Determine engagement level
    const avgResponseLength = messages
      .filter(m => m.type === 'assistant')
      .reduce((sum, m) => sum + m.content.length, 0) / messages.filter(m => m.type === 'assistant').length;

    let engagementLevel: 'high' | 'medium' | 'low' = 'medium';
    if (avgResponseLength > 500) engagementLevel = 'high';
    else if (avgResponseLength < 200) engagementLevel = 'low';

    // Determine knowledge level based on question complexity
    const complexQuestions = messages.filter(m =>
      m.type === 'user' &&
      (m.content.includes('maritime') || m.content.includes('tax') || m.content.includes('due diligence') ||
       m.content.includes('entity') || m.content.includes('concession'))
    ).length;

    let knowledgeLevel: 'expert' | 'intermediate' | 'beginner' = 'intermediate';
    if (complexQuestions > messages.filter(m => m.type === 'user').length * 0.5) knowledgeLevel = 'expert';
    else if (complexQuestions < 2) knowledgeLevel = 'beginner';

    return {
      frequentlyAskedTopics,
      preferredResponseStyle: engagementLevel === 'high' ? 'detailed' : engagementLevel === 'low' ? 'concise' : 'balanced',
      engagementLevel,
      knowledgeLevel
    };
  };

  const extractImportantFacts = (messages: Message[]): ConversationContext['memory'] => {
    const importantFacts: ConversationContext['memory']['importantFacts'] = [];
    const pendingQuestions: string[] = [];
    const resolvedTopics: string[] = [];
    const userGoals: string[] = [];

    messages.forEach(message => {
      if (message.type === 'user') {
        const content = message.content.toLowerCase();

        // Extract budget information
        const budgetMatch = content.match(/\$?(\d+(?:,\d+)*)\s*(?:to|-|and)\s*\$?(\d+(?:,\d+)*)/);
        if (budgetMatch) {
          const min = parseInt(budgetMatch[1].replace(/,/g, ''));
          const max = parseInt(budgetMatch[2].replace(/,/g, ''));
          importantFacts.push({
            fact: `Budget range: $${min.toLocaleString()} - $${max.toLocaleString()}`,
            category: 'financial',
            confidence: 0.9,
            lastMentioned: message.timestamp
          });
        }

        // Extract location preferences
        const locations = ['tamarindo', 'nosara', 'playa grande', 'samara', 'liberia', 'papagayo'];
        locations.forEach(location => {
          if (content.includes(location)) {
            importantFacts.push({
              fact: `Interested in ${location}`,
              category: 'property',
              confidence: 0.8,
              lastMentioned: message.timestamp
            });
          }
        });

        // Extract family information
        if (content.includes('family') || content.includes('children') || content.includes('kids')) {
          const familyMatch = content.match(/(\d+)\s*(?:children|kids|family members)/);
          if (familyMatch) {
            importantFacts.push({
              fact: `Family with ${familyMatch[1]} children`,
              category: 'personal',
              confidence: 0.85,
              lastMentioned: message.timestamp
            });
          }
        }

        // Extract timeline
        const timelineMatch = content.match(/(\d+)\s*(month|week|year)s?/);
        if (timelineMatch) {
          importantFacts.push({
            fact: `Timeline: ${timelineMatch[0]}`,
            category: 'personal',
            confidence: 0.8,
            lastMentioned: message.timestamp
          });
        }

        // Extract user type
        if (content.includes('invest') || content.includes('rental')) {
          userGoals.push('Investment property seeking');
        } else if (content.includes('relocate') || content.includes('move')) {
          userGoals.push('Relocation planning');
        } else if (content.includes('vacation') || content.includes('second home')) {
          userGoals.push('Vacation/retirement home');
        }
      }
    });

    // Remove duplicates and keep most recent
    const uniqueFacts = importantFacts.reduce((acc, fact) => {
      const existing = acc.find(f => f.fact === fact.fact);
      if (!existing || fact.lastMentioned > existing.lastMentioned) {
        acc = acc.filter(f => f.fact !== fact.fact);
        acc.push(fact);
      }
      return acc;
    }, [] as typeof importantFacts);

    return {
      importantFacts: uniqueFacts,
      pendingQuestions,
      resolvedTopics,
      userGoals: [...new Set(userGoals)]
    };
  };

  // Load conversation context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem('guanacaste-ai-context');
    if (savedContext) {
      try {
        const parsedContext = JSON.parse(savedContext);
        // Only load if it's from today (to avoid stale data)
        const today = new Date().toDateString();
        if (parsedContext.sessionStart && new Date(parsedContext.sessionStart).toDateString() === today) {
          setContext(prev => ({ ...prev, ...parsedContext }));
          // Load recent messages if available
          const savedMessages = localStorage.getItem('guanacaste-ai-messages');
          if (savedMessages) {
            const parsedMessages = JSON.parse(savedMessages);
            const recentMessages = parsedMessages.slice(-20); // Keep last 20 messages for analysis
            setMessages(recentMessages);

            // Analyze conversation patterns and extract facts
            const patterns = analyzeConversationPatterns(recentMessages);
            const memory = extractImportantFacts(recentMessages);

            setContext(prev => ({
              ...prev,
              conversationPatterns: patterns,
              memory,
              personalization: {
                preferredLanguage: language,
                communicationStyle: 'professional',
                responseLength: patterns?.preferredResponseStyle === 'detailed' ? 'comprehensive' :
                               patterns?.preferredResponseStyle === 'concise' ? 'brief' : 'detailed',
                ...prev.personalization
              }
            }));
          }
        }
      } catch (error) {
        console.warn('Failed to load saved conversation context:', error);
      }
    }
  }, []);

  // Save conversation context to localStorage whenever it changes
  useEffect(() => {
    if (context && Object.keys(context).length > 0) {
      try {
        // Analyze conversation patterns and extract facts before saving
        const patterns = analyzeConversationPatterns(messages);
        const memory = extractImportantFacts(messages);

        const contextToSave = {
          ...context,
          sessionStart: context.sessionStart || new Date().toISOString(),
          // Don't save full conversation history to avoid bloat
          conversationHistory: undefined,
          // Save enhanced memory features
          conversationPatterns: patterns,
          memory,
          personalization: {
            preferredLanguage: language,
            communicationStyle: 'professional',
            responseLength: patterns?.preferredResponseStyle === 'detailed' ? 'comprehensive' :
                           patterns?.preferredResponseStyle === 'concise' ? 'brief' : 'detailed',
            ...context.personalization
          }
        };

        localStorage.setItem('guanacaste-ai-context', JSON.stringify(contextToSave));
      } catch (error) {
        console.warn('Failed to save conversation context:', error);
      }
    }
  }, [context, messages, language]);

  // Save messages to localStorage (last 10 only)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const recentMessages = messages.slice(-10);
        localStorage.setItem('guanacaste-ai-messages', JSON.stringify(recentMessages));
      } catch (error) {
        console.warn('Failed to save messages:', error);
      }
    }
  }, [messages]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize welcome message after component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [language]); // Re-run when language changes

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === 'en' ? 'en-US' : 'es-ES';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          // Add a visual indicator that listening has started
          console.log('Voice recognition started');
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log('Voice recognition ended');
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);

          // Auto-send the message after voice input
          setTimeout(async () => {
            const userMessage: Message = {
              id: Date.now().toString(),
              type: 'user',
              content: transcript,
              timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');
            setIsTyping(true);

            // Simulate AI processing time
            setTimeout(async () => {
              const aiResponse = await generateResponse(transcript);
              setMessages(prev => [...prev, aiResponse]);
              setIsTyping(false);

              // Update context
              setContext(prev => ({
                ...prev,
                lastTopic: aiResponse.metadata?.type || prev.lastTopic,
                conversationHistory: [...(prev.conversationHistory || []), userMessage, aiResponse]
              }));
            }, 1000 + Math.random() * 2000);
          }, 500);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          // Show error message to user
          const errorMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: t(
              'Sorry, I couldn\'t understand the audio. Could you type your question or try again?',
              'Lo siento, no pude entender el audio. ¿Podrías escribir tu pregunta o intentar de nuevo?'
            ),
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Enhanced query parsing with intent recognition
  const parseUserQuery = (message: string) => {
    const lowerMessage = message.toLowerCase();

    const requirements = {
      // Basic requirements
      familySize: null as number | null,
      children: null as number | null,
      schoolAge: [] as string[],
      budget: null as { min: number; max: number } | null,
      privateSchools: false,
      expatCommunity: false,
      location: null as string | null,
      propertyType: null as string | null,
      priorities: [] as string[],

      // Enhanced intent recognition
      intent: 'general' as 'property_search' | 'location_info' | 'legal_help' | 'market_info' | 'school_info' | 'negotiation' | 'buying_process' | 'general',
      urgency: 'normal' as 'urgent' | 'normal' | 'casual',
      userType: 'buyer' as 'buyer' | 'seller' | 'investor' | 'relocator',
      timeline: null as string | null,

      // Conversation context
      followUp: false,
      clarification: false,
      comparison: false
    };

    // Word to number mapping
    const wordToNumber: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'couple': 2, 'few': 3, 'several': 4
    };

    // Helper function to parse numbers (words or digits)
    const parseNumber = (numStr: string): number | null => {
      const digitMatch = numStr.match(/(\d+)/);
      if (digitMatch) {
        return parseInt(digitMatch[1]);
      }
      return wordToNumber[numStr.toLowerCase()] || null;
    };

    // Parse currency amounts
    const parseCurrency = (amountStr: string): number => {
      const num = parseFloat(amountStr.replace(/[$,]/g, ''));
      return amountStr.toLowerCase().includes('k') ? num * 1000 : num;
    };

    // PRIORITY 1: Check for explicit area/location information requests first
    const isAreaRequest = lowerMessage.includes('tell me about') || lowerMessage.includes('about the area') ||
                         lowerMessage.includes('what is') || lowerMessage.includes('what\'s') ||
                         lowerMessage.includes('dime sobre') || lowerMessage.includes('sobre la zona') ||
                         lowerMessage.includes('qué es') || lowerMessage.includes('cuéntame de');

    if (isAreaRequest && requirements.location) {
      requirements.intent = 'location_info';
    }
    // Intent recognition with prioritization (legal > property search > others)
    // Check for legal keywords first (most specific)
    else if (lowerMessage.match(/\b(legal|law|maritime|title|contrato|tax|due diligence|regulations?|permits?|licenses?|ZMT|concessions?)\b/)) {
      requirements.intent = 'legal_help';
    }
    // Only classify as property search if there are clear buying/purchasing intent keywords
    // and no legal keywords (to avoid misclassifying legal questions about properties)
    else if (lowerMessage.match(/\b(buy|purchase|looking.*(?:house|home|property|condo)|find.*(?:house|home|property|condo)|search.*(?:house|home|property|condo)|available.*(?:house|home|property|condo)|for sale.*(?:house|home|property|condo)|listings?.*(?:house|home|property|condo))\b/)) {
      requirements.intent = 'property_search';
    }
    // Market info (price analysis without buying intent)
    else if (lowerMessage.match(/\b(market|price.*trend|value.*worth|appraisal|average.*price|market.*analysis)\b/)) {
      requirements.intent = 'market_info';
    }
    // School information
    else if (lowerMessage.match(/\b(school|education|escuela)\b/)) {
      requirements.intent = 'school_info';
    }
    // Negotiation (when discussing offers/deals)
    else if (lowerMessage.match(/\b(negotiate|offer|deal|counter.*offer|price.*negotiation)\b/)) {
      requirements.intent = 'negotiation';
    }
    // Buying process (when asking about steps to buy, process, what to know)
    // Only classify as buying process if not an area information request
    else if (!isAreaRequest && lowerMessage.match(/\b(buying.*process|buy.*process|steps.*buy|how.*buy|what.*know.*buy|process.*purchase|buying.*steps|oceanfront|buy.*house|buy.*home|buy.*property|purchase.*house|purchase.*home|purchase.*property)\b/)) {
      requirements.intent = 'buying_process';
    }

    // Urgency detection
    if (lowerMessage.match(/\b(urgent|asap|quickly|soon|immediately|fast)\b/)) {
      requirements.urgency = 'urgent';
    } else if (lowerMessage.match(/\b(casual|whenever|flexible|no rush)\b/)) {
      requirements.urgency = 'casual';
    }

    // User type detection
    if (lowerMessage.match(/\b(sell|selling|list|owner)\b/)) {
      requirements.userType = 'seller';
    } else if (lowerMessage.match(/\b(invest|investment|rental|income)\b/)) {
      requirements.userType = 'investor';
    } else if (lowerMessage.match(/\b(move|relocate|living|home)\b/)) {
      requirements.userType = 'relocator';
    }

    // Timeline extraction
    const timelineMatch = lowerMessage.match(/\b(\d+)\s*(month|week|year)s?\b/);
    if (timelineMatch) {
      requirements.timeline = timelineMatch[0];
    }

    // Follow-up detection
    requirements.followUp = lowerMessage.match(/\b(more|tell me|explain|what about|also|additionally)\b/) !== null;
    requirements.clarification = lowerMessage.match(/\b(what|how|why|when|where|which|clarify)\b/) !== null;
    requirements.comparison = lowerMessage.match(/\b(compare|versus|vs|difference|better|worse)\b/) !== null;

    // Extract family size
    const familyMatch = lowerMessage.match(/family of (\w+)/i) ||
                        lowerMessage.match(/(\d+) people/i) ||
                        lowerMessage.match(/(\d+) family members/i) ||
                        lowerMessage.match(/(\w+) adults?/i);
    if (familyMatch) {
      requirements.familySize = parseNumber(familyMatch[1]);
    }

    // Extract children information
    const childrenMatch = lowerMessage.match(/(\w+) (?:small |young )?children/i) ||
                         lowerMessage.match(/(\d+) kids?/i) ||
                         lowerMessage.match(/children aged? (\d+)/i);
    if (childrenMatch) {
      requirements.children = parseNumber(childrenMatch[1]);
    }

    // Extract school age information
    const schoolAgeMatch = lowerMessage.match(/grade (\d+)/gi) ||
                          lowerMessage.match(/age (\d+)/gi) ||
                          lowerMessage.match(/(\d+) year old/gi);
    if (schoolAgeMatch) {
      requirements.schoolAge = schoolAgeMatch.map(match => match.replace(/\D/g, ''));
    }

    // Check for private schools
    requirements.privateSchools = lowerMessage.includes('private school') ||
                                 lowerMessage.includes('escuela privada') ||
                                 lowerMessage.includes('international school');

    // Check for expat community
    requirements.expatCommunity = lowerMessage.includes('expat') ||
                                 lowerMessage.includes('international') ||
                                 lowerMessage.includes('english') ||
                                 lowerMessage.includes('foreigner') ||
                                 lowerMessage.includes('american') ||
                                 lowerMessage.includes('canadian') ||
                                 lowerMessage.includes('european');

    // Enhanced budget parsing
    const budgetPatterns = [
      /\$?(\d+(?:\.\d+)?)[k]?\s*(?:to|-|and)\s*\$?(\d+(?:\.\d+)?)[k]?/i,
      /(?:between|from)\s*\$?(\d+(?:\.\d+)?)[k]?\s*(?:to|and)\s*\$?(\d+(?:\.\d+)?)[k]?/i,
      /under\s*\$?(\d+(?:\.\d+)?)[k]?/i,
      /over\s*\$?(\d+(?:\.\d+)?)[k]?/i,
      /up to\s*\$?(\d+(?:\.\d+)?)[k]?/i,
      /around\s*\$?(\d+(?:\.\d+)?)[k]?/i
    ];

    for (const pattern of budgetPatterns) {
      const budgetMatch = lowerMessage.match(pattern);
      if (budgetMatch) {
        if (budgetMatch[2]) {
          // Range
          const min = parseCurrency(budgetMatch[1]);
          const max = parseCurrency(budgetMatch[2]);
          requirements.budget = { min, max };
        } else {
          // Single amount
          const amount = parseCurrency(budgetMatch[1]);
          if (lowerMessage.includes('under') || lowerMessage.includes('up to')) {
            requirements.budget = { min: 0, max: amount };
          } else if (lowerMessage.includes('over')) {
            requirements.budget = { min: amount, max: amount * 2 };
          } else {
            // Around/approximately
            requirements.budget = { min: amount * 0.8, max: amount * 1.2 };
          }
        }
        break;
      }
    }

    // Enhanced location preferences
    const locations = [
      'guanacaste', 'tamarindo', 'nosara', 'playa grande', 'flamingo', 'potrero', 'sámara', 'samara',
      'liberia', 'playa negra', 'brasilito', 'conchal', 'marbella',
      'san juanillo', 'ostional', 'papagayo', 'coco', 'ocotal'
    ];
    for (const loc of locations) {
      if (lowerMessage.includes(loc)) {
        requirements.location = loc;
        break;
      }
    }

    // Enhanced property type detection
    if (lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('casa') || lowerMessage.includes('single family')) {
      requirements.propertyType = 'house';
    } else if (lowerMessage.includes('condo') || lowerMessage.includes('condominium') || lowerMessage.includes('apartment') || lowerMessage.includes('apartamento')) {
      requirements.propertyType = 'condo';
    } else if (lowerMessage.includes('lot') || lowerMessage.includes('land') || lowerMessage.includes('terreno') || lowerMessage.includes('property')) {
      requirements.propertyType = 'lot';
    } else if (lowerMessage.includes('commercial') || lowerMessage.includes('business')) {
      requirements.propertyType = 'commercial';
    }

    // Enhanced priorities extraction
    const priorities = [
      'peaceful', 'quiet', 'tranquil', 'serene', 'relaxed',
      'family-friendly', 'family', 'kids', 'children',
      'schools', 'education', 'community', 'social',
      'ocean', 'beach', 'waterfront', 'sea', 'marina',
      'nature', 'jungle', 'mountains', 'hiking', 'wildlife',
      'luxury', 'luxurious', 'upscale', 'premium',
      'affordable', 'budget', 'value',
      'investment', 'rental', 'income',
      'modern', 'new', 'updated',
      'traditional', 'authentic', 'local'
    ];

    for (const priority of priorities) {
      if (lowerMessage.includes(priority)) {
        requirements.priorities.push(priority);
      }
    }

    return requirements;
  };

  // Generate AI response using the revolutionary reliability service
  const generateResponse = async (userMessage: string): Promise<Message> => {
    try {
      // Use the AI reliability service for enterprise-grade processing
      const response = await aiReliabilityService.processQuery(
        userMessage,
        context,
        conversationId
      );

      // Convert AIResponse to Message format
      return {
        id: Date.now().toString(),
        type: 'assistant' as const,
        content: response.content,
        timestamp: response.timestamp,
        metadata: response.metadata as Message['metadata']
      };
    } catch (error) {
      console.error('AI Reliability Service error:', error);
      // Ultimate fallback - should rarely reach here due to circuit breaker
      return await generateIntelligentFallbackResponse(userMessage);
    }
  };

  // Generate intelligent fallback response when AI is unavailable
  const generateIntelligentFallbackResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    const requirements = parseUserQuery(userMessage);

    // Provide contextual help based on detected intent and location
    if (requirements.intent === 'location_info' && requirements.location) {
      return generateLocationResponse(requirements);
    }

    if (requirements.intent === 'buying_process') {
      return generateBuyingProcessResponse(requirements, userMessage);
    }

    if (requirements.intent === 'property_search') {
      return await generatePropertySearchResponse(requirements);
    }

    if (requirements.intent === 'legal_help') {
      return generateLegalResponse(userMessage);
    }

    if (requirements.intent === 'school_info') {
      return generateSchoolResponse(requirements);
    }

    // For general queries, provide helpful guidance
    const contextualHelp = getContextualHelp(userMessage, requirements, context);

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I'm currently operating in offline mode and can't access my full AI capabilities right now. However, I can still help you with basic information:\n\n${contextualHelp}\n\nFor more detailed or complex questions, please try again when I'm fully connected.`,
      timestamp: new Date(),
      metadata: {
        type: 'fallback_response',
        actions: [
          { label: t('Try again later', 'Intentar más tarde'), action: 'try_again' },
          { label: t('Basic help', 'Ayuda básica'), action: 'basic_help' }
        ]
      }
    };
  };

  // Generate response using local knowledge base with enhanced intent recognition
  const generateLocalResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    const requirements = parseUserQuery(userMessage);

    // Route based on detected intent
    switch (requirements.intent) {
      case 'property_search':
        return await generatePropertySearchResponse(requirements);

      case 'legal_help':
        return generateLegalResponse(userMessage);

      case 'school_info':
        return generateSchoolResponse(requirements);

      case 'market_info':
        return await generateMarketResponse(requirements);

      case 'negotiation':
        return generateNegotiationResponse(requirements);

      case 'buying_process':
        return generateBuyingProcessResponse(requirements, userMessage);

      case 'location_info':
        return generateLocationResponse(requirements);

      default:
        break;
    }

    // Fallback to keyword-based routing for complex queries
    // PRIORITY 1: Handle explicit area/location information requests first
    if (lowerMessage.includes('tell me about') || lowerMessage.includes('about the area') ||
        lowerMessage.includes('what is') || lowerMessage.includes('what\'s') ||
        lowerMessage.includes('dime sobre') || lowerMessage.includes('sobre la zona') ||
        lowerMessage.includes('qué es') || lowerMessage.includes('cuéntame de')) {
      if (requirements.location) {
        return generateLocationResponse(requirements);
      }
    }

    // PRIORITY 2: Handle general buying/purchasing questions
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('buying') ||
        lowerMessage.includes('comprar') || lowerMessage.includes('adquirir') || lowerMessage.includes('what do i need') ||
        lowerMessage.includes('qué necesito') || lowerMessage.includes('how to buy') || lowerMessage.includes('cómo comprar')) {
      return generateBuyingProcessResponse(requirements, userMessage);
    }

    // PRIORITY 3: Handle property listing/search queries
    if ((lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('listing') || lowerMessage.includes('listings') ||
         lowerMessage.includes('propiedad') || lowerMessage.includes('propiedades') || lowerMessage.includes('listado') || lowerMessage.includes('listados')) &&
        (lowerMessage.includes('available') || lowerMessage.includes('for sale') || lowerMessage.includes('find') || lowerMessage.includes('show') ||
         lowerMessage.includes('disponible') || lowerMessage.includes('venta') || lowerMessage.includes('buscar') || lowerMessage.includes('mostrar'))) {
      return await generatePropertySearchResponse(requirements);
    }

    // PRIORITY 4: Handle location-specific queries (only if not property search)
    if (requirements.location && !lowerMessage.includes('properties') && !lowerMessage.includes('listings') &&
        !lowerMessage.includes('buy') && !lowerMessage.includes('purchase') && !lowerMessage.includes('comprar')) {
      return generateLocationResponse(requirements);
    }

    // PRIORITY 4: Handle general property queries
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('real estate') ||
        lowerMessage.includes('propiedad') || lowerMessage.includes('casa') || lowerMessage.includes('inmueble')) {
      return generatePropertyResponse(requirements);
    }

    // Handle follow-up and clarification requests
    if (requirements.followUp || requirements.clarification) {
      return generateFollowUpResponse(userMessage, requirements, context);
    }

    // Handle comparison requests
    if (requirements.comparison) {
      return generateComparisonResponse(requirements);
    }

    // Default contextual response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: getContextualResponse(userMessage, context),
      timestamp: new Date(),
      metadata: {
        type: 'general_response',
        actions: [
          { label: t('Learn about areas', 'Conocer zonas'), action: 'market_info' },
          { label: t('School information', 'Información escolar'), action: 'school_info' },
          { label: t('Legal guide', 'Guía legal'), action: 'legal_help' }
        ]
      }
    };
  };

  // Generate school-specific response
  const generateSchoolResponse = (requirements: any): Message => {
    let location = requirements.location;
    let areaData = null;

    // Map playa negra to nearby areas
    if (location === 'playa negra') {
      location = 'tamarindo'; // Playa Negra is near Tamarindo
    }

    // Find area data
    if (location && guanacasteKnowledge.areas[location as keyof typeof guanacasteKnowledge.areas]) {
      areaData = guanacasteKnowledge.areas[location as keyof typeof guanacasteKnowledge.areas];
    }

    if (areaData) {
      const schools = areaData.schools;
      const schoolList = schools.map((school: any) =>
        `• **${school.name}** (${school.type}, ${school.language})\n  Rating: ${school.rating}/10 - ${school.description}`
      ).join('\n\n');

      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `Here are the best schools in the ${areaData.name} area:\n\n${schoolList}\n\n**Community Notes:**\n• Expat Population: ${areaData.community.expatPopulation}\n• Family Friendly Rating: ${areaData.community.familyFriendly}/10\n• Safety Rating: ${areaData.community.safety}/10\n\nWould you like me to recommend specific areas based on your family needs, or provide more details about any of these schools?`,
          `Aquí están las mejores escuelas en la zona de ${areaData.name}:\n\n${schoolList}\n\n**Notas de Comunidad:**\n• Población Expatriada: ${areaData.community.expatPopulation}\n• Amigable para Familias: ${areaData.community.familyFriendly}/10\n• Seguridad: ${areaData.community.safety}/10\n\n¿Te gustaría que recomiende zonas específicas según las necesidades de tu familia, o dar más detalles sobre alguna de estas escuelas?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'school_info',
          data: {
            location: areaData.name,
            schools: schools,
            community: areaData.community
          },
          actions: [
            { label: t('Compare areas', 'Comparar zonas'), action: 'compare_areas' },
            { label: t('Family recommendations', 'Recomendaciones familiares'), action: 'family_recommendations' },
            { label: t('More details', 'Más detalles'), action: 'school_details' }
          ]
        }
      };
    }

    // General school response if no specific location
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `Costa Rica offers excellent educational options in Guanacaste. Here are some of the top-rated areas for families with children:\n\n🏆 **Nosara** - Outstanding international schools, peaceful environment\n🏆 **Playa Grande** - Premium education with strong expat community\n🏆 **Playa Flamingo** - Highly rated bilingual schools\n\nEach area has unique strengths. What are your priorities: international curriculum, Spanish immersion, or specific grade levels?`,
        `Costa Rica ofrece excelentes opciones educativas en Guanacaste. Aquí están algunas de las zonas mejor calificadas para familias con niños:\n\n🏆 **Nosara** - Escuelas internacionales excepcionales, ambiente tranquilo\n🏆 **Playa Grande** - Educación premium con fuerte comunidad expatriada\n🏆 **Playa Flamingo** - Escuelas bilingües altamente calificadas\n\nCada zona tiene fortalezas únicas. ¿Cuáles son tus prioridades: currículo internacional, inmersión en español, o niveles escolares específicos?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'school_overview',
        actions: [
          { label: t('Nosara schools', 'Escuelas Nosara'), action: 'nosara_schools' },
          { label: t('Playa Grande schools', 'Escuelas Playa Grande'), action: 'playa_grande_schools' },
          { label: t('Compare all', 'Comparar todas'), action: 'compare_all_schools' }
        ]
      }
    };
  };

  // Generate location-specific response
  const generateLocationResponse = (requirements: any): Message => {
    let location = requirements.location;

    // Map playa negra to nearby areas
    if (location === 'playa negra') {
      location = 'tamarindo';
    }

    const areaData = guanacasteKnowledge.areas[location as keyof typeof guanacasteKnowledge.areas];
    if (areaData) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `**${areaData.name} Overview:**\n\n🏖️ **Lifestyle:** ${areaData.lifestyle.atmosphere}\n📚 **Education:** ${areaData.schools.length} excellent schools available\n👥 **Community:** ${areaData.community.expatPopulation} expat population\n💰 **Real Estate:** ${areaData.realEstate.priceRange} average\n\n**Key Features:**\n${areaData.lifestyle.activities.map((activity: string) => `• ${activity}`).join('\n')}\n\nWould you like detailed information about schools, properties, or community life in ${areaData.name}?`,
          `**Resumen de ${areaData.name}:**\n\n🏖️ **Estilo de Vida:** ${areaData.lifestyle.atmosphere}\n📚 **Educación:** ${areaData.schools.length} excelentes escuelas disponibles\n👥 **Comunidad:** Población expatriada ${areaData.community.expatPopulation}\n💰 **Bienes Raíces:** ${areaData.realEstate.priceRange} promedio\n\n**Características Principales:**\n${areaData.lifestyle.activities.map((activity: string) => `• ${activity}`).join('\n')}\n\n¿Te gustaría información detallada sobre escuelas, propiedades, o vida comunitaria en ${areaData.name}?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'location_info',
          data: areaData,
          actions: [
            { label: t('School details', 'Detalles escolares'), action: 'school_details' },
            { label: t('Property options', 'Opciones de propiedad'), action: 'property_options' },
            { label: t('Compare areas', 'Comparar zonas'), action: 'compare_areas' }
          ]
        }
      };
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `I don't have specific information about ${requirements.location}, but Guanacaste offers many wonderful areas. Would you like me to tell you about the main family-friendly areas like Nosara, Playa Grande, or Tamarindo?`,
        `No tengo información específica sobre ${requirements.location}, pero Guanacaste ofrece muchas zonas maravillosas. ¿Te gustaría que te hable sobre las principales zonas amigables para familias como Nosara, Playa Grande, o Tamarindo?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'location_unknown',
        actions: [
          { label: t('Show top areas', 'Mostrar mejores zonas'), action: 'top_areas' },
          { label: t('Family recommendations', 'Recomendaciones familiares'), action: 'family_recommendations' }
        ]
      }
    };
  };

  // Generate property search response with actual listings
  const generatePropertySearchResponse = async (requirements: any): Promise<Message> => {
    try {
      // Build search filters from requirements
      const filters: any = {};

      if (requirements.location) {
        filters.town = requirements.location;
      }

      if (requirements.budget) {
        if (requirements.budget.min) filters.min_price = requirements.budget.min;
        if (requirements.budget.max) filters.max_price = requirements.budget.max;
      }

      if (requirements.beds) filters.beds = requirements.beds;
      if (requirements.baths) filters.baths = requirements.baths;

      // Search for properties
      const properties = await aiAPI.searchProperties(filters);

      if (!properties || properties.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: t(
            `I couldn't find any properties matching your criteria. This could be because we're currently in beta testing with sample data. Would you like me to show you general recommendations for the area instead, or help you refine your search criteria?`,
            `No pude encontrar propiedades que coincidan con tus criterios. Esto podría ser porque estamos en fase de pruebas beta con datos de muestra. ¿Te gustaría que te muestre recomendaciones generales para la zona, o te ayude a refinar tus criterios de búsqueda?`
          ),
          timestamp: new Date(),
          metadata: {
            type: 'no_properties_found',
            actions: [
              { label: t('Show recommendations', 'Mostrar recomendaciones'), action: 'show_recommendations' },
              { label: t('Refine search', 'Refinar búsqueda'), action: 'refine_search' }
            ]
          }
        };
      }

      // Format property listings
      const propertyListings = properties.slice(0, 3).map((property: any, index: number) => {
        const price = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: property.currency,
          minimumFractionDigits: 0,
        }).format(property.price_numeric);

        return `${index + 1}. **${property.title}**\n   💰 ${price}\n   📍 ${property.town || 'Location TBA'}\n   🛏️ ${property.beds || 'N/A'} beds, 🛁 ${property.baths || 'N/A'} baths\n   📐 ${property.area_m2 ? property.area_m2 + 'm²' : 'Area TBA'}\n   ${property.description_md ? property.description_md.split('\n')[0] : ''}`;
      }).join('\n\n');

      const totalFound = properties.length;
      const moreAvailable = totalFound > 3 ? `\n\n*And ${totalFound - 3} more properties...*` : '';

      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `🎉 **Found ${totalFound} properties matching your criteria!**\n\n*Note: These are BETA TEST properties with sample data for demonstration purposes.*\n\n${propertyListings}${moreAvailable}\n\nWould you like me to show you more details about any of these properties, refine your search, or help you with the next steps in the buying process?`,
          `🎉 **¡Encontré ${totalFound} propiedades que coinciden con tus criterios!**\n\n*Nota: Estas son propiedades de PRUEBA BETA con datos de muestra para demostración.*\n\n${propertyListings}${moreAvailable}\n\n¿Te gustaría que te muestre más detalles sobre alguna de estas propiedades, refinar tu búsqueda, o ayudarte con los siguientes pasos en el proceso de compra?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'property_search_results',
          data: {
            properties: properties.slice(0, 3),
            totalFound,
            searchFilters: filters
          },
          actions: [
            { label: t('More details', 'Más detalles'), action: 'property_details' },
            { label: t('Refine search', 'Refinar búsqueda'), action: 'refine_search' },
            { label: t('Buying process', 'Proceso de compra'), action: 'buying_process' }
          ]
        }
      };
    } catch (error) {
      console.error('Property search error:', error);
      return generatePropertyResponse(requirements); // Fallback to recommendations
    }
  };

  // Generate property-related response
  const generatePropertyResponse = (requirements: any): Message => {
    let recommendations = [];

    if (requirements.privateSchools || requirements.expatCommunity || requirements.children) {
      recommendations = ['nosara', 'playa grande'];
    } else if (requirements.budget && requirements.budget.max < 1000000) {
      recommendations = ['samara', 'tamarindo'];
    } else {
      recommendations = ['playa grande', 'playa flamingo'];
    }

    const area1 = guanacasteKnowledge.areas[recommendations[0] as keyof typeof guanacasteKnowledge.areas];
    const area2 = guanacasteKnowledge.areas[recommendations[1] as keyof typeof guanacasteKnowledge.areas];

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `Based on your requirements, I recommend these areas:\n\n🏠 **${area1.name}:** ${area1.realEstate.priceRange}, ${area1.schools.length} excellent schools\n🏠 **${area2.name}:** ${area2.realEstate.priceRange}, ${area2.schools.length} excellent schools\n\nBoth offer beautiful properties and family-friendly communities. Would you like me to show you specific property listings or provide more details about either area?`,
        `Basándome en tus requisitos, recomiendo estas zonas:\n\n🏠 **${area1.name}:** ${area1.realEstate.priceRange}, ${area1.schools.length} excelentes escuelas\n🏠 **${area2.name}:** ${area2.realEstate.priceRange}, ${area2.schools.length} excelentes escuelas\n\nAmbas ofrecen propiedades hermosas y comunidades amigables para familias. ¿Te gustaría que te muestre listados específicos de propiedades o dar más detalles sobre alguna zona?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'property_recommendations',
        data: {
          recommendedAreas: [area1.name, area2.name]
        },
        actions: [
          { label: t('View properties', 'Ver propiedades'), action: 'view_properties' },
          { label: t('Area details', 'Detalles de zona'), action: 'area_details' },
          { label: t('Investment analysis', 'Análisis de inversión'), action: 'investment_analysis' }
        ]
      }
    };
  };

  // Generate legal response with intelligent topic detection
  const generateLegalResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();

    // Detect specific legal topics
    const isMaritime = lowerMessage.includes('maritime') || lowerMessage.includes('marítima') || lowerMessage.includes('zmt') || lowerMessage.includes('beach') || lowerMessage.includes('playa') || lowerMessage.includes('ocean') || lowerMessage.includes('mar');
    const isTax = lowerMessage.includes('tax') || lowerMessage.includes('impuesto') || lowerMessage.includes('transfer') || lowerMessage.includes('capital gains') || lowerMessage.includes('ganancias');
    const isTitle = lowerMessage.includes('title') || lowerMessage.includes('titulo') || lowerMessage.includes('registry') || lowerMessage.includes('registro') || lowerMessage.includes('folio');
    const isOwnership = lowerMessage.includes('ownership') || lowerMessage.includes('propiedad') || lowerMessage.includes('foreign') || lowerMessage.includes('extranjero') || lowerMessage.includes('entity') || lowerMessage.includes('entidad');
    const isDueDiligence = lowerMessage.includes('due diligence') || lowerMessage.includes('debida diligencia') || lowerMessage.includes('checklist') || lowerMessage.includes('verify') || lowerMessage.includes('verificar');
    const isTransaction = lowerMessage.includes('transaction') || lowerMessage.includes('transacción') || lowerMessage.includes('closing') || lowerMessage.includes('cierre') || lowerMessage.includes('notary') || lowerMessage.includes('notario');
    const isCondominium = lowerMessage.includes('condo') || lowerMessage.includes('condominium') || lowerMessage.includes('condominio') || lowerMessage.includes('hoa') || lowerMessage.includes('asociación');
    const isEnvironmental = lowerMessage.includes('environmental') || lowerMessage.includes('ambiental') || lowerMessage.includes('setena') || lowerMessage.includes('zoning') || lowerMessage.includes('uso de suelo');

    // Provide targeted response based on detected topic
    if (isMaritime) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `**🏖️ Maritime Zone (ZMT) Laws in Costa Rica:**\n\nCosta Rica's coastline is divided into maritime zones with strict regulations:\n\n**📏 Zone Classifications:**\n• **0-50 meters from high tide:** Public domain - no construction allowed\n• **50-200 meters:** Maritime-terrestrial zone - restricted construction\n• **200+ meters:** Private property - normal construction rules apply\n\n**🏗️ Construction Restrictions:**\n• Buildings must be set back minimum distances from high tide line\n• Maximum height limits (typically 2-3 stories)\n• Environmental impact studies required\n• Municipal concessions needed for any development\n\n**🏠 Property Types in Maritime Zones:**\n• **Concessions:** Temporary rights (20-30 years) for tourism development\n• **Fee-simple:** Rare, only in established areas like Tamarindo\n• **Building rights:** Separate from land ownership\n\n**⚖️ Key Legal Points:**\n• Concessions are not true property ownership\n• High tide line can change, affecting property boundaries\n• SETENA approval required for environmental compliance\n• Municipal permits needed for construction\n\n**💡 Important Note:** Maritime zone properties require specialized legal review. Always consult a Costa Rican attorney familiar with coastal regulations.\n\nWould you like information about specific beach areas or concession processes?`,
          `**🏖️ Leyes de Zona Marítima (ZMT) en Costa Rica:**\n\nLa costa de Costa Rica está dividida en zonas marítimas con regulaciones estrictas:\n\n**📏 Clasificaciones de Zona:**\n• **0-50 metros de marea alta:** Dominio público - no se permite construcción\n• **50-200 metros:** Zona marítimo-terrestre - construcción restringida\n• **200+ metros:** Propiedad privada - reglas normales de construcción aplican\n\n**🏗️ Restricciones de Construcción:**\n• Los edificios deben tener retiros mínimos de la línea de marea alta\n• Límites de altura máxima (típicamente 2-3 pisos)\n• Estudios de impacto ambiental requeridos\n• Concesiones municipales necesarias para cualquier desarrollo\n\n**🏠 Tipos de Propiedad en Zonas Marítimas:**\n• **Concesiones:** Derechos temporales (20-30 años) para desarrollo turístico\n• **Dominio pleno:** Raro, solo en áreas establecidas como Tamarindo\n• **Derechos de construcción:** Separados de la propiedad de la tierra\n\n**⚖️ Puntos Legales Clave:**\n• Las concesiones no son propiedad verdadera\n• La línea de marea alta puede cambiar, afectando límites de propiedad\n• Aprobación SETENA requerida para cumplimiento ambiental\n• Permisos municipales necesarios para construcción\n\n**💡 Nota Importante:** Las propiedades de zona marítima requieren revisión legal especializada. Siempre consulte a un abogado costarricense familiarizado con regulaciones costeras.\n\n¿Te gustaría información sobre áreas específicas de playa o procesos de concesión?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'legal_info',
          data: { topic: 'maritime_zones' },
          actions: [
            { label: t('Concession process', 'Proceso concesión'), action: 'concession_process' },
            { label: t('Beach areas guide', 'Guía áreas playa'), action: 'beach_areas' },
            { label: t('Environmental permits', 'Permisos ambientales'), action: 'environmental_permits' }
          ]
        }
      };
    }

    if (isTax) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `**💰 Costa Rica Property Taxes & Closing Costs:**\n\n**🏠 Transfer Tax (Impuesto de Traspaso):**\n• 1.5% of the higher value between sale price or fiscal appraisal\n• Paid by buyer, split possible by negotiation\n• Calculated on the entire property value\n\n**📄 Stamp Tax (Timbre):**\n• 0.8% of the sale price\n• Additional notary fees: 1.0-1.25%\n• Total notary costs: ~1.8-2.05%\n\n**⚖️ Capital Gains Tax (for Sellers):**\n• 15% on net capital gain\n• Calculated as: Sale Price - Adjusted Cost Basis\n• Foreign sellers: Additional 2.5% withholding tax\n\n**🏛️ Annual Property Taxes:**\n• Municipal tax: 0.25% of fiscal appraisal\n• Territorial tax: Varies by municipality (0.1-0.3%)\n• Total annual: ~0.35-0.55% of property value\n\n**📊 Total Closing Costs for Buyer:**\n• Transfer tax: 1.5%\n• Stamp tax: 0.8%\n• Notary fees: 1.0-1.25%\n• Legal fees: 1-2%\n• **Total: ~4.3-5.55%**\n\n**💡 Tax Optimization:**\n• Use Costa Rican entity for foreign ownership\n• Consider rental income for tax benefits\n• Consult tax advisor for international implications\n\nWould you like details about tax-efficient ownership structures?`,
          `**💰 Impuestos y Costos de Cierre de Propiedades en Costa Rica:**\n\n**🏠 Impuesto de Traspaso:**\n• 1.5% del valor más alto entre precio de venta o avalúo fiscal\n• Pagado por el comprador, posible dividir por negociación\n• Calculado sobre el valor total de la propiedad\n\n**📄 Impuesto de Timbre:**\n• 0.8% del precio de venta\n• Honorarios notariales adicionales: 1.0-1.25%\n• Costos notariales totales: ~1.8-2.05%\n\n**⚖️ Impuesto a las Ganancias de Capital (para Vendedores):**\n• 15% sobre ganancia neta de capital\n• Calculado como: Precio de Venta - Base de Costo Ajustada\n• Vendedores extranjeros: Retención adicional del 2.5%\n\n**🏛️ Impuestos Anuales de Propiedad:**\n• Impuesto municipal: 0.25% del avalúo fiscal\n• Impuesto territorial: Varía por municipio (0.1-0.3%)\n• Total anual: ~0.35-0.55% del valor de la propiedad\n\n**📊 Costos Totales de Cierre para Comprador:**\n• Impuesto traspaso: 1.5%\n• Impuesto timbre: 0.8%\n• Honorarios notario: 1.0-1.25%\n• Honorarios legales: 1-2%\n• **Total: ~4.3-5.55%**\n\n**💡 Optimización Fiscal:**\n• Usar entidad costarricense para propiedad extranjera\n• Considerar ingresos por alquiler para beneficios fiscales\n• Consultar asesor fiscal para implicaciones internacionales\n\n¿Te gustaría detalles sobre estructuras de propiedad eficientes en impuestos?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'legal_info',
          data: { topic: 'taxes_costs' },
          actions: [
            { label: t('Tax optimization', 'Optimización fiscal'), action: 'tax_optimization' },
            { label: t('Closing checklist', 'Lista de cierre'), action: 'closing_checklist' },
            { label: t('Foreign ownership taxes', 'Impuestos propiedad extranjera'), action: 'foreign_ownership_taxes' }
          ]
        }
      };
    }

    if (isTitle) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `**📋 Costa Rica Title Registry & Due Diligence:**\n\n**🏛️ Property Registry System:**\n• **Folio Real:** Unique property identifier linking owner, history, and liens\n• **Electronic Registry:** All transactions recorded digitally since 2010\n• **Public Access:** Anyone can search property records online\n\n**🔍 Essential Due Diligence Documents:**\n• **Certificado Literal:** Complete title history and current status\n• **Certificado de Libertad de Gravámenes:** Confirms no liens or encumbrances\n• **Plano Catastrado:** Official survey showing exact boundaries\n• **Certificado Municipal:** Confirms property taxes paid, zoning compliance\n\n**⚠️ Critical Checks:**\n• Verify all previous owners and transfer dates\n• Cross-reference survey with physical boundaries\n• Check for easements, servitudes, or restrictions\n• Confirm property matches tax records\n\n**📅 Due Diligence Timeline:**\n• Title search: 5-10 business days\n• Survey verification: 3-5 days\n• Municipal certificates: 2-3 days\n• Total process: 10-15 days\n\n**🚨 Red Flags to Watch For:**\n• Gaps in title chain\n• Multiple overlapping claims\n• Recent boundary disputes\n• Environmental restrictions\n\n**💡 Professional Recommendation:** Always use a Costa Rican attorney or notary for title verification. They have access to official databases and can identify issues that might be missed.\n\nWould you like the complete due diligence checklist?`,
          `**📋 Registro de Títulos y Debida Diligencia en Costa Rica:**\n\n**🏛️ Sistema de Registro de Propiedad:**\n• **Folio Real:** Identificador único de propiedad que vincula propietario, historia y gravámenes\n• **Registro Electrónico:** Todas las transacciones registradas digitalmente desde 2010\n• **Acceso Público:** Cualquiera puede buscar registros de propiedad en línea\n\n**🔍 Documentos Esenciales de Debida Diligencia:**\n• **Certificado Literal:** Historia completa del título y estado actual\n• **Certificado de Libertad de Gravámenes:** Confirma no hay gravámenes o cargas\n• **Plano Catastrado:** Levantamiento oficial mostrando límites exactos\n• **Certificado Municipal:** Confirma impuestos pagados, cumplimiento de zonificación\n\n**⚠️ Verificaciones Críticas:**\n• Verificar todos los propietarios anteriores y fechas de transferencia\n• Cruzar referencia del levantamiento con límites físicos\n• Verificar servidumbres, servidumbres o restricciones\n• Confirmar propiedad coincide con registros fiscales\n\n**📅 Cronograma de Debida Diligencia:**\n• Búsqueda de título: 5-10 días hábiles\n• Verificación de levantamiento: 3-5 días\n• Certificados municipales: 2-3 días\n• Proceso total: 10-15 días\n\n**🚨 Señales de Alerta:**\n• Huecos en la cadena de título\n• Múltiples reclamos superpuestos\n• Disputas recientes de límites\n• Restricciones ambientales\n\n**💡 Recomendación Profesional:** Siempre use un abogado o notario costarricense para verificación de título. Tienen acceso a bases de datos oficiales y pueden identificar problemas que podrían pasarse por alto.\n\n¿Te gustaría la lista completa de diligencia debida?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'legal_info',
          data: { topic: 'title_registry' },
          actions: [
            { label: t('Due diligence checklist', 'Lista diligencia debida'), action: 'due_diligence_checklist' },
            { label: t('Title search process', 'Proceso búsqueda título'), action: 'title_search_process' },
            { label: t('Red flags guide', 'Guía señales alerta'), action: 'red_flags_guide' }
          ]
        }
      };
    }

    // Default to comprehensive overview if no specific topic detected
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `**Costa Rica Real Estate Law Overview:**\n\nCosta Rica's real estate law follows a civil law system with key regulations under the Civil Code, Property Registry Law, and environmental statutes. Foreigners can own property directly or through Costa Rican entities.\n\n**🏠 Ownership & Foreign Ownership:**\n• Direct title or via S.A./S.R.L. entities\n• Coastal concessions limit foreign participation\n• Residency via property investment possible\n\n**📋 Title Registry & Due Diligence:**\n• Folio Real links owner, history, liens\n• Verify literal extract, liens, plano catastrado\n• Cross-check surveys, resolve overlaps\n\n**🏖️ Maritime Zone (ZMT) & Concessions:**\n• 0-50m: Public use (no construction)\n• 50-200m: Restricted (municipal concessions)\n• Concessions not fee-simple ownership\n\n**💰 Taxes & Closing Costs:**\n• Transfer tax: ~1.5% of higher price/fiscal value\n• Stamps: ~0.8%, Notary: 1.0-1.25%\n• Total buyer costs: ~3.5-4.0%\n• Seller capital gains: ~15%\n\n**📝 Key Due Diligence Checklist:**\n• Title extract, tax receipts, land-use letter\n• Water/electrical capacity, environmental screening\n• Seller authority, condominium docs, easements\n\nAlways use a Notario Público and treat missing documents as closing conditions.\n\nWhat specific legal aspect interests you most?`,
        `**Resumen de Leyes de Bienes Raíces en Costa Rica:**\n\nLa ley de bienes raíces de Costa Rica sigue un sistema de derecho civil con regulaciones clave bajo el Código Civil, Ley del Registro de la Propiedad y estatutos ambientales. Los extranjeros pueden poseer propiedad directamente o a través de entidades costarricenses.\n\n**🏠 Propiedad y Propiedad Extranjera:**\n• Título directo o vía entidades S.A./S.R.L.\n• Concesiones costeras limitan participación extranjera\n• Residencia vía inversión en propiedad posible\n\n**📋 Registro de Títulos y Debida Diligencia:**\n• Folio Real vincula propietario, historia, gravámenes\n• Verificar extracto literal, gravámenes, plano catastrado\n• Cruzar verificaciones de encuestas, resolver superposiciones\n\n**🏖️ Zona Marítima (ZMT) y Concesiones:**\n• 0-50m: Uso público (sin construcción)\n• 50-200m: Restringido (concesiones municipales)\n• Concesiones no son propiedad absoluta\n\n**💰 Impuestos y Costos de Cierre:**\n• Impuesto transferencia: ~1.5% del precio más alto/valor fiscal\n• Sellos: ~0.8%, Notario: 1.0-1.25%\n• Costos totales comprador: ~3.5-4.0%\n• Ganancias capital vendedor: ~15%\n\n**📝 Lista de Debida Diligencia Clave:**\n• Extracto de título, recibos impuestos, carta uso suelo\n• Capacidad agua/eléctrica, tamizaje ambiental\n• Autoridad vendedor, docs condominio, servidumbres\n\nSiempre use un Notario Público y trate documentos faltantes como condiciones de cierre.\n\n¿En qué aspecto legal específico estás más interesado?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'legal_info',
        actions: [
          { label: t('Maritime laws', 'Leyes marítimas'), action: 'maritime_laws' },
          { label: t('Taxes & costs', 'Impuestos y costos'), action: 'taxes_costs' },
          { label: t('Title registry', 'Registro títulos'), action: 'title_registry' },
          { label: t('Due diligence', 'Debida diligencia'), action: 'due_diligence' }
        ]
      }
    };
  };

  // Generate market response with real-time data
  const generateMarketResponse = async (requirements?: any): Promise<Message> => {
    try {
      const marketAnalysis = await marketDataService.getMarketAnalysis(requirements?.location);

      let content = t(
        `**Guanacaste Real Estate Market Overview:**\n\n📈 **Current Trends:**\n`,
        `**Resumen del Mercado Inmobiliario de Guanacaste:**\n\n📈 **Tendencias Actuales:**\n`
      );

      // Add market insights
      marketAnalysis.insights.forEach(insight => {
        content += `• ${insight}\n`;
      });

      // Add location-specific data if available
      if (marketAnalysis.locationData) {
        const data = marketAnalysis.locationData;
        const priceChangeSymbol = data.priceChange > 0 ? '📈' : '📉';
        const priceChangeText = `${priceChangeSymbol} ${Math.abs(data.priceChange)}%`;

        content += t(
          `\n🏠 **${data.location} Market Data:**\n• Average Price: $${data.averagePrice.toLocaleString()}\n• Price Change: ${priceChangeText}\n• Active Listings: ${data.inventoryCount}\n• Days on Market: ${data.daysOnMarket}\n`,
          `\n🏠 **Datos de Mercado ${data.location}:**\n• Precio Promedio: $${data.averagePrice.toLocaleString()}\n• Cambio de Precio: ${priceChangeText}\n• Listados Activos: ${data.inventoryCount}\n• Días en Mercado: ${data.daysOnMarket}\n`
        );
      }

      // Add economic indicators
      if (marketAnalysis.economics) {
        const econ = marketAnalysis.economics;
        content += t(
          `\n💱 **Economic Indicators:**\n• USD/CRC Rate: ${econ.usdToCrc}\n• Interest Rate: ${econ.interestRate}%\n• Inflation: ${econ.inflation}%\n`,
          `\n💱 **Indicadores Económicos:**\n• Tasa USD/CRC: ${econ.usdToCrc}\n• Tasa de Interés: ${econ.interestRate}%\n• Inflación: ${econ.inflation}%\n`
        );
      }

      // Add trend summary
      const yearlyTrend = marketAnalysis.trends.find(t => t.period === '1Y');
      if (yearlyTrend) {
        content += t(
          `\n📊 **Annual Market Performance:**\n• Price Growth: ${yearlyTrend.priceChange > 0 ? '+' : ''}${yearlyTrend.priceChange}%\n• Volume Change: ${yearlyTrend.volumeChange > 0 ? '+' : ''}${yearlyTrend.volumeChange}%\n• New Listings: ${yearlyTrend.newListings}\n`,
          `\n📊 **Rendimiento Anual del Mercado:**\n• Crecimiento de Precios: ${yearlyTrend.priceChange > 0 ? '+' : ''}${yearlyTrend.priceChange}%\n• Cambio de Volumen: ${yearlyTrend.volumeChange > 0 ? '+' : ''}${yearlyTrend.volumeChange}%\n• Nuevos Listados: ${yearlyTrend.newListings}\n`
        );
      }

      content += t(
        `\n*Market data is updated regularly. For investment advice, consult a qualified professional.*\n\nWould you like detailed analysis of any specific area or price trends?`,
        `\n*Los datos del mercado se actualizan regularmente. Para consejos de inversión, consulte a un profesional calificado.*\n\n¿Te gustaría análisis detallado de alguna zona específica o tendencias de precios?`
      );

      return {
        id: Date.now().toString(),
        type: 'assistant',
        content,
        timestamp: new Date(),
        metadata: {
          type: 'market_data',
          data: marketAnalysis,
          actions: [
            { label: t('Area analysis', 'Análisis de zona'), action: 'area_analysis' },
            { label: t('Investment opportunities', 'Oportunidades de inversión'), action: 'investment_opportunities' },
            { label: t('Price trends', 'Tendencias de precios'), action: 'price_trends' }
          ]
        }
      };
    } catch (error) {
      console.error('Error generating market response:', error);
      // Fallback to basic market response
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `**Guanacaste Real Estate Market Overview:**\n\n📈 **Current Trends:**\n• Strong international demand\n• Premium properties appreciating\n• Family-friendly areas growing\n\n💰 **Price Ranges by Area:**\n• Tamarindo: $400k - $2M\n• Playa Grande: $800k - $4M\n• Nosara: $600k - $2.5M\n• Sámara: $350k - $1.2M\n\n📊 **Market Status:** Stable growth with high demand\n\nWould you like detailed analysis of any specific area or price trends?`,
          `**Resumen del Mercado Inmobiliario de Guanacaste:**\n\n📈 **Tendencias Actuales:**\n• Fuerte demanda internacional\n• Propiedades premium apreciándose\n• Zonas amigables para familias creciendo\n\n💰 **Rangos de Precios por Zona:**\n• Tamarindo: $400k - $2M\n• Playa Grande: $800k - $4M\n• Nosara: $600k - $2.5M\n• Sámara: $350k - $1.2M\n\n📊 **Estado del Mercado:** Crecimiento estable con alta demanda\n\n¿Te gustaría análisis detallado de alguna zona específica o tendencias de precios?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'market_data',
          actions: [
            { label: t('Area analysis', 'Análisis de zona'), action: 'area_analysis' },
            { label: t('Investment opportunities', 'Oportunidades de inversión'), action: 'investment_opportunities' },
            { label: t('Price trends', 'Tendencias de precios'), action: 'price_trends' }
          ]
        }
      };
    }
  };

  // Generate negotiation response
  const generateNegotiationResponse = (requirements: any): Message => {
    const urgencyText = requirements.urgency === 'urgent' ? 'I understand this is time-sensitive. ' :
                        requirements.urgency === 'casual' ? 'We can take our time with this. ' : '';

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `${urgencyText}**Costa Rica Property Negotiation Guide:**\n\n🤝 **Negotiation Culture:**\n• Respectful and relationship-focused\n• Both parties expect fair deals\n• Professional representation recommended\n\n💰 **Typical Negotiation Ranges:**\n• 5-15% below asking price for motivated sellers\n• Consider all costs: transfer tax, legal fees, closing\n• Multiple offers can create competition\n\n📋 **Key Negotiation Points:**\n• Price and payment terms\n• Closing timeline and conditions\n• Property condition and repairs\n• Furniture/appliances included\n\n🎯 **Strategy Tips:**\n• Get professional inspection first\n• Have all contingencies in writing\n• Work with local attorney experienced in real estate\n\nWould you like me to help analyze a specific offer or prepare negotiation points?`,
        `${urgencyText}**Guía de Negociación de Propiedades en Costa Rica:**\n\n🤝 **Cultura de Negociación:**\n• Respetuosa y enfocada en relaciones\n• Ambas partes esperan tratos justos\n• Se recomienda representación profesional\n\n💰 **Rangos Típicos de Negociación:**\n• 5-15% por debajo del precio pedido para vendedores motivados\n• Considerar todos los costos: impuesto transferencia, honorarios legales, cierre\n• Múltiples ofertas pueden crear competencia\n\n📋 **Puntos Clave de Negociación:**\n• Precio y términos de pago\n• Cronograma de cierre y condiciones\n• Condición de la propiedad y reparaciones\n• Muebles/electrodomésticos incluidos\n\n🎯 **Consejos de Estrategia:**\n• Obtener inspección profesional primero\n• Tener todas las contingencias por escrito\n• Trabajar con abogado local experimentado en bienes raíces\n\n¿Te gustaría que analice una oferta específica o prepare puntos de negociación?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'negotiation',
        actions: [
          { label: t('Analyze offer', 'Analizar oferta'), action: 'analyze_offer' },
          { label: t('Prepare strategy', 'Preparar estrategia'), action: 'prepare_strategy' },
          { label: t('Legal checklist', 'Lista legal'), action: 'legal_checklist' }
        ]
      }
    };
  };

  // Generate buying process response
  const generateBuyingProcessResponse = (requirements: any, userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    const isOceanfront = lowerMessage.includes('oceanfront') || lowerMessage.includes('beachfront') ||
                        lowerMessage.includes('ocean') || lowerMessage.includes('playa') || lowerMessage.includes('marítima');

    let additionalInfo = '';
    if (isOceanfront) {
      additionalInfo = t(
        `\n\n**🏖️ Special Considerations for Oceanfront Properties:**\n• **Maritime Zone Laws:** Properties within 50-200m of high tide line have construction restrictions\n• **Concessions:** Many beachfront properties are long-term concessions, not fee-simple ownership\n• **Environmental Permits:** SETENA approval required for any construction or modifications\n• **High Tide Line:** Can change over time, potentially affecting property boundaries\n• **Construction Limits:** Maximum 2-3 stories, specific setback requirements\n• **Higher Due Diligence:** Requires specialized legal review for coastal regulations\n\n**💡 Oceanfront Tip:** Always include "maritime zone analysis" in your due diligence checklist.`,
        `\n\n**🏖️ Consideraciones Especiales para Propiedades Frente al Mar:**\n• **Leyes de Zona Marítima:** Propiedades dentro de 50-200m de marea alta tienen restricciones de construcción\n• **Concesiones:** Muchas propiedades frente al mar son concesiones a largo plazo, no propiedad absoluta\n• **Permisos Ambientales:** Aprobación SETENA requerida para cualquier construcción o modificación\n• **Línea de Marea Alta:** Puede cambiar con el tiempo, potencialmente afectando límites de propiedad\n• **Límites de Construcción:** Máximo 2-3 pisos, requisitos específicos de retiro\n• **Diligencia Debida Superior:** Requiere revisión legal especializada para regulaciones costeras\n\n**💡 Consejo para Costa:** Siempre incluye "análisis de zona marítima" en tu lista de diligencia debida.`
      );
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `**🏠 Complete Guide to Buying Property in Guanacaste, Costa Rica:**\n\nI'm your Costa Rican real estate expert, and I'll walk you through the entire buying process step by step. Here's what you need to know:${additionalInfo}\n\n**📋 Phase 1: Research & Planning (1-4 weeks)**\n• **Define your needs:** Budget, location preferences, property type, timeline\n• **Research areas:** Compare Guanacaste towns (Tamarindo, Playa Grande, Nosara, etc.)\n• **Legal requirements:** Understand foreign ownership rules and residency options\n• **Financing:** Explore mortgage options and currency considerations\n\n**🔍 Phase 2: Property Search & Selection (2-12 weeks)**\n• **Work with a local Realtor:** Essential for navigating the market\n• **Property tours:** Visit multiple properties, compare amenities\n• **Initial offers:** Submit offer-to-purchase agreements\n• **Due diligence period:** 30-45 days to investigate the property\n\n**⚖️ Phase 3: Legal Due Diligence (30-45 days)**\n• **Title search:** Verify ownership history and liens\n• **Survey verification:** Confirm boundaries and measurements\n• **Environmental checks:** SETENA permits, water/electrical capacity\n• **Zoning confirmation:** Uso de suelo certificate\n• **Property inspection:** Professional assessment of condition\n\n**📝 Phase 4: Contract & Closing (2-4 weeks)**\n• **Purchase agreement:** Formal contract with conditions\n• **Notary process:** Government registration and transfer tax\n• **Closing costs:** 4.3-5.55% of purchase price (transfer tax, legal fees, notary)\n• **Property transfer:** Title registration in your name\n\n**💰 Key Costs to Budget For:**\n• **Transfer tax:** 1.5% of sale price\n• **Notary fees:** 1.0-1.25% + stamps (0.8%)\n• **Legal fees:** 1-2% for attorney and due diligence\n• **Closing costs:** ~4.3-5.55% total\n• **Annual property taxes:** 0.35-0.55% of assessed value\n\n**⚠️ Critical Tips:**\n• Always use a Costa Rican attorney experienced in real estate\n• Never wire money without proper legal protection\n• All contracts must be in Spanish (bilingual attorney recommended)\n• Due diligence is non-refundable but protects your investment\n\n**🎯 Next Steps:**\nWhat stage are you in? Do you need help finding properties, understanding legal requirements, or preparing for your due diligence process?`,
        `**🏠 Guía Completa para Comprar Propiedad en Guanacaste, Costa Rica:**\n\nSoy tu experto en bienes raíces costarricense, y te guiaré a través de todo el proceso de compra paso a paso. Aquí está lo que necesitas saber:${additionalInfo}\n\n**📋 Fase 1: Investigación y Planificación (1-4 semanas)**\n• **Define tus necesidades:** Presupuesto, preferencias de ubicación, tipo de propiedad, cronograma\n• **Investiga zonas:** Compara pueblos de Guanacaste (Tamarindo, Playa Grande, Nosara, etc.)\n• **Requisitos legales:** Entiende reglas de propiedad extranjera y opciones de residencia\n• **Financiamiento:** Explora opciones de hipoteca y consideraciones de moneda\n\n**🔍 Fase 2: Búsqueda y Selección de Propiedad (2-12 semanas)**\n• **Trabaja con un Realtor local:** Esencial para navegar el mercado\n• **Visitas a propiedades:** Visita múltiples propiedades, compara amenidades\n• **Ofertas iniciales:** Presenta contratos de oferta de compra\n• **Período de diligencia debida:** 30-45 días para investigar la propiedad\n\n**⚖️ Fase 3: Diligencia Debida Legal (30-45 días)**\n• **Búsqueda de título:** Verifica historia de propiedad y gravámenes\n• **Verificación de levantamiento:** Confirma límites y mediciones\n• **Verificaciones ambientales:** Permisos SETENA, capacidad agua/eléctrica\n• **Confirmación de zonificación:** Certificado uso de suelo\n• **Inspección de propiedad:** Evaluación profesional de condición\n\n**📝 Fase 4: Contrato y Cierre (2-4 semanas)**\n• **Acuerdo de compra:** Contrato formal con condiciones\n• **Proceso notarial:** Registro gubernamental e impuesto de transferencia\n• **Costos de cierre:** 4.3-5.55% del precio de compra (impuesto transferencia, honorarios legales, notario)\n• **Transferencia de propiedad:** Registro de título a tu nombre\n\n**💰 Costos Clave para Presupuestar:**\n• **Impuesto transferencia:** 1.5% del precio de venta\n• **Honorarios notariales:** 1.0-1.25% + timbres (0.8%)\n• **Honorarios legales:** 1-2% para abogado y diligencia debida\n• **Costos de cierre:** ~4.3-5.55% total\n• **Impuestos anuales:** 0.35-0.55% del valor catastrado\n\n**⚠️ Consejos Críticos:**\n• Siempre usa un abogado costarricense experimentado en bienes raíces\n• Nunca transfieras dinero sin protección legal apropiada\n• Todos los contratos deben estar en español (abogado bilingüe recomendado)\n• La diligencia debida no es reembolsable pero protege tu inversión\n\n**🎯 Próximos Pasos:**\n¿En qué etapa estás? ¿Necesitas ayuda encontrando propiedades, entendiendo requisitos legales, o preparándote para tu proceso de diligencia debida?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'buying_process',
        data: { topic: 'complete_buying_guide', isOceanfront },
        actions: [
          { label: t('Find properties', 'Buscar propiedades'), action: 'find_properties' },
          { label: t('Legal requirements', 'Requisitos legales'), action: 'legal_requirements' },
          { label: t('Due diligence guide', 'Guía diligencia debida'), action: 'due_diligence_guide' },
          { label: t('Cost breakdown', 'Desglose de costos'), action: 'cost_breakdown' }
        ]
      }
    };
  };

  // Generate follow-up response
  const generateFollowUpResponse = (userMessage: string, requirements: any, context: ConversationContext): Message => {
    // Use conversation context to provide relevant follow-up
    if (context.lastTopic === 'property_search_results') {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `I'd be happy to provide more details about those properties. Which one interests you most, or would you like me to search for different criteria? I can also help with the next steps in the buying process.`,
          `Me encantaría darte más detalles sobre esas propiedades. ¿Cuál te interesa más, o te gustaría que busque con criterios diferentes? También puedo ayudarte con los siguientes pasos en el proceso de compra.`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'follow_up',
          actions: [
            { label: t('More property details', 'Más detalles'), action: 'property_details' },
            { label: t('Refine search', 'Refinar búsqueda'), action: 'refine_search' },
            { label: t('Buying process', 'Proceso de compra'), action: 'buying_process' }
          ]
        }
      };
    }

    if (context.lastTopic === 'legal_info') {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `Regarding your legal question, Costa Rica has specific requirements for foreign property ownership. Would you like me to explain any particular aspect in more detail, such as title transfer, tax implications, or the due diligence process?`,
          `Respecto a tu pregunta legal, Costa Rica tiene requisitos específicos para propiedad extranjera. ¿Te gustaría que explique algún aspecto en particular con más detalle, como transferencia de título, implicaciones fiscales, o el proceso de diligencia debida?`
        ),
        timestamp: new Date(),
        metadata: {
          type: 'follow_up',
          actions: [
            { label: t('Title process', 'Proceso título'), action: 'title_process' },
            { label: t('Tax details', 'Detalles impuestos'), action: 'tax_details' },
            { label: t('Due diligence', 'Diligencia debida'), action: 'due_diligence' }
          ]
        }
      };
    }

    // Generic follow-up
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `I'd be happy to elaborate on that. What specific aspect would you like me to explain further, or would you like information on a different topic?`,
        `Me encantaría elaborar sobre eso. ¿Qué aspecto específico te gustaría que explique más, o te gustaría información sobre un tema diferente?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'follow_up',
        actions: [
          { label: t('More details', 'Más detalles'), action: 'more_details' },
          { label: t('Different topic', 'Tema diferente'), action: 'different_topic' }
        ]
      }
    };
  };

  // Generate comparison response
  const generateComparisonResponse = (requirements: any): Message => {
    if (requirements.location) {
      // Compare areas
      const area1 = requirements.location;
      const area2 = requirements.location === 'tamarindo' ? 'nosara' :
                   requirements.location === 'nosara' ? 'playa grande' :
                   'tamarindo';

      const area1Data = guanacasteKnowledge.areas[area1 as keyof typeof guanacasteKnowledge.areas];
      const area2Data = guanacasteKnowledge.areas[area2 as keyof typeof guanacasteKnowledge.areas];

      if (area1Data && area2Data) {
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: t(
            `**Comparing ${area1Data.name} vs ${area2Data.name}:**\n\n🏖️ **Lifestyle:**\n• ${area1Data.name}: ${area1Data.lifestyle.atmosphere}\n• ${area2Data.name}: ${area2Data.lifestyle.atmosphere}\n\n💰 **Price Range:**\n• ${area1Data.name}: ${area1Data.realEstate.priceRange}\n• ${area2Data.name}: ${area2Data.realEstate.priceRange}\n\n👥 **Community:**\n• ${area1Data.name}: ${area1Data.community.expatPopulation} expat population\n• ${area2Data.name}: ${area2Data.community.expatPopulation} expat population\n\n📚 **Education:**\n• ${area1Data.name}: ${area1Data.schools.length} excellent schools\n• ${area2Data.name}: ${area2Data.schools.length} excellent schools\n\nWhich area aligns better with your priorities?`,
            `**Comparando ${area1Data.name} vs ${area2Data.name}:**\n\n🏖️ **Estilo de Vida:**\n• ${area1Data.name}: ${area1Data.lifestyle.atmosphere}\n• ${area2Data.name}: ${area2Data.lifestyle.atmosphere}\n\n💰 **Rango de Precios:**\n• ${area1Data.name}: ${area1Data.realEstate.priceRange}\n• ${area2Data.name}: ${area2Data.realEstate.priceRange}\n\n👥 **Comunidad:**\n• ${area1Data.name}: Población expatriada ${area1Data.community.expatPopulation}\n• ${area2Data.name}: Población expatriada ${area2Data.community.expatPopulation}\n\n📚 **Educación:**\n• ${area1Data.name}: ${area1Data.schools.length} excelentes escuelas\n• ${area2Data.name}: ${area2Data.schools.length} excelentes escuelas\n\n¿Cuál zona se alinea mejor con tus prioridades?`
          ),
          timestamp: new Date(),
          metadata: {
            type: 'comparison',
            actions: [
              { label: t('View properties', 'Ver propiedades'), action: 'view_properties' },
              { label: t('Area details', 'Detalles zona'), action: 'area_details' }
            ]
          }
        };
      }
    }

    // Generic comparison response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `I'd be happy to help you compare different options. What would you like to compare - different areas, property types, or price ranges?`,
        `Me encantaría ayudarte a comparar diferentes opciones. ¿Qué te gustaría comparar - diferentes zonas, tipos de propiedad, o rangos de precios?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'comparison',
        actions: [
          { label: t('Compare areas', 'Comparar zonas'), action: 'compare_areas' },
          { label: t('Compare prices', 'Comparar precios'), action: 'compare_prices' }
        ]
      }
    };
  };

  const getContextualHelp = (message: string, requirements: any, context: ConversationContext): string => {
    const lowerMessage = message.toLowerCase();

    // Provide specific help based on query content
    if (lowerMessage.includes('oceanfront') || lowerMessage.includes('beachfront') || lowerMessage.includes('marítima')) {
      return `🏖️ **Oceanfront Properties:** These require special legal considerations in Costa Rica. The Maritime Zone (ZMT) has strict regulations - the first 50m from high tide is public domain, and 50-200m requires concessions. Always consult a maritime law specialist.`;
    }

    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('comprar')) {
      return `🏠 **Buying Process:** Start with research, then property search, due diligence (30-45 days), and closing. Total timeline: 2-4 months. Key costs: 4.3-5.55% closing costs. Always use a Costa Rican attorney.`;
    }

    if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('title') || lowerMessage.includes('due diligence')) {
      return `⚖️ **Legal Help:** Costa Rica uses civil law. Essential due diligence includes title search, survey verification, environmental permits, and municipal certificates. Foreigners can own property directly or through entities.`;
    }

    if (lowerMessage.includes('school') || lowerMessage.includes('education') || lowerMessage.includes('children') || lowerMessage.includes('family')) {
      return `📚 **Education:** Guanacaste has excellent international schools. Top areas: Nosara (9.5/10), Playa Grande (9.2/10), Playa Flamingo (9.0/10). Bilingual and international curriculums available.`;
    }

    if (requirements.location) {
      const area = guanacasteKnowledge.areas[requirements.location as keyof typeof guanacasteKnowledge.areas];
      if (area) {
        return `📍 **${area.name}:** ${area.realEstate.priceRange}, ${area.schools.length} excellent schools, ${area.community.expatPopulation} expat community. ${area.lifestyle.atmosphere}.`;
      }
    }

    // General helpful responses
    return `I can help you with:
• 🏠 Property search and recommendations
• 💰 Market analysis and pricing
• ⚖️ Legal requirements and due diligence
• 📚 School and community information
• 🏖️ Area comparisons and lifestyle guidance

What specific aspect interests you most?`;
  };

  const getContextualResponse = (message: string, context: ConversationContext): string => {
    const preferences = context.userPreferences;
    const patterns = context.conversationPatterns;
    const memory = context.memory;
    const personalization = context.personalization;

    // Use conversation memory for highly personalized responses
    if (memory?.importantFacts && memory.importantFacts.length > 0) {
      // Find relevant facts for the current query
      const relevantFacts = memory.importantFacts.filter(fact =>
        message.toLowerCase().includes(fact.category) ||
        fact.category === 'personal' // Always include personal facts
      );

      if (relevantFacts.length > 0) {
        const factSummary = relevantFacts.map(f => f.fact).join(', ');
        return t(
          `Based on what you've shared with me (${factSummary}), I can provide more targeted advice. How can I help you with your ${patterns?.frequentlyAskedTopics?.[0] || 'property'} needs?`,
          `Basándome en lo que has compartido conmigo (${factSummary}), puedo darte consejos más específicos. ¿Cómo puedo ayudarte con tus necesidades de ${patterns?.frequentlyAskedTopics?.[0] || 'propiedad'}?`
        );
      }
    }

    // Use conversation patterns for response style
    const responseStyle = personalization?.responseLength || 'detailed';

    // Personalized responses based on user preferences and conversation history
    if (preferences?.userType === 'investor') {
      const investmentFacts = memory?.importantFacts?.filter(f => f.category === 'financial') || [];
      const investmentContext = investmentFacts.length > 0 ?
        ` (considering your ${investmentFacts[0].fact})` : '';

      if (responseStyle === 'brief') {
        return t(
          `As an investor${investmentContext}, I recommend Tamarindo or Flamingo for rental potential. Need market analysis?`,
          `Como inversionista${investmentContext}, recomiendo Tamarindo o Flamingo para potencial de alquiler. ¿Necesitas análisis de mercado?`
        );
      }

      return t(
        `As an investor, I can help you identify properties with strong rental potential and good returns${investmentContext}. Based on your preferences for ${preferences.priorities?.join(', ') || 'quality properties'}, I recommend focusing on tourist areas like Tamarindo or Flamingo. Would you like market analysis or specific investment opportunities?`,
        `Como inversionista, puedo ayudarte a identificar propiedades con fuerte potencial de alquiler y buenos retornos${investmentContext}. Basándome en tus preferencias por ${preferences.priorities?.join(', ') || 'propiedades de calidad'}, recomiendo enfocarte en zonas turísticas como Tamarindo o Flamingo. ¿Te gustaría análisis de mercado u oportunidades específicas de inversión?`
      );
    }

    if (preferences?.familySize && preferences.familySize > 2) {
      const familyFacts = memory?.importantFacts?.filter(f => f.category === 'personal') || [];
      const familyContext = familyFacts.length > 0 ?
        ` (${familyFacts.map(f => f.fact).join(', ')})` : '';

      if (responseStyle === 'brief') {
        return t(
          `For families${familyContext}, Nosara and Playa Grande offer excellent schools. Need details?`,
          `Para familias${familyContext}, Nosara y Playa Grande ofrecen excelentes escuelas. ¿Necesitas detalles?`
        );
      }

      return t(
        `For a family of ${preferences.familySize}${familyContext}, I recommend areas with excellent schools and family-friendly communities. ${preferences.children ? `With ${preferences.children} children, ` : ''}Nosara and Playa Grande offer outstanding international schools and safe environments. Would you like information about schools or family-oriented properties?`,
        `Para una familia de ${preferences.familySize}${familyContext}, recomiendo zonas con excelentes escuelas y comunidades amigables para familias. ${preferences.children ? `Con ${preferences.children} niños, ` : ''}Nosara y Playa Grande ofrecen escuelas internacionales excepcionales y ambientes seguros. ¿Te gustaría información sobre escuelas o propiedades orientadas a familias?`
      );
    }

    // Context-aware responses based on conversation history and patterns
    if (context.lastTopic === 'legal' && patterns?.knowledgeLevel === 'expert') {
      return t(
        `Following up on your legal question: In Costa Rica, the title process typically takes 30-45 days with proper due diligence. Since you've shown interest in legal matters, would you like me to explain the maritime zone regulations or tax implications in more detail?`,
        `Siguiendo con tu pregunta legal: En Costa Rica, el proceso de título toma típicamente 30-45 días con diligencia debida apropiada. Ya que has mostrado interés en asuntos legales, ¿te gustaría que explique las regulaciones de zona marítima o implicaciones fiscales con más detalle?`
      );
    }

    if (context.lastTopic === 'property_search_results') {
      const lastSearch = context.searchHistory?.[context.searchHistory.length - 1];
      if (lastSearch && lastSearch.results.length > 0) {
        const searchContext = patterns?.engagementLevel === 'high' ?
          ` (you've been actively searching with ${context.messageCount} messages in our conversation)` : '';

        return t(
          `Regarding your recent property search, I found ${lastSearch.results.length} options matching your criteria${searchContext}. Would you like me to show similar properties, refine the search, or provide more details about any of these listings?`,
          `Respecto a tu búsqueda reciente de propiedades, encontré ${lastSearch.results.length} opciones que coinciden con tus criterios${searchContext}. ¿Te gustaría que muestre propiedades similares, refine la búsqueda, o dé más detalles sobre cualquiera de estos listados?`
        );
      }
    }

    if (context.lastIntent === 'property_search') {
      const searchContext = preferences?.budget ?
        ` (budget: $${preferences.budget.min?.toLocaleString()}-${preferences.budget.max?.toLocaleString()})` : '';
      const locationContext = preferences?.locations ?
        ` in ${preferences.locations.join(', ')}` : '';

      if (responseStyle === 'brief') {
        return t(
          `I can help you find properties${searchContext}${locationContext}. What specific requirements?`,
          `Puedo ayudarte a encontrar propiedades${searchContext}${locationContext}. ¿Qué requisitos específicos?`
        );
      }

      return t(
        `I can help you find properties in Guanacaste. Based on what you've told me so far${searchContext}${locationContext}, what specific requirements do you have? I can search by price, location, property type, or amenities.`,
        `Puedo ayudarte a encontrar propiedades en Guanacaste. Basándome en lo que me has dicho hasta ahora${searchContext}${locationContext}, ¿qué requisitos específicos tienes? Puedo buscar por precio, ubicación, tipo de propiedad, o amenidades.`
      );
    }

    // Handle frustrated or follow-up messages with memory context
    if (message.includes('just told you') || message.includes('already said') || message.includes('you know') || message.includes('acabo de decir') || message.includes('ya te dije')) {
      const userPrefs = preferences ? Object.entries(preferences).filter(([key, value]) => value && key !== 'priorities').map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}`).join(', ') : 'none specified';
      const memoryContext = memory?.importantFacts?.length ?
        ` From our conversation, I remember: ${memory.importantFacts.slice(0, 2).map(f => f.fact).join(', ')}.` : '';

      return t(
        `I apologize if I didn't address your specific requirements. Based on our conversation, I understand you're looking for: ${userPrefs}.${memoryContext} Let me help you find exactly what you need. Would you like me to search for properties or provide more specific information?`,
        `Disculpa si no abordé tus requisitos específicos. Basándome en nuestra conversación, entiendo que buscas: ${userPrefs}.${memoryContext} Déjame ayudarte a encontrar exactamente lo que necesitas. ¿Te gustaría que busque propiedades o dé información más específica?`
      );
    }

    // Session-aware responses with conversation intelligence
    const messageCount = context.messageCount || 0;
    if (messageCount > 15) {
      const topTopics = patterns?.frequentlyAskedTopics?.slice(0, 2).join(' and ') || 'properties';
      const engagement = patterns?.engagementLevel === 'high' ?
        'actively engaged' : patterns?.engagementLevel === 'low' ? 'focused' : 'engaged';

      return t(
        `We've had a ${engagement} conversation about Guanacaste ${topTopics}! Based on everything you've shared, I have a good understanding of your preferences. Is there anything specific you'd like to revisit or explore further?`,
        `¡Hemos tenido una conversación ${engagement === 'actively engaged' ? 'muy activa' : engagement === 'focused' ? 'enfocada' : 'comprometida'} sobre ${topTopics} en Guanacaste! Basándome en todo lo que has compartido, tengo una buena comprensión de tus preferencias. ¿Hay algo específico que te gustaría revisar o explorar más?`
      );
    }

    // Intelligent general responses based on conversation patterns
    const responses = language === 'en' ? [
      `I understand your question${preferences?.locations ? ` about ${preferences.locations[0]}` : ''}. ${patterns?.knowledgeLevel === 'expert' ? 'Since you seem knowledgeable about Costa Rican real estate, ' : ''}Could you give me more details about what you're looking for? I can help you better with specific information about properties, prices, or legal processes.`,
      `Great question! In Guanacaste we have many options${preferences?.priorities ? ` that match your interest in ${preferences.priorities[0]}` : ''}. ${patterns?.frequentlyAskedTopics?.includes('education') ? 'I notice you\'re interested in schools, so ' : ''}Are you more interested in the beach, tranquility, or activities? I can recommend the best areas based on your preferences.`,
      `I'm here to help you with any aspect of buying or selling properties in Costa Rica${preferences?.userType ? ` as a ${preferences.userType}` : ''}. ${memory?.userGoals?.length ? `I remember you're looking for ${memory.userGoals[0].toLowerCase()}. ` : ''}Would you like me to analyze a specific property, give you market information, or explain a legal process?`,
      `Costa Rica has a unique real estate market with excellent opportunities${preferences?.budget ? ` in your price range` : ''}. ${patterns?.engagementLevel === 'high' ? 'You seem very engaged with the process! ' : ''}Are you looking to buy, sell, or just explore options? I can guide you through the entire process.`
    ] : [
      `Entiendo tu pregunta${preferences?.locations ? ` sobre ${preferences.locations[0]}` : ''}. ${patterns?.knowledgeLevel === 'expert' ? 'Ya que pareces conocedor sobre bienes raíces costarricenses, ' : ''}¿Podrías darme más detalles sobre lo que buscas? Puedo ayudarte mejor con información específica sobre propiedades, precios, o procesos legales.`,
      `¡Buena pregunta! En Guanacaste tenemos muchas opciones${preferences?.priorities ? ` que coinciden con tu interés en ${preferences.priorities[0]}` : ''}. ${patterns?.frequentlyAskedTopics?.includes('education') ? 'Noto que estás interesado en escuelas, así que ' : ''}¿Te interesa más la playa, la tranquilidad, o las actividades? Puedo recomendarte las mejores zonas según tus preferencias.`,
      `Estoy aquí para ayudarte con cualquier aspecto de comprar o vender propiedades en Costa Rica${preferences?.userType ? ` como ${preferences.userType}` : ''}. ${memory?.userGoals?.length ? `Recuerdo que buscas ${memory.userGoals[0].toLowerCase()}. ` : ''}¿Quieres que analice una propiedad específica, te dé información del mercado, o te explique algún proceso legal?`,
      `Costa Rica tiene un mercado inmobiliario único con oportunidades excelentes${preferences?.budget ? ` en tu rango de precios` : ''}. ${patterns?.engagementLevel === 'high' ? '¡Pareces muy comprometido con el proceso! ' : ''}¿Estás buscando comprar, vender, o simplemente explorar opciones? Puedo guiarte a través de todo el proceso.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const startTime = Date.now();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Parse user requirements for context building
    const requirements = parseUserQuery(inputMessage);

    try {
      // Generate AI response
      const aiResponse = await generateResponse(inputMessage);
      const responseTime = Date.now() - startTime;

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Track performance metrics
      trackAIResponse(
        inputMessage,
        requirements.intent || 'unknown',
        responseTime,
        false, // cache hit - would be determined by actual caching logic
        undefined, // error
        Math.floor(aiResponse.content.length / 4) // rough token estimate
      );

      // Update context with enhanced information
      setContext(prev => {
        const updatedContext: ConversationContext = {
          ...prev,
          lastTopic: aiResponse.metadata?.type || prev.lastTopic,
          lastIntent: requirements.intent,
          messageCount: (prev.messageCount || 0) + 2,
          conversationHistory: [...(prev.conversationHistory || []), userMessage, aiResponse]
        };

        // Update user preferences based on requirements
        if (!updatedContext.userPreferences) {
          updatedContext.userPreferences = {};
        }

        if (requirements.budget && !updatedContext.userPreferences.budget) {
          updatedContext.userPreferences.budget = requirements.budget;
        }

        if (requirements.location && !updatedContext.userPreferences.locations) {
          updatedContext.userPreferences.locations = [requirements.location];
        }

        if (requirements.propertyType && !updatedContext.userPreferences.propertyTypes) {
          updatedContext.userPreferences.propertyTypes = [requirements.propertyType];
        }

        if (requirements.familySize && !updatedContext.userPreferences.familySize) {
          updatedContext.userPreferences.familySize = requirements.familySize;
        }

        if (requirements.children && !updatedContext.userPreferences.children) {
          updatedContext.userPreferences.children = requirements.children;
        }

        if (requirements.userType && !updatedContext.userPreferences.userType) {
          updatedContext.userPreferences.userType = requirements.userType;
        }

        if (requirements.priorities && requirements.priorities.length > 0) {
          updatedContext.userPreferences.priorities = [
            ...(updatedContext.userPreferences.priorities || []),
            ...requirements.priorities
          ];
        }

        // Track search history
        if (requirements.intent === 'property_search' && aiResponse.metadata?.data?.properties) {
          if (!updatedContext.searchHistory) {
            updatedContext.searchHistory = [];
          }
          updatedContext.searchHistory.push({
            query: inputMessage,
            results: aiResponse.metadata.data.properties,
            timestamp: new Date()
          });
        }

        return updatedContext;
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('Error generating response:', error);

      // Track error in performance monitor
      trackAIResponse(
        inputMessage,
        requirements.intent || 'unknown',
        responseTime,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Show error message to user
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: t(
          'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.',
          'Disculpa, pero encontré un error al procesar tu solicitud. Por favor intenta de nuevo o reformula tu pregunta.'
        ),
        timestamp: new Date(),
        metadata: { type: 'error' }
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleFeedback = (messageId: string, helpful: boolean, message: Message, userQuery?: string) => {
    if (feedbackGiven.has(messageId)) return; // Prevent duplicate feedback

    feedbackService.submitQuickFeedback(
      messageId,
      helpful,
      userQuery,
      message.content
    );

    setFeedbackGiven(prev => new Set(prev).add(messageId));

    // Show thank you message briefly
    const thankYouMessage: Message = {
      id: `feedback-${Date.now()}`,
      type: 'assistant',
      content: t(
        `Thank you for your feedback! ${helpful ? 'Glad I could help!' : 'I\'ll work on improving my responses.'}`,
        `¡Gracias por tu retroalimentación! ${helpful ? '¡Me alegra haber podido ayudar!' : 'Trabajaré en mejorar mis respuestas.'}`
      ),
      timestamp: new Date(),
      metadata: { type: 'feedback_acknowledgment' }
    };

    setMessages(prev => [...prev, thankYouMessage]);

    // Remove thank you message after 3 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== thankYouMessage.id));
    }, 3000);
  };

  const handleAction = (action: string, data?: any) => {
    let responseMessage = '';

    switch (action) {
      case 'analyze_property':
        responseMessage = t(
          'Perfect, I can analyze any property in Guanacaste. Can you give me the address or property ID? I can also compare similar properties in the market.',
          'Perfecto, puedo analizar cualquier propiedad en Guanacaste. ¿Me das la dirección o el ID de la propiedad? También puedo comparar propiedades similares en el mercado.'
        );
        break;
      case 'market_info':
        responseMessage = t(
          'The Guanacaste market is strong right now. Are you interested in information about prices, trends, or analysis of a specific area?',
          'El mercado guanacasteco está fuerte actualmente. ¿Te interesa información sobre precios, tendencias, o análisis de alguna zona específica?'
        );
        break;
      case 'legal_help':
        responseMessage = t(
          'About legal matters: Costa Rica has specific laws for properties. Do you need information about titles, maritime concessions, or the purchase process?',
          'Sobre asuntos legales: Costa Rica tiene leyes específicas para propiedades. ¿Necesitas información sobre títulos, concesiones marítimas, o el proceso de compra?'
        );
        break;
      case 'negotiation_help':
        responseMessage = t(
          'Negotiations in Costa Rica are respectful but firm. Do you have a specific offer you want me to analyze, or do you need general strategy advice?',
          'Las negociaciones en Costa Rica son respetuosas pero firmes. ¿Tienes una oferta específica que quieres que analice, o necesitas consejos generales sobre estrategia?'
        );
        break;
      case 'find_properties':
        responseMessage = t(
          'I\'d be happy to help you find properties. What are your preferences - location, budget, property type, or number of bedrooms?',
          'Me encantaría ayudarte a encontrar propiedades. ¿Cuáles son tus preferencias - ubicación, presupuesto, tipo de propiedad, o número de habitaciones?'
        );
        break;
      case 'market_update':
        responseMessage = t(
          'Let me give you the latest market insights for your preferred areas. The Guanacaste market continues to show strong growth, especially in tourist destinations.',
          'Déjame darte las últimas perspectivas del mercado para tus zonas preferidas. El mercado de Guanacaste continúa mostrando fuerte crecimiento, especialmente en destinos turísticos.'
        );
        break;
      case 'reset_preferences':
        // Clear saved context and reset
        localStorage.removeItem('guanacaste-ai-context');
        localStorage.removeItem('guanacaste-ai-messages');
        setContext({});
        setMessages([getWelcomeMessage()]);
        return; // Don't add a response message, just reset
      case 'show_similar':
        responseMessage = t(
          'I\'ll show you similar properties in price, location and features. What aspects are most important to you: price, size, or location?',
          'Te mostraré propiedades similares en precio, ubicación y características. ¿Qué aspectos son más importantes para ti: precio, tamaño, o ubicación?'
        );
        break;
      case 'investment_analysis':
        responseMessage = t(
          'For investment analysis, I need to know your budget, time horizon, and whether you\'re looking for maximum return or stability. Can you give me these details?',
          'Para análisis de inversión, necesito saber tu presupuesto, horizonte temporal, y si buscas retorno máximo o estabilidad. ¿Me das estos detalles?'
        );
        break;
      default:
        responseMessage = t(
          'How else can I help you? I have experience in property analysis, legal information, market advice, and negotiation strategies.',
          '¿En qué más puedo ayudarte? Tengo experiencia en análisis de propiedades, información legal, consejos de mercado, y estrategias de negociación.'
        );
    }

    const actionMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: responseMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, actionMessage]);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      // Fallback for browsers that don't support speech recognition
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          'Sorry, your browser doesn\'t support voice input. You can type your question or update to a modern browser like Chrome or Edge.',
          'Lo siento, tu navegador no soporta entrada de voz. Puedes escribir tu pregunta o actualizar a un navegador moderno como Chrome o Edge.'
        ),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleFileUpload = (type: 'image' | 'document') => {
    const inputRef = type === 'image' ? imageInputRef : fileInputRef;
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const processFile = async (file: File, type: 'image' | 'document') => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          'Sorry, the file is too large. The limit is 10MB. Could you upload a smaller file?',
          'Lo siento, el archivo es demasiado grande. El límite es 10MB. ¿Podrías subir un archivo más pequeño?'
        ),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validDocumentTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const validTypes = type === 'image' ? validImageTypes : validDocumentTypes;
    if (!validTypes.includes(file.type)) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `Invalid file type. For ${type === 'image' ? 'images' : 'documents'}, we accept: ${validTypes.join(', ')}.`,
          `Tipo de archivo no válido. Para ${type === 'image' ? 'imágenes' : 'documentos'}, aceptamos: ${validTypes.join(', ')}.`
        ),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Show processing message
    const processingMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: type === 'image'
        ? t(
            `📸 Processing image "${file.name}"... I'll analyze the property features, condition, and estimate its value in the Guanacaste market.`,
            `📸 Procesando imagen "${file.name}"... Analizaré las características de la propiedad, condición del inmueble, y estimaré su valor en el mercado guanacasteco.`
          )
        : t(
            `📄 Processing document "${file.name}"... I'll review the legal content, identify important clauses, and provide specific recommendations for Costa Rica.`,
            `📄 Procesando documento "${file.name}"... Revisaré el contenido legal, identificaré cláusulas importantes, y te daré recomendaciones específicas para Costa Rica.`
          ),
      timestamp: new Date(),
      metadata: {
        type: type === 'image' ? 'image_analysis' : 'document_analysis'
      }
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      const fileContent = await readFileContent(file, type);

      // Simulate AI processing delay
      setTimeout(async () => {
        const analysisResult = await analyzeFile(fileContent, type, file.name);

        const resultMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: analysisResult.content,
          timestamp: new Date(),
          metadata: {
            type: type === 'image' ? 'image_analysis' : 'document_analysis',
            data: analysisResult.data,
            actions: analysisResult.actions
          }
        };

        setMessages(prev => [...prev, resultMessage]);
      }, 2000 + Math.random() * 3000);

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: t(
          `Sorry, there was an error processing the file "${file.name}". Could you try again or upload a different file?`,
          `Lo siento, hubo un error procesando el archivo "${file.name}". ¿Podrías intentarlo de nuevo o subir un archivo diferente?`
        ),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const readFileContent = (file: File, type: 'image' | 'document'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (type === 'image') {
        // For images, we'll just return the filename and basic info
        // In a real implementation, this would upload to a server for AI analysis
        resolve(`Image: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
      } else {
        // For documents, read as text
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content || '');
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      }
    });
  };

  const analyzeFile = async (content: string, type: 'image' | 'document', filename: string) => {
    try {
      if (type === 'image') {
        // Use enhanced AI image analysis
        const imageAnalysis = await aiAPI.analyzeImage({
          image_url: `data:image/jpeg;base64,${btoa(content)}`, // Convert to data URL
          analysis_type: 'property_exterior', // Default analysis type
          property_id: propertyId
        });

        return {
          content: t(
            `✅ AI Image Analysis completed for "${filename}"\n\n📸 **Description:** ${imageAnalysis.analysis.description}\n\n🏠 **Identified Features:**\n${imageAnalysis.analysis.features.map(f => `• ${f}`).join('\n')}\n\n📊 **Condition Assessment:** ${imageAnalysis.analysis.condition.toUpperCase()}\n\n💡 **Recommendations:**\n${imageAnalysis.analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n${imageAnalysis.analysis.concerns.length > 0 ? `⚠️ **Concerns:**\n${imageAnalysis.analysis.concerns.map(c => `• ${c}`).join('\n')}\n\n` : ''}Would you like me to analyze this differently or help with property valuation?`,
            `✅ Análisis de imagen IA completado para "${filename}"\n\n📸 **Descripción:** ${imageAnalysis.analysis.description}\n\n🏠 **Características identificadas:**\n${imageAnalysis.analysis.features.map(f => `• ${f}`).join('\n')}\n\n📊 **Evaluación de condición:** ${imageAnalysis.analysis.condition.toUpperCase()}\n\n💡 **Recomendaciones:**\n${imageAnalysis.analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n${imageAnalysis.analysis.concerns.length > 0 ? `⚠️ **Preocupaciones:**\n${imageAnalysis.analysis.concerns.map(c => `• ${c}`).join('\n')}\n\n` : ''}¿Te gustaría que analice esto de manera diferente o te ayude con valoración de propiedad?`
          ),
          data: imageAnalysis.analysis,
          actions: [
            { label: t('Re-analyze', 'Re-analizar'), action: 'reanalyze_image' },
            { label: t('Property valuation', 'Valoración propiedad'), action: 'property_valuation' },
            { label: t('Similar properties', 'Propiedades similares'), action: 'find_similar' }
          ]
        };
      } else {
        // Enhanced document analysis with AI
        const isLegalDocument = content.toLowerCase().includes('contrato') ||
                              content.toLowerCase().includes('titulo') ||
                              content.toLowerCase().includes('promesa') ||
                              content.toLowerCase().includes('compra') ||
                              content.toLowerCase().includes('legal') ||
                              content.toLowerCase().includes('notario');

        const documentType = isLegalDocument ? 'legal_contract' :
                           content.toLowerCase().includes('impuesto') || content.toLowerCase().includes('tax') ? 'tax_document' :
                           content.toLowerCase().includes('ambiental') || content.toLowerCase().includes('setena') ? 'environmental_report' :
                           content.toLowerCase().includes('construccion') || content.toLowerCase().includes('permiso') ? 'construction_permit' :
                           content.toLowerCase().includes('financiero') || content.toLowerCase().includes('financial') ? 'financial_statement' :
                           'general';

        const documentAnalysis = await aiAPI.analyzeDocument({
          document_type: documentType as any,
          content,
          filename,
          property_id: propertyId
        });

        const analysis = documentAnalysis.analysis;

        return {
          content: t(
            `✅ AI Document Analysis completed for "${filename}"\n\n📄 **Document Type:** ${documentType.replace('_', ' ').toUpperCase()}\n\n📋 **Summary:** ${analysis.summary}\n\n🔑 **Key Points:**\n${analysis.keyPoints.map(p => `• ${p}`).join('\n')}\n\n⚖️ **Compliance Status:** ${analysis.compliance.status.toUpperCase().replace('_', ' ')}\n\n${analysis.recommendations.length > 0 ? `💡 **Recommendations:**\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n` : ''}${analysis.risks.length > 0 ? `⚠️ **Risks/Concerns:**\n${analysis.risks.map(r => `• ${r}`).join('\n')}\n\n` : ''}Would you like me to explain any aspect in more detail or help with next steps?`,
            `✅ Análisis de documento IA completado para "${filename}"\n\n📄 **Tipo de documento:** ${documentType.replace('_', ' ').toUpperCase()}\n\n📋 **Resumen:** ${analysis.summary}\n\n🔑 **Puntos clave:**\n${analysis.keyPoints.map(p => `• ${p}`).join('\n')}\n\n⚖️ **Estado de cumplimiento:** ${analysis.compliance.status.toUpperCase().replace('_', ' ')}\n\n${analysis.recommendations.length > 0 ? `💡 **Recomendaciones:**\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n` : ''}${analysis.risks.length > 0 ? `⚠️ **Riesgos/Preocupaciones:**\n${analysis.risks.map(r => `• ${r}`).join('\n')}\n\n` : ''}¿Te gustaría que explique algún aspecto con más detalle o te ayude con los siguientes pasos?`
          ),
          data: analysis,
          actions: [
            { label: t('Explain details', 'Explicar detalles'), action: 'explain_details' },
            { label: t('Next steps', 'Siguientes pasos'), action: 'next_steps' },
            { label: t('Legal consultation', 'Consulta legal'), action: 'legal_consultation' }
          ]
        };
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to basic analysis
      return {
        content: t(
          `✅ Basic analysis completed for "${filename}"\n\n📄 **File processed successfully**\n\n⚠️ Advanced AI analysis temporarily unavailable. Basic document processing completed.\n\nWould you like me to help you understand this document or provide general guidance?`,
          `✅ Análisis básico completado para "${filename}"\n\n📄 **Archivo procesado exitosamente**\n\n⚠️ Análisis avanzado de IA temporalmente no disponible. Procesamiento básico de documento completado.\n\n¿Te gustaría que te ayude a entender este documento o proporcionar orientación general?`
        ),
        data: {
          basicAnalysis: true,
          filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        actions: [
          { label: t('General guidance', 'Orientación general'), action: 'general_guidance' },
          { label: t('Try again later', 'Intentar más tarde'), action: 'try_again' }
        ]
      };
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file, type);
    }
    // Reset input
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">{t('AI Property Assistant', 'Asistente de Propiedades IA')}</h3>
              <p className="text-sm text-cyan-100">{t('Costa Rican Real Estate Expert', 'Experto en Bienes Raíces de Costa Rica')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {message.type === 'assistant' ? (
                    <Bot className="w-4 h-4 text-cyan-600" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm leading-relaxed">{message.content}</p>

                {/* Metadata Display */}
                {message.metadata?.data && (
                  <div className="mt-3 p-3 bg-white/10 rounded-lg">
                    {message.metadata.type === 'property_analysis' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Market Average:</span>
                          <span className="font-semibold">{message.metadata.data.marketAvg}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Price Range:</span>
                          <span className="font-semibold">{message.metadata.data.priceRange}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Confidence:</span>
                          <span className="font-semibold">{message.metadata.data.confidence}%</span>
                        </div>
                      </div>
                    )}

                    {message.metadata.type === 'market_data' && (
                      <div className="space-y-2">
                        {message.metadata.data.locations?.map((loc: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span>{loc.name}:</span>
                            <span className="font-semibold">{loc.avgPrice} ({loc.growth})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {message.metadata?.actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.metadata.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(action.action, action.data)}
                        className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Feedback Buttons (only for assistant messages, not welcome messages or feedback acknowledgments) */}
                {message.type === 'assistant' && message.metadata?.type !== 'feedback_acknowledgment' && message.metadata?.type !== 'welcome' && message.metadata?.type !== 'welcome_back' && !feedbackGiven.has(message.id) && (
                  <div className="mt-3 flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
                    <span className="text-xs text-slate-600">
                      {t('Was this helpful?', '¿Fue útil esta respuesta?')}
                    </span>
                    <button
                      onClick={() => handleFeedback(message.id, true, message)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {t('Yes', 'Sí')}
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false, message)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-full transition-colors"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      {t('No', 'No')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-4 py-3 max-w-xs">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-600" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-4">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            <button
              onClick={() => handleFileUpload('image')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              {t('Analyze Photo', 'Analizar Foto')}
            </button>
            <button
              onClick={() => handleFileUpload('document')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              {t('Review Document', 'Revisar Documento')}
            </button>
            <button
              onClick={handleVoiceInput}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                isListening ? 'bg-red-100 text-red-700' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? t('Listening...', 'Escuchando...') : t('Voice Input', 'Entrada de Voz')}
            </button>
          </div>

          {/* Message Input */}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('Ask about properties, legal questions, market data...', 'Pregunta sobre propiedades, preguntas legales, datos del mercado...')}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Capabilities Hint */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3 h-3" />
            <span>{t('AI can analyze properties, provide legal advice, market data, and negotiation help', 'La IA puede analizar propiedades, dar consejos legales, datos del mercado y ayuda con negociaciones')}</span>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileChange(e, 'document')}
        className="hidden"
      />
    </div>
  );
};

export default AIPropertyAssistant;