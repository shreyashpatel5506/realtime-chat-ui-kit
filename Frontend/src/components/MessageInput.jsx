// ClarityCode fix note: Array element access at index 0 without visible length guard may fail on empty arrays.
import React, { useRef, useState, useEffect } from 'react';
import { useChatStore } from '../StoreValues/useChat.Store';
import { Image, X, Send, Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import toast from 'react-hot-toast';

const MessageInput = () => {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [emojiSearchResults, setEmojiSearchResults] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [searchWord, setSearchWord] = useState('');
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const { sendMessage } = useChatStore();

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Emoji search using `:` trigger
    useEffect(() => {
        const match = text.match(/:([a-zA-Z0-9_+-]+)?$/);
        if (match) {
            const query = match[1];
            if (query && query.length >= 1) {
                setSearchWord(query);
                const results = data.emojis
                    ? Object.values(data.emojis)
                        .filter((e) => e.shortcodes?.some((code) => code.startsWith(query)))
                        .slice(0, 8)
                    : [];
                setEmojiSearchResults(results);
                setShowAutocomplete(true);
            } else {
                setShowAutocomplete(false);
            }
        } else {
            setShowAutocomplete(false);
        }
    }, [text]);

    const insertEmojiFromAutocomplete = (emoji) => {
        const newText = text.replace(/:([a-zA-Z0-9_+-]+)?$/, emoji.native);
        setText(newText);
        setShowAutocomplete(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleSendMessages = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) {
            return toast.error('Please enter a message or select an image.');
        }

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview || null,
            });

            setText('');
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
            toast.success('Message sent!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message.');
        }
    };

    const addEmoji = (emoji) => {
        setText((prev) => prev + (emoji.native || emoji.emoji));
    };

    return (
        <div className="p-4 w-full relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div ref={emojiRef} className="absolute bottom-16 left-4 z-50">
                    <Picker data={data} onEmojiSelect={addEmoji} theme="dark" />
                </div>
            )}

            {/* Emoji Autocomplete Popup */}
            {showAutocomplete && emojiSearchResults.length > 0 && (
                <div className="absolute bottom-16 left-4 z-50 bg-base-300 border border-zinc-600 rounded-lg shadow-lg p-2 max-w-sm w-60">
                    {emojiSearchResults.map((emoji) => (
                        <button
                            key={emoji.id}
                            onClick={() => insertEmojiFromAutocomplete(emoji)}
                            className="flex items-center gap-2 px-2 py-1 w-full hover:bg-zinc-700 text-left rounded"
                        >
                            <span className="text-xl">{emoji.native}</span>
                            <span className="text-sm text-zinc-400">:{emoji.id}:</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSendMessages} className="flex items-center gap-2">
                <div className="flex flex-1 gap-2 items-center relative">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`btn btn-circle btn-sm text-zinc-400 ${imagePreview && 'text-emerald-500'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>

                    <button
                        type="button"
                        className="btn btn-circle btn-sm text-zinc-400"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                    >
                        <Smile size={20} />
                    </button>
                </div>

                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim() && !imagePreview}
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
