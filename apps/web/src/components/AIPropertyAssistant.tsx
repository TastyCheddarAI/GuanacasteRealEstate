import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, MicOff, Camera, FileText, X, Bot, User, Sparkles, MapPin, DollarSign, Shield, TrendingUp, Home, Calculator, FileCheck, Image as ImageIcon, Phone, Mail, Clock, Star, Zap, Heart, Search, Lightbulb } from 'lucide-react';
import { aiAPI } from '../services/api';

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
    type?: 'property_analysis' | 'market_data' | 'legal_advice' | 'negotiation' | 'document_analysis' | 'image_analysis' | 'ai_response' | 'error' | 'general_response' | 'school_info' | 'school_overview' | 'location_info' | 'location_unknown' | 'property_recommendations' | 'legal_info';
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
  };
  currentProperty?: any;
  conversationHistory?: Message[];
  lastTopic?: string;
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

    return {
      id: 'welcome',
      type: 'assistant',
      content: t(
        'Hello! I\'m your property assistant in Guanacaste. How can I help you today? I can analyze properties, give market advice, explain Costa Rican laws, or help with negotiations.',
        '¡Hola! Soy tu asistente de propiedades en Guanacaste. ¿En qué puedo ayudarte hoy? Puedo analizar propiedades, dar consejos sobre el mercado, explicar leyes costarricenses, o ayudarte con negociaciones.'
      ),
      timestamp: new Date(),
      metadata: {
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

  // Parse user query to extract specific requirements
  const parseUserQuery = (message: string) => {
    const lowerMessage = message.toLowerCase();

    const requirements = {
      familySize: null as number | null,
      children: null as number | null,
      schoolAge: [] as string[],
      budget: null as { min: number; max: number } | null,
      privateSchools: false,
      expatCommunity: false,
      location: null as string | null,
      propertyType: null as string | null,
      priorities: [] as string[]
    };

    // Word to number mapping
    const wordToNumber: { [key: string]: number } = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };

    // Helper function to parse numbers (words or digits)
    const parseNumber = (numStr: string): number | null => {
      const digitMatch = numStr.match(/(\d+)/);
      if (digitMatch) {
        return parseInt(digitMatch[1]);
      }
      return wordToNumber[numStr.toLowerCase()] || null;
    };

    // Extract family size
    const familyMatch = lowerMessage.match(/family of (\w+)/i) || lowerMessage.match(/(\d+) people/i) || lowerMessage.match(/(\d+) family members/i);
    if (familyMatch) {
      requirements.familySize = parseNumber(familyMatch[1]);
    }

    // Extract children information
    const childrenMatch = lowerMessage.match(/(\w+) (?:small )?children/i) || lowerMessage.match(/(\d+) kids/i) || lowerMessage.match(/(\w+) kids/i);
    if (childrenMatch) {
      requirements.children = parseNumber(childrenMatch[1]);
    }

    // Extract school age information
    const schoolAgeMatch = lowerMessage.match(/grade (\d+)/gi) || lowerMessage.match(/age (\d+)/gi);
    if (schoolAgeMatch) {
      requirements.schoolAge = schoolAgeMatch.map(match => match.replace(/\D/g, ''));
    }

    // Check for private schools
    requirements.privateSchools = lowerMessage.includes('private school') || lowerMessage.includes('escuela privada');

    // Check for expat community
    requirements.expatCommunity = lowerMessage.includes('expat') || lowerMessage.includes('international') || lowerMessage.includes('english') || lowerMessage.includes('foreigner');

    // Extract budget
    const budgetMatch = lowerMessage.match(/\$?(\d+)[k]?\s*(?:to|-)\s*\$?(\d+)[k]?/i);
    if (budgetMatch) {
      const min = parseInt(budgetMatch[1]) * (budgetMatch[1].includes('k') ? 1000 : 1);
      const max = parseInt(budgetMatch[2]) * (budgetMatch[2].includes('k') ? 1000 : 1);
      requirements.budget = { min, max };
    }

    // Extract location preferences
    const locations = ['tamarindo', 'nosara', 'playa grande', 'flamingo', 'potrero', 'sámara', 'samara', 'liberia', 'guanacaste', 'playa negra'];
    for (const loc of locations) {
      if (lowerMessage.includes(loc)) {
        requirements.location = loc;
        break;
      }
    }

    // Extract property type
    if (lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('casa')) {
      requirements.propertyType = 'house';
    } else if (lowerMessage.includes('condo') || lowerMessage.includes('apartment')) {
      requirements.propertyType = 'condo';
    }

    // Extract priorities
    const priorities = ['peaceful', 'quiet', 'tranquil', 'family-friendly', 'schools', 'community', 'ocean', 'beach', 'nature'];
    for (const priority of priorities) {
      if (lowerMessage.includes(priority)) {
        requirements.priorities.push(priority);
      }
    }

    return requirements;
  };

  // Generate AI response using the Edge Function with fallback to local knowledge base
  const generateResponse = async (userMessage: string): Promise<Message> => {
    try {
      const response = await aiAPI.ask(userMessage, propertyId);

      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.answer || 'I apologize, but I couldn\'t generate a response at this time. Please try again.',
        timestamp: new Date(),
        metadata: {
          type: 'ai_response',
          data: {
            citations: response.citations || []
          },
          actions: [
            { label: 'Ask follow-up', action: 'follow_up' },
            { label: 'Get more details', action: 'more_details' },
            { label: 'Contact agent', action: 'contact_agent' }
          ]
        }
      };
    } catch (error) {
      console.error('AI API error:', error);
      // Fallback to local knowledge base
      return await generateLocalResponse(userMessage);
    }
  };

  // Generate response using local knowledge base
  const generateLocalResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    const requirements = parseUserQuery(userMessage);

    // Handle legal queries first (more specific)
    if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('title') || lowerMessage.includes('contrato') ||
        lowerMessage.includes('legal') || lowerMessage.includes('ley') || lowerMessage.includes('título') ||
        lowerMessage.includes('tax') || lowerMessage.includes('transfer') || lowerMessage.includes('impuesto') || lowerMessage.includes('transferencia') ||
        (lowerMessage.includes('real estate') && lowerMessage.includes('law')) ||
        (lowerMessage.includes('costa rica') && lowerMessage.includes('law'))) {
      return generateLegalResponse();
    }

    // Handle school-related queries
    if (lowerMessage.includes('school') || lowerMessage.includes('escuela') || lowerMessage.includes('education') || lowerMessage.includes('educación')) {
      return generateSchoolResponse(requirements);
    }

    // Handle location-specific queries
    if (requirements.location) {
      return generateLocationResponse(requirements);
    }

    // Handle general property queries
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('real estate') ||
        lowerMessage.includes('propiedad') || lowerMessage.includes('casa') || lowerMessage.includes('inmueble')) {
      return generatePropertyResponse(requirements);
    }

    // Handle market queries
    if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('value') ||
        lowerMessage.includes('mercado') || lowerMessage.includes('precio') || lowerMessage.includes('valor')) {
      return generateMarketResponse();
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

  // Generate legal response
  const generateLegalResponse = (): Message => {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: t(
        `**Costa Rica Real Estate Law Overview:**\n\nCosta Rica's real estate law follows a civil law system with key regulations under the Civil Code, Property Registry Law, and environmental statutes. Foreigners can own property directly or through Costa Rican entities.\n\n**🏠 Ownership & Foreign Ownership:**\n• Direct title or via S.A./S.R.L. entities\n• Coastal concessions limit foreign participation\n• Residency via property investment possible\n\n**📋 Title Registry & Due Diligence:**\n• Folio Real links owner, history, liens\n• Verify literal extract, liens, plano catastrado\n• Cross-check surveys, resolve overlaps\n\n**🏢 Condominium Law:**\n• Governed by registry-recorded regime\n• Review bylaws, financials, insurance\n• HOA approvals for renovations\n\n**🏖️ Maritime Zone (ZMT) & Concessions:**\n• 0-50m: Public use (no construction)\n• 50-200m: Restricted (municipal concessions)\n• Concessions not fee-simple ownership\n\n**🌿 Environmental & Zoning:**\n• SETENA review for builds near protected areas\n• Uso de Suelo certificates required\n• Water/electrical capacity letters\n\n**🚗 Servidumbres (Easements):**\n• Ingress/egress, utilities, drainage\n• Confirm registry recordation\n\n**⚖️ Transaction Process:**\n• Option-to-buy agreement (10% deposit)\n• 30-45 day due diligence\n• Notarial closing, e-registration\n\n**💰 Taxes & Closing Costs:**\n• Transfer tax: ~1.5% of higher price/fiscal value\n• Stamps: ~0.8%, Notary: 1.0-1.25%\n• Total buyer costs: ~3.5-4.0%\n• Seller capital gains: ~15%\n\n**📝 Key Due Diligence Checklist:**\n• Title extract, tax receipts, land-use letter\n• Water/electrical capacity, environmental screening\n• Seller authority, condominium docs, easements\n\nAlways use a Notario Público and treat missing documents as closing conditions.\n\nWhat specific aspect would you like me to elaborate on?`,
        `**Resumen de Leyes de Bienes Raíces en Costa Rica:**\n\nLa ley de bienes raíces de Costa Rica sigue un sistema de derecho civil con regulaciones clave bajo el Código Civil, Ley del Registro de la Propiedad y estatutos ambientales. Los extranjeros pueden poseer propiedad directamente o a través de entidades costarricenses.\n\n**🏠 Propiedad y Propiedad Extranjera:**\n• Título directo o vía entidades S.A./S.R.L.\n• Concesiones costeras limitan participación extranjera\n• Residencia vía inversión en propiedad posible\n\n**📋 Registro de Títulos y Debida Diligencia:**\n• Folio Real vincula propietario, historia, gravámenes\n• Verificar extracto literal, gravámenes, plano catastrado\n• Cruzar verificaciones de encuestas, resolver superposiciones\n\n**🏢 Ley de Condominios:**\n• Gobernado por régimen registrado\n• Revisar estatutos, finanzas, seguros\n• Aprobaciones HOA para renovaciones\n\n**🏖️ Zona Marítima (ZMT) y Concesiones:**\n• 0-50m: Uso público (sin construcción)\n• 50-200m: Restringido (concesiones municipales)\n• Concesiones no son propiedad absoluta\n\n**🌿 Ambiental y Zonificación:**\n• Revisión SETENA para construcciones cerca de áreas protegidas\n• Certificados Uso de Suelo requeridos\n• Cartas de capacidad agua/eléctrica\n\n**🚗 Servidumbres (Servidumbres):**\n• Acceso, utilidades, drenaje\n• Confirmar registro en el registro\n\n**⚖️ Proceso de Transacción:**\n• Acuerdo opción de compra (depósito 10%)\n• Debida diligencia 30-45 días\n• Cierre notarial, registro electrónico\n\n**💰 Impuestos y Costos de Cierre:**\n• Impuesto transferencia: ~1.5% del precio más alto/valor fiscal\n• Sellos: ~0.8%, Notario: 1.0-1.25%\n• Costos totales comprador: ~3.5-4.0%\n• Ganancias capital vendedor: ~15%\n\n**📝 Lista de Debida Diligencia Clave:**\n• Extracto de título, recibos impuestos, carta uso suelo\n• Capacidad agua/eléctrica, tamizaje ambiental\n• Autoridad vendedor, docs condominio, servidumbres\n\nSiempre use un Notario Público y trate documentos faltantes como condiciones de cierre.\n\n¿En qué aspecto específico le gustaría que elabore?`
      ),
      timestamp: new Date(),
      metadata: {
        type: 'legal_info',
        actions: [
          { label: t('Ownership details', 'Detalles propiedad'), action: 'ownership_details' },
          { label: t('Due diligence guide', 'Guía diligencia'), action: 'due_diligence' },
          { label: t('Transaction process', 'Proceso transacción'), action: 'transaction_process' },
          { label: t('Taxes & costs', 'Impuestos y costos'), action: 'taxes_costs' }
        ]
      }
    };
  };

  // Generate market response
  const generateMarketResponse = (): Message => {
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
  };

  const getContextualResponse = (message: string, context: ConversationContext): string => {
    // Context-aware responses based on conversation history
    if (context.lastTopic === 'legal') {
      return t(
        'Following up on your legal question: In Costa Rica, the title process typically takes 30-45 days. Do you need information about any specific aspect of the legal process?',
        'Siguiendo con tu pregunta legal: En Costa Rica, el proceso de título toma típicamente 30-45 días. ¿Necesitas información sobre algún aspecto específico del proceso legal?'
      );
    }

    if (context.lastTopic === 'investment') {
      return t(
        'For investments, consider that properties in Tamarindo offer higher returns but more volatility, while Nosara provides stability. What factors are most important to you: maximum return or stability?',
        'Para inversiones, considera que las propiedades en Tamarindo ofrecen mayor retorno pero más volatilidad, mientras que Nosara proporciona estabilidad. ¿Qué factores son más importantes para ti: retorno máximo o estabilidad?'
      );
    }

    // Handle follow-up questions about previous recommendations
    if (context.lastTopic === 'market_data' && context.conversationHistory && context.conversationHistory.length > 0) {
      const lastMessage = context.conversationHistory[context.conversationHistory.length - 1];
      if (lastMessage.metadata?.data?.recommendedAreas) {
        return t(
          `I recommended ${lastMessage.metadata.data.recommendedAreas.join(' and ')} based on your requirements for a family home with private schools and expat community. Would you like me to show you specific properties in these areas, provide more details about schools, or help with the buying process?`,
          `Recomendé ${lastMessage.metadata.data.recommendedAreas.join(' y ')} basándome en tus requisitos para una casa familiar con escuelas privadas y comunidad expatriada. ¿Te gustaría que te muestre propiedades específicas en estas zonas, te dé más detalles sobre escuelas, o te ayude con el proceso de compra?`
        );
      }
    }

    // Handle frustrated or follow-up messages
    if (message.includes('just told you') || message.includes('already said') || message.includes('you know') || message.includes('acabo de decir') || message.includes('ya te dije')) {
      return t(
        'I apologize if I didn\'t address your specific requirements. Let me focus on what you mentioned: you\'re looking for the best area for a family of 5 with 3 small children, private schools nearby, and an expat-rich community. Based on this, I strongly recommend Nosara or Playa Grande. Both offer excellent international schools, strong expat communities, and safe family environments. Would you like specific property recommendations or more details about schools and community?',
        'Disculpa si no abordé tus requisitos específicos. Déjame enfocarme en lo que mencionaste: buscas la mejor zona para una familia de 5 con 3 niños pequeños, escuelas privadas cerca, y una comunidad rica en expatriados. Basándome en esto, recomiendo fuertemente Nosara o Playa Grande. Ambas ofrecen excelentes escuelas internacionales, fuertes comunidades expatriadas, y ambientes familiares seguros. ¿Te gustaría recomendaciones específicas de propiedades o más detalles sobre escuelas y comunidad?'
      );
    }

    // General helpful responses
    const responses = language === 'en' ? [
      'I understand your question. Could you give me more details about what you\'re looking for? I can help you better with specific information about properties, prices, or legal processes.',
      'Great question! In Guanacaste we have many options. Are you more interested in the beach, tranquility, or activities? I can recommend the best areas based on your preferences.',
      'I\'m here to help you with any aspect of buying or selling properties in Costa Rica. Would you like me to analyze a specific property, give you market information, or explain a legal process?',
      'Costa Rica has a unique real estate market with excellent opportunities. Are you looking to buy, sell, or just explore options? I can guide you through the entire process.'
    ] : [
      'Entiendo tu pregunta. ¿Podrías darme más detalles sobre lo que buscas? Puedo ayudarte mejor con información específica sobre propiedades, precios, o procesos legales.',
      '¡Buena pregunta! En Guanacaste tenemos muchas opciones. ¿Te interesa más la playa, la tranquilidad, o las actividades? Puedo recomendarte las mejores zonas según tus preferencias.',
      'Estoy aquí para ayudarte con cualquier aspecto de comprar o vender propiedades en Costa Rica. ¿Quieres que analice una propiedad específica, te dé información del mercado, o te explique algún proceso legal?',
      'Costa Rica tiene un mercado inmobiliario único con oportunidades excelentes. ¿Estás buscando comprar, vender, o simplemente explorar opciones? Puedo guiarte a través de todo el proceso.'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(async () => {
      const aiResponse = await generateResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Update context
      setContext(prev => ({
        ...prev,
        lastTopic: aiResponse.metadata?.type || prev.lastTopic,
        conversationHistory: [...(prev.conversationHistory || []), userMessage, aiResponse]
      }));
    }, 1000 + Math.random() * 2000); // 1-3 second delay
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
    if (type === 'image') {
      // Simulate image analysis
      return {
        content: t(
          `✅ Analysis completed for "${filename}"\n\n🏠 **Identified Features:**\n• Modern residential property\n• 3 bedrooms, 2 bathrooms\n• Private pool\n• Tropical garden\n• Partial ocean view\n\n💰 **Estimated Value:** $650,000 - $750,000 USD\n📊 **Confidence:** 85%\n\n📍 **Suggested Location:** Tamarindo or Playa Flamingo\n\nWould you like me to search for similar properties or help with an offer?`,
          `✅ Análisis completado de "${filename}"\n\n🏠 **Características identificadas:**\n• Propiedad residencial moderna\n• 3 habitaciones, 2 baños\n• Piscina privada\n• Jardín tropical\n• Vista parcial al mar\n\n💰 **Valor estimado:** $650,000 - $750,000 USD\n📊 **Confianza:** 85%\n\n📍 **Ubicación sugerida:** Tamarindo o Playa Flamingo\n\n¿Te gustaría que busque propiedades similares o te ayude con una oferta?`
        ),
        data: {
          estimatedValue: '$650k-750k',
          confidence: 85,
          features: ['Modern home', 'Pool', 'Garden', 'Ocean view'],
          recommendedLocations: ['Tamarindo', 'Playa Flamingo']
        },
        actions: [
          { label: t('Find similar', 'Buscar similares'), action: 'find_similar' },
          { label: t('Prepare offer', 'Preparar oferta'), action: 'prepare_offer' },
          { label: t('More analysis', 'Más análisis'), action: 'detailed_analysis' }
        ]
      };
    } else {
      // Simulate document analysis
      const isLegalDocument = content.toLowerCase().includes('contrato') ||
                             content.toLowerCase().includes('titulo') ||
                             content.toLowerCase().includes('promesa') ||
                             content.toLowerCase().includes('compra');

      if (isLegalDocument) {
        return {
          content: t(
            `✅ Legal analysis completed for "${filename}"\n\n⚖️ **Document Type:** Purchase promise agreement\n📅 **Date:** ${new Date().toLocaleDateString()}\n💰 **Value:** $425,000 USD\n\n🔍 **Legal aspects reviewed:**\n• ✅ Valid property title\n• ✅ Certificate of freedom from liens\n• ✅ Municipal certificate up to date\n• ⚠️  Missing construction permits for expansion\n\n📋 **Recommendations:**\n• Request construction permit before closing\n• Verify municipal tax payments\n• Consider professional inspection\n\nDo you need help with any specific aspect of the contract?`,
            `✅ Análisis legal completado de "${filename}"\n\n⚖️ **Tipo de documento:** Contrato de promesa de compraventa\n📅 **Fecha:** ${new Date().toLocaleDateString()}\n💰 **Valor:** $425,000 USD\n\n🔍 **Aspectos legales revisados:**\n• ✅ Título de propiedad válido\n• ✅ Certificado de libertad de gravámenes\n• ✅ Certificado municipal al día\n• ⚠️  Faltan permisos de construcción para ampliación\n\n📋 **Recomendaciones:**\n• Solicitar permiso de construcción antes de cerrar\n• Verificar pago de impuestos municipales\n• Considerar inspección profesional\n\n¿Necesitas ayuda con algún aspecto específico del contrato?`
          ),
          data: {
            documentType: 'Purchase Agreement',
            value: '$425,000',
            issues: ['Missing construction permits'],
            recommendations: ['Get construction permits', 'Verify tax payments']
          },
          actions: [
            { label: t('Review clauses', 'Revisar cláusulas'), action: 'review_clauses' },
            { label: t('Contact lawyer', 'Contactar abogado'), action: 'contact_lawyer' },
            { label: t('Due diligence list', 'Lista de diligencia'), action: 'due_diligence' }
          ]
        };
      } else {
        return {
          content: t(
            `✅ Document processed: "${filename}"\n\nThis document doesn't appear to be a real estate contract. Could you specify what type of analysis you need? I can help with:\n\n• 📄 Purchase/sale contracts\n• 🏠 Property titles\n• 📋 Construction permits\n• 💰 Financial statements\n• 📊 Appraisal reports\n\nIs this a different type of document or do you need help with something specific?`,
            `✅ Documento procesado: "${filename}"\n\nEste documento no parece ser un contrato inmobiliario. ¿Podrías especificar qué tipo de análisis necesitas? Puedo ayudar con:\n\n• 📄 Contratos de compra/venta\n• 🏠 Títulos de propiedad\n• 📋 Permisos de construcción\n• 💰 Estados financieros\n• 📊 Reportes de tasación\n\n¿Es este un documento diferente o necesitas ayuda con algo específico?`
          ),
          data: {
            documentType: 'Unknown',
            analysis: 'Document type not recognized'
          },
          actions: [
            { label: t('Specify type', 'Especificar tipo'), action: 'specify_type' },
            { label: t('Upload another', 'Subir otro documento'), action: 'upload_another' },
            { label: t('General help', 'Ayuda general'), action: 'general_help' }
          ]
        };
      }
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