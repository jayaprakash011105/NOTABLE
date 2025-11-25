import { useState } from 'react';
import { Search, Plus, Mic, Image, Pin, MoreHorizontal, X, Grid, List, Copy, Archive, Tag, Palette } from 'lucide-react';
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
    tags?: string[];
    archived?: boolean;
}


const Notes = () => {
    const [notes, setNotes] = useState<Note[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
    const [showMenuForNote, setShowMenuForNote] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'date' | 'title' | 'color'>('date');
    const [showTemplates, setShowTemplates] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

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

    const handleDuplicateNote = (note: Note) => {
        const newNote: Note = {
            ...note,
            id: Math.max(...notes.map(n => n.id), 0) + 1,
            title: `${note.title} (Copy)`,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            pinned: false
        };
        setNotes([...notes, newNote]);
        setShowMenuForNote(null);
    };

    const handleArchiveNote = (id: number) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, archived: !note.archived } : note
        ));
        setShowMenuForNote(null);
    };

    const useTemplate = (template: Partial<Note>) => {
        const newNote: Note = {
            id: Math.max(...notes.map(n => n.id), 0) + 1,
            title: template.title || '',
            content: template.content || '',
            color: template.color || 'bg-yellow-100 dark:bg-yellow-900',
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            tags: template.tags || [],
            pinned: false,
            archived: false
        };
        setNotes([...notes, newNote]);
        setShowTemplates(false);
    };

    const handleVoiceNote = () => {
        alert('Voice note feature coming soon!');
    };

    const handleImageNote = () => {
        alert('Image note feature coming soon!');
    };

    const templates = [
        { title: 'Meeting Notes', content: '## Attendees:\n\n## Agenda:\n\n## Action Items:\n', color: 'bg-blue-100 dark:bg-blue-900', tags: ['work', 'meeting'] },
        { title: 'Shopping List', content: '- \n- \n- \n', color: 'bg-green-100 dark:bg-green-900', tags: ['personal'] },
        { title: 'To-Do List', content: '[ ] \n[ ] \n[ ] \n', color: 'bg-yellow-100 dark:bg-yellow-900', tags: ['productivity'] },
        { title: 'Journal Entry', content: `${new Date().toDateString()}\n\nToday I...\n`, color: 'bg-purple-100 dark:bg-purple-900', tags: ['personal', 'journal'] },
        { title: 'Ideas', content: '💡 Idea 1:\n\n💡 Idea 2:\n\n💡 Idea 3:\n', color: 'bg-pink-100 dark:bg-pink-900', tags: ['brainstorm'] },
    ];

    const filteredNotes = notes
        .filter(note => !note.archived || showArchived)
        .filter(note =>
            !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'color') return a.color.localeCompare(b.color);
            return 0; // date sorting (keep original order)
        });

    const pinnedNotes = filteredNotes.filter(n => n.pinned);
    const regularNotes = filteredNotes.filter(n => !n.pinned);

    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const NoteCard = ({ note }: { note: Note }) => (
        <div className={`${note.color} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative ${viewMode === 'list' ? 'col-span-2' : ''}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{note.title}</h3>
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                            {note.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full text-xs">
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-1">
                    {note.pinned && <Pin className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                    {note.archived && <Archive className="w-4 h-4 text-gray-600 flex-shrink-0" />}
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
                            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 animate-slide-down">
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
                                        handleDuplicateNote(note);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                                >
                                    <Copy className="w-3 h-3" />
                                    Duplicate
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleArchiveNote(note.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                                >
                                    <Archive className="w-3 h-3" />
                                    {note.archived ? 'Unarchive' : 'Archive'}
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
            <p className={`text-sm text-gray-700 dark:text-gray-300 mb-2 ${viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                {note.content}
            </p>
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">{note.date}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getWordCount(note.content)} words</p>
            </div>
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

                {/* Toolbar */}
                <div className="flex items-center gap-2 mb-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'color')}
                        className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm outline-none flex-1"
                    >
                        <option value="date">📅 Date</option>
                        <option value="title">🔤 Title</option>
                        <option value="color">🎨 Color</option>
                    </select>

                    {/* Templates Button */}
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        title="Templates"
                    >
                        <Palette className="w-4 h-4" />
                    </button>

                    {/* Archive Toggle */}
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`p-2 rounded-xl border transition ${showArchived ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                        title={showArchived ? 'Hide Archived' : 'Show Archived'}
                    >
                        <Archive className="w-4 h-4" />
                    </button>
                </div>

                {/* Templates Panel */}
                {showTemplates && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Quick Templates
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {templates.map((template, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => useTemplate(template)}
                                    className={`${template.color} p-3 rounded-xl text-left hover:scale-105 transition-all duration-200 shadow-sm`}
                                >
                                    <p className="font-medium text-sm">{template.title}</p>
                                    <p className="text-xs opacity-75 mt-1">{template.tags?.join(', ')}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notes and tags..."
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
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
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
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
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
