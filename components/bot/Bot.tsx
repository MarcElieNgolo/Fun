import { useState, useRef, useEffect, useCallback } from 'react';
// import Nav from "../components/navbar"; // Retiré car non utilisé dans ce composant
import { respondToQuery, batiProInfo } from './logique'; // Rétabli: Assurez-vous que ce fichier existe
import { useNavigate } from 'react-router-dom'; // Corrected: Import useNavigate from 'react-router-dom'
import { FaMicrophone, FaStopCircle, FaPaperPlane } from 'react-icons/fa'; // Rétabli: Assurez-vous que react-icons est installé

// Déclarations globales pour les APIs SpeechRecognition et SpeechSynthesis
// Ces déclarations sont nécessaires pour que TypeScript reconnaisse correctement
// les constructeurs et les interfaces de ces APIs sur l'objet 'window'.
// Si vous rencontrez toujours des erreurs de type après cette modification, veuillez
// vérifier votre fichier tsconfig.json et assurez-vous que "dom" et "dom.iterable"
// sont inclus dans la section "lib", par exemple:
// {
//   "compilerOptions": {
//     "lib": ["dom", "dom.iterable", "esnext"],
//     "target": "esnext", // Assurez-vous que le target est suffisamment moderne
//     // ... autres options
//   }
// }
declare global {
    interface Window {
        // Déclarez les constructeurs des APIs vocales
        SpeechRecognition: {
            prototype: SpeechRecognition;
            new(): SpeechRecognition;
        };
        webkitSpeechRecognition: {
            prototype: SpeechRecognition; // webkitSpeechRecognition est une implémentation de SpeechRecognition
            new(): SpeechRecognition;
        };
        SpeechGrammarList: {
            prototype: SpeechGrammarList;
            new(): SpeechGrammarList;
        };
        webkitSpeechGrammarList: {
            prototype: SpeechGrammarList; // webkitSpeechGrammarList est une implémentation de SpeechGrammarList
            new(): SpeechGrammarList;
        };
        SpeechRecognitionEvent: {
            prototype: SpeechRecognitionEvent;
            new(type: string, eventInitDict?: SpeechRecognitionEventInit): SpeechRecognitionEvent;
        };
        webkitSpeechRecognitionEvent: {
            prototype: SpeechRecognitionEvent; // webkitSpeechRecognitionEvent est une implémentation de SpeechRecognitionEvent
            new(type: string, eventInitDict?: SpeechRecognitionEventInit): SpeechRecognitionEvent;
        };
        SpeechRecognitionErrorEvent: {
            prototype: SpeechRecognitionErrorEvent;
            new(type: string, eventInitDict?: SpeechRecognitionErrorEventInit): SpeechRecognitionErrorEvent;
        };
        webkitSpeechRecognitionErrorEvent: {
            prototype: SpeechRecognitionErrorEvent; // webkitSpeechRecognitionErrorEvent est une implémentation de SpeechRecognitionErrorEvent
            new(type: string, eventInitDict?: SpeechRecognitionErrorEventInit): SpeechRecognitionErrorEvent;
        };
        // speechSynthesis est géré par la lib 'dom' de TypeScript, pas besoin de le redéclarer ici.
        // speechSynthesis: SpeechSynthesis; // <-- Ligne supprimée
    }

    // Déclarer les interfaces elles-mêmes si elles ne sont pas trouvées par défaut
    // Ces interfaces sont généralement déjà dans 'lib.dom.d.ts' si 'dom' est inclus.
    // Nous les laissons ici comme un filet de sécurité si 'dom' n'est pas configuré.
    interface SpeechRecognition extends EventTarget {
        grammars: SpeechGrammarList;
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        maxAlternatives: number;
        serviceURI: string;

        onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

        abort(): void;
        start(): void;
        stop(): void;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
        readonly emma: Document | null;
        readonly interpretation: any; // Peut être SpeechRecognitionAlternative ou autre
        readonly utterance: SpeechSynthesisUtterance;
    }

    interface SpeechRecognitionEventInit extends EventInit {
        resultIndex?: number;
        results?: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: SpeechRecognitionErrorCode;
        readonly message: string;
    }

    interface SpeechRecognitionErrorEventInit extends EventInit {
        error: SpeechRecognitionErrorCode;
        message?: string;
    }

    type SpeechRecognitionErrorCode =
        | "no-speech"
        | "aborted"
        | "audio-capture"
        | "network"
        | "not-allowed"
        | "service-not-allowed"
        | "bad-grammar"
        | "language-not-supported";

    interface SpeechGrammarList {
        readonly length: number;
        addFromString(string: string, weight?: number): void;
        addFromURI(uri: string, weight?: number): void;
        item(index: number): SpeechGrammar;
        [index: number]: SpeechGrammar;
    }

    interface SpeechGrammar {
        src: string;
        weight: number;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }
}


