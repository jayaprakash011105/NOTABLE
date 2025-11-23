import { useState } from 'react';
import { Search, Plus, Mic, Image, Pin, MoreHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModalWrapper from '../components/ModalWrapper';
import NoteForm from '../components/NoteForm';
import ConfirmDialog from '../components/ConfirmDialog';

interface Note {
    id: number;
    title: string;
    content: string;
    date: string;
    color: string;
    pinned?: boolean;
}

const Notes = () => {
    const { t } = useTranslation();
    const [notes, setNotes] = useState<Note[]>([
        {
            id: 1,
            title: 'Meeting Notes',
            content: 'Discussed project timeline and deliverables for Q1...',
            date: 'Dec 5, 2024',
            color: 'bg-yellow-100 dark:bg-yellow-900',
            pinned: true,
        },
        {
            id: 2,
            title: 'Shopping List',
            content: 'Milk, Eggs, Bread, Fruits, Vegetables...',
            date: 'Dec 4, 2024',
            color: 'bg-green-100 dark:bg-green-900',
        },
        {
            id: 3,
            title: 'Ideas',
            content: 'New app features: dark mode, multi-language support...',
            date: 'Dec 3, 2024',
            color: 'bg-blue-100 dark:bg-blue-900',
            pinned: true,
        },
        {
            id: 4,
            title: 'Travel Plans',
            content: 'Book flights for vacation in January, research hotels...',
            date: 'Dec 2, 2024',
            color: 'bg-purple-100 dark:bg-purple-900',
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
    const [showMenuForNote, setShowMenuForNote] = useState<number | null>(null);

    const handleAddNote = (noteData: Partial<Note>) => {
        const newNote: Note = {
            id: Math.max(...notes.map(n => n.id), 0) + 1,
            title: noteData.title || '',
            content: noteData.content || '',
            color: noteData.color || 'bg-yellow-100 dark:bg-yellow-900',
            date: noteData.date || new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            pinned: false
        };
        setNotes([...notes, newNote]);
        setShowAddModal(false);
    };

    const handleEditNote = (noteData: Partial<Note>) => {
        if (editingNote) {
            setNotes(notes.map(note =>
                note.id === editingNote.id ? { ...note, ...noteData } : note
            ));
            setEditingNote(null);
        }
    };

    const handleDeleteNote = () => {
        if (noteToDelete) {
            setNotes(notes.filter(note => note.id !== noteToDelete));
            setNoteToDelete(null);
        }
    };

    const handleTogglePin = (id: number) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, pinned: !note.pinned } : note
        ));
        setShowMenuForNote(null);
    };

    const handleVoiceNote = () => {
        alert('Voice note feature coming soon!');
    };

    const handleImageNote = () => {
        alert('Image note feature coming soon!');
    };

    const filteredNotes = notes.filter(note =>
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedNotes = filteredNotes.filter(n => n.pinned);
    const regularNotes = filteredNotes.filter(n => !n.pinned);

    const NoteCard = ({ note }: { note: Note }) => (
        <div className={`${note.color} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}>
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base">{note.title}</h3>
                <div className="flex gap-1">
                    {note.pinned && <Pin className="w-4 h-4 text-gray-600" />}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenuForNote(showMenuForNote === note.id ? null : note.id);
                            }}
                            className="hover:bg-white/50 dark:hover:bg-black/20 rounded-full p-1 transition"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showMenuForNote === note.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 animate-slide-down">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingNote(note);
                                        setShowMenuForNote(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePin(note.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    {note.pinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setNoteToDelete(note.id);
                                        setShowMenuForNote(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                {note.content}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{note.date}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            <div className="max-w-md mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Notes</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black hover:scale-105 transition-all duration-200 shadow-md"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={handleVoiceNote}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-sm"
                    >
                        <Mic className="w-5 h-5" />
                        <span className="text-sm font-medium">Voice</span>
                    </button>
                    <button
                        onClick={handleImageNote}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 shadow-sm"
                    >
                        <Image className="w-5 h-5" />
                        <span className="text-sm font-medium">Image</span>
                    </button>
                </div>

                {/* Pinned Notes */}
                {pinnedNotes.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                            Pinned
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {pinnedNotes.map(note => (
                                <div key={note.id} onClick={() => setEditingNote(note)}>
                                    <NoteCard note={note} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Notes */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                        All Notes
                    </h2>
                    {regularNotes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {regularNotes.map(note => (
                                <div key={note.id} onClick={() => setEditingNote(note)}>
                                    <NoteCard note={note} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No notes found' : 'No notes yet. Create one!'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Note Modal */}
            <ModalWrapper
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Note"
            >
                <NoteForm
                    onSave={handleAddNote}
                    onCancel={() => setShowAddModal(false)}
                />
            </ModalWrapper>

            {/* Edit Note Modal */}
            <ModalWrapper
                isOpen={!!editingNote}
                onClose={() => setEditingNote(null)}
                title="Edit Note"
            >
                <NoteForm
                    note={editingNote || undefined}
                    onSave={handleEditNote}
                    onCancel={() => setEditingNote(null)}
                />
            </ModalWrapper>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!noteToDelete}
                onClose={() => setNoteToDelete(null)}
                onConfirm={handleDeleteNote}
                title="Delete Note"
                message="Are you sure you want to delete this note? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default Notes;