export default function Bot() {
    const [messages, setMessages] = useState([
        { id: 1, text: batiProInfo.general.greeting, sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    // messagesEndRef doit être de type HTMLDivElement pour scrollIntoView
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false); // State for user's explicit recording intent
    const [isSpeaking, setIsSpeaking] = useState(false); // Nouveau: State for bot speaking

    // Refs to hold mutable state values for stable callbacks in useEffect
    const isRecordingRef = useRef(isRecording);
    const isTypingRef = useRef(isTyping);
    const isSpeakingRef = useRef(isSpeaking); // Nouveau: Ref for bot speaking state
    // recognitionRef doit être de type SpeechRecognition ou null
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    // synthRef doit être de type SpeechSynthesis or null
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const manualStopFlagRef = useRef(false); // Flag to differentiate user stop from auto-stop

    const navigate = useNavigate();

    // Update refs whenever their corresponding state changes
    useEffect(() => {
        // Ces refs sont déjà mises à jour implicitement par React, mais les garder explicites aide à la clarté
        // et assure que les callbacks ont accès à la dernière valeur.
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    useEffect(() => {
        isTypingRef.current = isTyping;
    }, [isTyping]);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Effect for auto-scrolling
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Utility function to remove emojis from text
    const removeEmojis = (text: string): string => { // Ajout du typage 'text: string' et retour 'string'
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        return text.replace(emojiRegex, '');
    };

    // Function for bot to speak
    const speakResponse = useCallback((text: string): Promise<void> => { // Ajout du typage 'text: string' et retour 'Promise<void>'
        console.log('speakResponse: Fonction appelée avec le texte:', text);
        return new Promise((resolve) => {
            if (!synthRef.current || !text) {
                console.log('speakResponse: Synthèse vocale non disponible ou texte vide. Résolution immédiate.');
                resolve(); // Résoudre sans argument pour Promise<void>
                return;
            }

            // Always cancel previous speech if any
            if (synthRef.current.speaking) {
                console.log('speakResponse: Annulation de la parole précédente.');
                synthRef.current.cancel();
            }

            // Remove emojis before speaking
            const cleanText = removeEmojis(text);

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'fr-FR'; // Set language to French
            utterance.pitch = 1;
            utterance.rate = 1;

            // Find a French voice if available
            const voices = synthRef.current.getVoices();
            const frenchVoice = voices.find((voice: SpeechSynthesisVoice) => // Typage de 'voice'
                voice.lang.startsWith('fr') && (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('French'))
            );
            if (frenchVoice) {
                utterance.voice = frenchVoice;
                console.log('speakResponse: Voix française trouvée et utilisée:', frenchVoice.name);
            } else {
                console.warn('speakResponse: Aucune voix française appropriée trouvée, utilisation de la voix par défaut.');
            }

            utterance.onstart = () => {
                console.log('speakResponse: Événement onstart de la synthèse vocale.');
                setIsSpeaking(true);
            };
            utterance.onend = () => {
                console.log('speakResponse: Événement onend de la synthèse vocale. Synthèse terminée.');
                setIsSpeaking(false);
                resolve(); // Résoudre sans argument pour Promise<void>
            };
            utterance.onerror = (event: SpeechSynthesisErrorEvent) => { // Typage de 'event'
                console.error('speakResponse: Erreur de synthèse vocale:', event.error);
                setIsSpeaking(false);
                resolve(); // Résoudre sans argument pour Promise<void>
            };
            synthRef.current.speak(utterance);
            console.log('speakResponse: Commande de synthèse vocale envoyée.');
        });
    }, []); // No dependencies here, relies on refs for state access

    // handleSendMessage (from text input or voice transcription)
    const handleSendMessage = useCallback(async (e: React.FormEvent | null, voiceInput: string | null = null) => { // Typage de 'e' et 'voiceInput'
        if (e) e.preventDefault(); // Prevent default form submission if triggered by button
        const messageToSend = voiceInput || input; // Use voiceInput if provided, otherwise current input state

        console.log('handleSendMessage: Appelée. Input vocal:', voiceInput, 'Input texte:', input);

        if (messageToSend.trim() === '') {
            console.log('handleSendMessage: Message vide, ignoré.');
            return;
        }

        // Stop user's recording if active, as a new message is being processed
        if (recognitionRef.current && isRecordingRef.current) {
            console.log('handleSendMessage: Arrêt de la reconnaissance vocale en cours (message envoyé).');
            manualStopFlagRef.current = true; // Mark as manual stop
            recognitionRef.current.stop(); // This will trigger onend
        }
        // Also stop bot's current speech if any
        if (synthRef.current && synthRef.current.speaking) {
            console.log('handleSendMessage: Annulation de la parole du bot en cours.');
            synthRef.current.cancel();
            setIsSpeaking(false);
        }

        const userMessage = { id: Date.now(), text: messageToSend, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput(''); // Clear input after sending
        console.log('handleSendMessage: Message utilisateur ajouté:', userMessage.text);

        // Determine bot response text
        const botResponseText = respondToQuery(userMessage.text);
        console.log('handleSendMessage: Réponse du bot déterminée:', botResponseText);

        if (!botResponseText || botResponseText.trim() === '') {
            console.warn("handleSendMessage: respondToQuery a renvoyé une réponse vide ou nulle. Le bot ne répondra pas.");
            setIsTyping(false); // Ensure typing state is reset
            setIsSpeaking(false); // Ensure speaking state is reset
            return; // Exit if no response text
        }

        // NOUVEAU: Le bot parle la réponse AVANT d'écrire
        console.log('handleSendMessage: Appel de speakResponse...');
        await speakResponse(botResponseText); // Attendre que la synthèse vocale soit terminée
        console.log('handleSendMessage: speakResponse terminé.');

        setIsTyping(true); // Indiquer que le bot est en train d'écrire (après avoir parlé)
        console.log('handleSendMessage: isTyping mis à true.');

        const botMessageId = Date.now() + 1;
        // Add a placeholder message for the bot to type into
        setMessages((prevMessages) => [...prevMessages, { id: botMessageId, text: '', sender: 'bot' }]);
        console.log('handleSendMessage: Message bot placeholder ajouté.');

        let currentBotResponse = '';
        // Progressive typing for text display
        for (let i = 0; i < botResponseText.length; i++) {
            currentBotResponse += botResponseText[i];
            setMessages((prevMessages) => {
                const lastMessageIndex = prevMessages.findIndex(msg => msg.id === botMessageId);
                if (lastMessageIndex !== -1) {
                    const newMessages = [...prevMessages];
                    newMessages[lastMessageIndex] = { ...newMessages[lastMessageIndex], text: currentBotResponse };
                    return newMessages;
                }
                return prevMessages;
            });
            await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10)); // Faster typing for better UX
        }

        setIsTyping(false); // Bot finished typing
        console.log('handleSendMessage: isTyping mis à false. Bot a fini de taper.');

        // Reset manual stop flag after bot has responded.
        manualStopFlagRef.current = false;

        // If the user was in recording mode and bot finished typing, we attempt to restart recognition.
        // This is crucial for seamless voice interaction after bot's response.
        if (recognitionRef.current && isRecordingRef.current) {
            console.log("handleSendMessage: Le bot a fini de répondre, tentative de redémarrage de la reconnaissance.");
            try {
                recognitionRef.current.start();
            } catch (err: any) { // Typage de 'err'
                console.error('handleSendMessage: Échec du redémarrage de la reconnaissance après la réponse du bot:', err);
            }
        }

    }, [input, speakResponse]); // Dependency on speakResponse added

    // Initialize SpeechRecognition on component mount
    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            console.log('useEffect[SpeechRecognition]: API de reconnaissance vocale supportée.');
            // Utiliser les types déclarés globalement
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.continuous = false; // Set to false: recognition stops after each final result
            newRecognition.interimResults = false; // Only get final results
            newRecognition.lang = 'fr-FR'; // Set language to French
            newRecognition.maxAlternatives = 1; // Get only one alternative

            newRecognition.onstart = () => {
                console.log('Speech recognition started (onstart event)');
                setIsRecording(true); // Ensure state is consistent
                setInput(''); // Clear input field
                manualStopFlagRef.current = false; // Ensure this is false when starting
            };

            newRecognition.onresult = (event: SpeechRecognitionEvent) => { // Typage de 'event'
                const transcript = event.results[0][0].transcript; // Get the most confident final transcript
                console.log('Speech recognition: Final Transcript:', transcript);

                if (transcript.trim() !== '') {
                    // Update the input field with the final transcript
                    if (!isTypingRef.current && !isSpeakingRef.current) { // Only update if bot is not busy
                        setInput(transcript);
                    }
                    // Automatically send the message after a final transcript is received
                    handleSendMessage(null, transcript);
                }
            };

            newRecognition.onend = () => {
                console.log('Speech recognition ended (onend event).');
                // Only restart if the user *intended* to keep recording (isRecordingRef.current is true)
                // AND the stop was NOT manually requested (e.g., by clicking stop button or sending text message).
                // AND the bot is NOT currently speaking or typing.
                if (isRecordingRef.current && !manualStopFlagRef.current && !isTypingRef.current && !isSpeakingRef.current) {
                    console.log('Speech recognition: Redémarrage de la reconnaissance vocale suite à la fin de l\'énoncé...');
                    // Add a small delay before restarting to prevent rapid restarts
                    setTimeout(() => {
                        if (recognitionRef.current && isRecordingRef.current && !manualStopFlagRef.current && !isTypingRef.current && !isSpeakingRef.current) { // Re-check refs before starting
                            try {
                                recognitionRef.current.start();
                                console.log('Speech recognition: Redémarrage réussi après onend.');
                            } catch (err: any) { // Typage de 'err'
                                console.error('Speech recognition: Échec du redémarrage de la reconnaissance:', err);
                                setMessages(prev => [...prev, { id: Date.now(), text: "Problème avec le microphone. Essayez de redémarrer l'écoute.", sender: 'bot' }]);
                                setIsRecording(false); // Stop recording state if it truly failed
                            }
                        } else {
                            console.log('Speech recognition: Conditions de redémarrage non remplies après onend.');
                            setIsRecording(false); // Ensure state is false if not restarting
                        }
                    }, 500); // 500ms delay before restarting
                } else {
                    // If recording was stopped intentionally by user or bot is busy, ensure state is false
                    console.log('Speech recognition: Arrêt intentionnel ou bot occupé, pas de redémarrage.');
                    setIsRecording(false);
                    setInput('');
                    manualStopFlagRef.current = false; // Reset the flag
                }
            };

            newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => { // Typage de 'event'
                console.error('Speech recognition error (onerror event):', event.error);
                setIsRecording(false); // Ensure state is updated on error
                setInput(''); // Clear input on error
                manualStopFlagRef.current = false; // Reset the flag on error

                if (event.error === 'not-allowed') {
                    setMessages(prev => [...prev, { id: Date.now(), text: "Accès au microphone bloqué. Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur pour utiliser la fonction vocale.", sender: 'bot' }]);
                } else if (event.error === 'no-speech') {
                    console.log('Speech recognition: Aucune parole détectée.');
                    // If no speech is detected and user still wants to record, attempt restart
                    if (isRecordingRef.current && !isTypingRef.current && !isSpeakingRef.current) {
                        console.log('Speech recognition: Aucune parole détectée, tentative de redémarrage...');
                        setTimeout(() => {
                            if (recognitionRef.current && isRecordingRef.current && !isTypingRef.current && !isSpeakingRef.current) {
                                try {
                                    recognitionRef.current.start();
                                    console.log('Speech recognition: Redémarrage réussi après no-speech.');
                                } catch (err: any) { // Typage de 'err'
                                    console.error('Speech recognition: Échec du redémarrage de la reconnaissance après no-speech:', err);
                                    setMessages(prev => [...prev, { id: Date.now(), text: "Problème avec le microphone. Essayez de redémarrer l'écoute.", sender: 'bot' }]);
                                    setIsRecording(false);
                                }
                            } else {
                                console.log('Speech recognition: Conditions de redémarrage non remplies après no-speech.');
                                setIsRecording(false); // Ensure state is false if not restarting
                            }
                        }, 500); // Small delay for no-speech restart
                    }
                } else if (event.error === 'aborted') {
                    console.log('Speech recognition: Reconnaissance vocale annulée.');
                } else {
                    setMessages(prev => [...prev, { id: Date.now(), text: `Une erreur est survenue avec la reconnaissance vocale: ${event.error}`, sender: 'bot' }]);
                }
                // If an error occurs and the user still intends to record, try to restart
                if (isRecordingRef.current && event.error !== 'not-allowed' && event.error !== 'aborted' && !isTypingRef.current && !isSpeakingRef.current) { // Don't restart if permission denied or aborted
                    console.log('Speech recognition: Tentative de redémarrage de la reconnaissance vocale après erreur...');
                    setTimeout(() => {
                        if (recognitionRef.current && isRecordingRef.current && !isTypingRef.current && !isSpeakingRef.current) { // Re-check ref before starting
                            try {
                                recognitionRef.current.start();
                                console.log('Speech recognition: Redémarrage réussi après erreur.');
                            } catch (err: any) { // Typage de 'err'
                                console.error('Speech recognition: Échec du redémarrage de la reconnaissance après erreur (2e tentative):', err);
                            }
                        }
                    }, 100);
                }
            };
            recognitionRef.current = newRecognition;
        } else {
            console.warn('useEffect[SpeechRecognition]: API de reconnaissance vocale non supportée dans ce navigateur.');
            setMessages(prev => [...prev, { id: Date.now(), text: "Désolé, la reconnaissance vocale n'est pas supportée par votre navigateur. Vous pouvez toujours taper vos messages !", sender: 'bot' }]);
        }

        return () => {
            if (recognitionRef.current) {
                console.log('useEffect[SpeechRecognition]: Nettoyage de la reconnaissance vocale.');
                recognitionRef.current.stop();
                // Remove event listeners to prevent memory leaks and unexpected behavior
                recognitionRef.current.onresult = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
            }
        };
    }, [handleSendMessage]); // Dependency on handleSendMessage to ensure onresult has latest version

    // Nouveau: Initialize SpeechSynthesis on component mount
    useEffect(() => {
        if ('speechSynthesis' in window) {
            console.log('useEffect[SpeechSynthesis]: API de synthèse vocale supportée.');
            const newSynth = window.speechSynthesis;
            synthRef.current = newSynth;

            // Ensure voices are loaded (can take a moment)
            if (newSynth.getVoices().length === 0) {
                newSynth.onvoiceschanged = () => {
                    console.log('useEffect[SpeechSynthesis]: Voix chargées pour la synthèse vocale.');
                };
            }
        } else {
            console.warn('useEffect[SpeechSynthesis]: API de synthèse vocale non supportée dans ce navigateur.');
            setMessages(prev => [...prev, { id: Date.now(), text: "Désolé, la synthèse vocale n'est pas supportée par votre navigateur.", sender: 'bot' }]);
        }

        // Cleanup on unmount
        return () => {
            if (synthRef.current && synthRef.current.speaking) {
                console.log('useEffect[SpeechSynthesis]: Nettoyage de la synthèse vocale.');
                synthRef.current.cancel();
            }
        };
    }, []); // No dependencies for this effect as it's just for initialization

    // Function to toggle voice recording (start/stop listening)
    const toggleRecording = () => {
        if (!recognitionRef.current) {
            setMessages(prev => [...prev, { id: Date.now(), text: "La fonction vocale n'est pas disponible sur ce navigateur.", sender: 'bot' }]);
            console.log('toggleRecording: Reconnaissance vocale non disponible.');
            return;
        }

        // Prevent starting recording if bot is typing or speaking
        if (isTyping || isSpeaking) {
            setMessages(prev => [...prev, { id: Date.now(), text: "BATI-BOT est occupé pour le moment. Veuillez attendre qu'il ait terminé.", sender: 'bot' }]);
            console.log('toggleRecording: Bot occupé, ne peut pas démarrer l\'enregistrement.');
            return;
        }

        if (isRecording) {
            console.log('toggleRecording: Arrêt de l\'enregistrement (manuel).');
            manualStopFlagRef.current = true; // Set flag when user explicitly stops
            recognitionRef.current.stop(); // This will trigger onend
            setIsRecording(false); // Explicitly set to false when user stops
        } else {
            try {
                console.log('toggleRecording: Démarrage de l\'enregistrement.');
                manualStopFlagRef.current = false; // Ensure flag is false when starting
                recognitionRef.current.start();
                setIsRecording(true); // Explicitly set to true when user starts
            } catch (err: any) { // Typage de 'err'
                console.error('toggleRecording: Erreur lors du démarrage de la reconnaissance:', err);
                setMessages(prev => [...prev, { id: Date.now(), text: "Impossible de démarrer la reconnaissance vocale. Vérifiez les permissions de votre microphone.", sender: 'bot' }]);
                setIsRecording(false);
            }
        }
    };

    // Function to render text with clickable links
    const renderMessageContent = useCallback((text: string): (string | JSX.Element)[] => { // Typage de 'text' et retour 'string | JSX.Element[]'
        const parts: (string | JSX.Element)[] = []; // Typage correct pour 'parts'
        const whatsappRegex = /(\+225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\b(?:07|05|01)\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b)/g;
        const facebookRegex = /(https?:\/\/(?:www\.)?facebook\.com\/profile\.php\?id=\d+|https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._-]+)/g;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const phoneRegex = /(tel:|\b\+?225\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\b\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b)/g;
        const internalPathRegex = /(\/(acceuil|architecture|terrain|ecologique|classique|ingenieur|rang|bot)\b)/g;

        const combinedRegex = new RegExp(
            `(${whatsappRegex.source}|${facebookRegex.source}|${urlRegex.source}|${phoneRegex.source}|${internalPathRegex.source})`,
            'gi'
        );

        const segments = text.split(combinedRegex);

        segments.forEach((segment: string, index: number) => { // Typage de 'segment' et 'index'
            if (!segment) return;

            let matched = false;

            if (internalPathRegex.test(segment)) {
                const path = segment.toLowerCase();
                // Capitalize the first letter for display, but keep path lowercase for navigation
                const pageName = path.substring(1).charAt(0).toUpperCase() + path.substring(2);
                parts.push(
                    <span
                        key={`segment-${index}`}
                        className="text-blue-600 hover:underline cursor-pointer"
                        onClick={() => navigate(path)}
                    >
                        {pageName}
                    </span>
                );
                matched = true;
            }
            else if (whatsappRegex.test(segment)) {
                const number = segment.replace(/\s/g, '').replace('+', '');
                parts.push(
                    <a
                        key={`segment-${index}`}
                        href={`https://wa.me/${number}?text=Bonjour%20BATI-PRO-INGENIERIE%2C%20je%20souhaite%20obtenir%20des%20renseignements.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        WhatsApp
                    </a>
                );
                matched = true;
            }
            else if (facebookRegex.test(segment)) {
                parts.push(
                    <a
                        key={`segment-${index}`}
                        href={segment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Facebook
                    </a>
                );
                matched = true;
            }
            else if (urlRegex.test(segment)) {
                parts.push(
                    <a
                        key={`segment-${index}`}
                        href={segment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Lien externe
                    </a>
                );
                matched = true;
            }
            else if (phoneRegex.test(segment)) {
                const number = segment.replace(/[^+\d]/g, '');
                parts.push(
                    <a
                        key={`segment-${index}`}
                        href={`tel:${number}`}
                        className="text-blue-600 hover:underline"
                    >
                        Appeler
                    </a>
                );
                matched = true;
            }

            if (!matched) {
                parts.push(<span key={`segment-${index}`}>{segment}</span>);
            }
        });
        return parts;
    }, [navigate]);


    return (
        <div className="flex flex-col h-screen bg-gray-100 animated-gradient-bg font-inter">
            {/* <Nav admin={true} />  Retiré */}

            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Chat window */}
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="flex flex-col space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-800'
                                    }`}
                                >
                                    {renderMessageContent(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md bg-gray-200 text-gray-600">
                                    BATI-BOT est en train d'écrire<span className="typing-indicator-dots"></span>
                                </div>
                            </div>
                        )}
                        {isSpeaking && !isTyping && ( // Show speaking indicator only when bot is speaking and not typing
                            <div className="flex justify-start">
                                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md bg-gray-200 text-gray-600 flex items-center">
                                    BATI-BOT parle <div className="speaking-wave ml-2"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
               <form onSubmit={(e) => handleSendMessage(e)} className="mt-4 flex flex-col sm:flex-row p-2 bg-white rounded-lg shadow-lg">
    <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isRecording ? "Écoute... Dites quelque chose." : (isSpeaking ? "BATI-BOT parle..." : "Posez votre question sur BATI-PRO-INGENIERIE...")}
        className="flex-1 p-3 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0"
        disabled={isTyping || isSpeaking}
    />

    <div className="boutons flex justify-end sm:justify-start">
        <button
            type="button"
            onClick={toggleRecording}
            className={`ml-0 sm:ml-2 px-3 py-3 rounded-lg shadow-md flex items-center justify-center flex-shrink-0
                ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
                text-white font-bold transition duration-300 ease-in-out transform hover:scale-105
                ${(isTyping || isSpeaking) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isTyping || isSpeaking}
        >
            {isRecording ? <FaStopCircle className="text-xl" /> : <FaMicrophone className="text-xl" />}
        </button>
        <button
            type="submit"
            className={`ml-2 px-3 py-3 rounded-lg shadow-md flex items-center justify-center flex-shrink-0
                bg-green-500 hover:bg-green-600 text-white font-bold transition duration-300 ease-in-out transform hover:scale-105
                ${(isTyping || isSpeaking || input.trim() === '') ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isTyping || isSpeaking || input.trim() === ''}
        >
            <FaPaperPlane className="text-xl" />
        </button>
    </div>
</form>
            </div>

            <style >{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .typing-indicator-dots span {
                    animation: blink 1s infinite;
                }
                .typing-indicator-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .typing-indicator-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes wave {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(-3px); }
                    50% { transform: translateY(0); }
                    75% { transform: translateY(3px); }
                }
                .speaking-wave {
                    display: flex;
                    align-items: center;
                    height: 1em; /* Adjust as needed */
                }
                .speaking-wave::before,
                .speaking-wave::after {
                    content: '';
                    display: block;
                    width: 4px;
                    height: 10px;
                    background-color: currentColor;
                    margin: 0 1px;
                    animation: wave 1.2s infinite ease-in-out;
                    border-radius: 2px;
                }
                .speaking-wave::before {
                    animation-delay: -0.2s;
                }
                .speaking-wave::after {
                    animation-delay: -0.4s;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }

                @keyframes gradient-animation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .animated-gradient-bg {
                    background: linear-gradient(270deg, #e0f7fa, #bbdefb, #e0f7fa);
                    background-size: 600% 600%;
                    animation: gradient-animation 15s ease infinite;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in-up {
                    animation: fadeIn 0.3s ease-out forwards;
                }

                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .flex-col.sm\\:flex-row {
                        flex-direction: column;
                    }
                    .sm\\:rounded-l-lg {
                        border-radius: 0.5rem; /* rounded-lg */
                    }
                    .sm\\:rounded-r-none {
                        border-top-right-radius: 0.5rem;
                        border-bottom-right-radius: 0.5rem;
                    }
                    .mb-2.sm\\:mb-0 {
                        margin-bottom: 0.5rem;
                    }
                    .ml-0.sm\\:ml-2 {
                        margin-left: 0;
                    }
                }
            `}</style>
        </div>
    );
}
