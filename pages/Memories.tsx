
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Memory as MemoryType, Role, User } from '../types';
import { Icons } from '../components/icons';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { Lightbox } from '../components/ui/Lightbox';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

interface MemoriesProps {
    memories: MemoryType[];
    setMemories: React.Dispatch<React.SetStateAction<MemoryType[]>>;
    users: User[];
    currentUser: User;
    isLoading: boolean;
}

const MemoryCard = React.memo<{ memory: MemoryType; currentUser: User; onClick: () => void; onDelete: () => void; }>(({ memory, currentUser, onClick, onDelete }) => {
    const canManage = [Role.Admin, Role.LopPhoDoiSong].includes(currentUser.role);
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div onClick={onClick} className="group relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid mb-4 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <img src={memory.thumbnail} alt="Memory" className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {canManage && (
                 <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity !w-8 !h-8" onClick={handleDelete}>
                    <Icons.Trash2 className="w-4 h-4"/>
                </Button>
            )}
            <div className="absolute bottom-0 left-0 p-4 text-white w-full translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-xs font-semibold">{memory.semester}</p>
                <div className="flex items-center gap-4 mt-2">
                    {Object.entries(memory.reactions).map(([emoji, count]) => (
                        <div key={emoji} className="flex items-center gap-1 text-xs bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                            <span>{emoji}</span>
                            <span>{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

const MemoryCardSkeleton = () => {
    const randomHeight = Math.floor(Math.random() * (350 - 200 + 1)) + 200;
    return <Skeleton style={{ height: `${randomHeight}px` }} className="w-full rounded-xl" />;
};


const Memories: React.FC<MemoriesProps> = ({ memories, setMemories, users, currentUser, isLoading }) => {
    const { addToast } = useToast();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isViewerOpen, setViewerOpen] = useState(false);
    const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null);
    const [newMemory, setNewMemory] = useState({ url: '', semester: '' });
    const [deletingMemory, setDeletingMemory] = useState<MemoryType | null>(null);
    const [activeSemester, setActiveSemester] = useState<string>('Tất cả');
    
    const [layout, setLayout] = useState<'timeline' | 'grid'>(() => {
        const savedLayout = localStorage.getItem('memoriesLayout') as 'timeline' | 'grid';
        return savedLayout || 'timeline';
    });

    useEffect(() => {
        localStorage.setItem('memoriesLayout', layout);
    }, [layout]);

    const uniqueSemesters = useMemo(() => ['Tất cả', ...Array.from(new Set(memories.map(m => m.semester))).sort()], [memories]);
    
    const filteredMemories = useMemo(() => {
        const approvedMemories = memories.filter(m => m.status === 'đã duyệt');
        if (activeSemester === 'Tất cả') return approvedMemories;
        return approvedMemories.filter(m => m.semester === activeSemester);
    }, [memories, activeSemester]);

    const groupedMemories = useMemo(() => {
        if (layout === 'grid') return {}; // No need to group for grid layout
        return filteredMemories.reduce<Record<string, MemoryType[]>>((acc, memory) => {
            const semesterKey = memory.semester;
            if (!acc[semesterKey]) {
                acc[semesterKey] = [];
            }
            acc[semesterKey].push(memory);
            return acc;
        }, {});
    }, [filteredMemories, layout]);


    const handleAddMemory = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemory.url.trim() || !newMemory.semester.trim()) return;

        const canBypassModeration = [Role.Admin, Role.LopTruong, Role.BiThu].includes(currentUser.role);

        const memoryToAdd: MemoryType = {
            id: Date.now(),
            type: 'image',
            url: newMemory.url,
            thumbnail: newMemory.url, // For simplicity, thumbnail is same as full image
            semester: newMemory.semester,
            uploaderId: currentUser.id,
            reactions: {},
            status: canBypassModeration ? 'đã duyệt' : 'chờ duyệt',
        };
        setMemories(mems => [memoryToAdd, ...mems]);
        setAddModalOpen(false);
        setNewMemory({ url: '', semester: '' });

        if (canBypassModeration) {
            addToast({ title: 'Thành công!', message: 'Kỷ niệm của bạn đã được đăng.', type: 'success' });
        } else {
            addToast({ title: 'Thành công!', message: 'Kỷ niệm của bạn đã được gửi và đang chờ duyệt.', type: 'info' });
        }
    }, [newMemory, currentUser, setMemories, addToast]);

    const handleConfirmDelete = useCallback(() => {
        if (!deletingMemory) return;
        setMemories(prev => prev.filter(m => m.id !== deletingMemory!.id));
        addToast({ title: 'Đã xóa!', message: 'Kỷ niệm đã được xóa.', type: 'info' });
        setDeletingMemory(null);
    }, [deletingMemory, setMemories, addToast]);

    const handleOpenViewer = useCallback((memory: MemoryType) => {
        const indexInFiltered = filteredMemories.findIndex(m => m.id === memory.id);
        if(indexInFiltered !== -1) {
            setSelectedMemoryIndex(indexInFiltered);
            setViewerOpen(true);
        }
    }, [filteredMemories]);

    const handleCloseViewer = useCallback(() => {
        setViewerOpen(false);
        setSelectedMemoryIndex(null);
    }, []);

    const handleNextMemory = useCallback(() => {
        if (selectedMemoryIndex !== null && selectedMemoryIndex < filteredMemories.length - 1) {
            setSelectedMemoryIndex(selectedMemoryIndex + 1);
        }
    }, [selectedMemoryIndex, filteredMemories.length]);

    const handlePrevMemory = useCallback(() => {
        if (selectedMemoryIndex !== null && selectedMemoryIndex > 0) {
            setSelectedMemoryIndex(selectedMemoryIndex - 1);
        }
    }, [selectedMemoryIndex]);

    const handleReact = useCallback((reaction: string) => {
        if (selectedMemoryIndex === null) return;
        const memoryId = filteredMemories[selectedMemoryIndex].id;

        setMemories(prev => prev.map(mem => {
            if (mem.id === memoryId) {
                const newReactions = { ...mem.reactions };
                newReactions[reaction] = (newReactions[reaction] || 0) + 1;
                return { ...mem, reactions: newReactions };
            }
            return mem;
        }));
        addToast({ title: 'Cảm ơn!', message: `Bạn đã thả cảm xúc ${reaction}.`, type: 'success' });
    }, [selectedMemoryIndex, filteredMemories, setMemories, addToast]);

    const selectedMemory = selectedMemoryIndex !== null ? filteredMemories[selectedMemoryIndex] : null;
    const uploader = selectedMemory ? users.find(u => u.id === selectedMemory.uploaderId) : null;

    if (isLoading) {
        return (
             <div className="space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Skeleton className="h-9 w-52 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-28 rounded-lg" />
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-10 w-40 rounded-lg" />
                    </div>
                </div>
                 <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => <MemoryCardSkeleton key={i} />)}
                </div>
             </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-center md:text-left">Kỷ niệm lớp</h1>
                <div className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:justify-end">
                    <select
                        value={activeSemester}
                        onChange={(e) => setActiveSemester(e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {uniqueSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div className="p-1 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center">
                        <Button
                            variant={layout === 'timeline' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="!w-8 !h-8"
                            onClick={() => setLayout('timeline')}
                            aria-label="Xem dạng dòng thời gian"
                        >
                            <Icons.List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={layout === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="!w-8 !h-8"
                            onClick={() => setLayout('grid')}
                            aria-label="Xem dạng lưới"
                        >
                            <Icons.LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button onClick={() => setAddModalOpen(true)} size="icon" className="md:w-auto md:px-4">
                        <Icons.Plus className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Thêm kỷ niệm</span>
                    </Button>
                </div>
            </div>
            
            {filteredMemories.length > 0 ? (
                <>
                {layout === 'timeline' ? (
                     <div className="space-y-8">
                        {Object.entries(groupedMemories).map(([semester, semesterMemories]) => (
                            <div key={semester}>
                                <h2 className="text-xl font-semibold mb-4 pb-2 border-b dark:border-gray-700">{semester}</h2>
                                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                                    {semesterMemories.map((memory) => (
                                        <MemoryCard 
                                            key={memory.id} 
                                            memory={memory}
                                            currentUser={currentUser}
                                            onClick={() => handleOpenViewer(memory)} 
                                            onDelete={() => setDeletingMemory(memory)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                        {filteredMemories.map((memory) => (
                            <MemoryCard 
                                key={memory.id} 
                                memory={memory} 
                                currentUser={currentUser}
                                onClick={() => handleOpenViewer(memory)} 
                                onDelete={() => setDeletingMemory(memory)}
                            />
                        ))}
                    </div>
                )}
                </>
            ) : (
                <div className="text-center py-20">
                    <Icons.Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Chưa có kỷ niệm nào</h3>
                    <p className="text-gray-500">Hãy là người đầu tiên thêm vào một khoảnh khắc đáng nhớ!</p>
                </div>
            )}


            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Thêm kỷ niệm mới">
                <form onSubmit={handleAddMemory} className="space-y-4">
                    <input
                        type="url"
                        placeholder="Link ảnh (URL)"
                        value={newMemory.url}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Học kỳ (VD: Học kỳ 1 - Năm 1)"
                        value={newMemory.semester}
                        onChange={(e) => setNewMemory(prev => ({ ...prev, semester: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>Hủy</Button>
                        <Button type="submit">Thêm</Button>
                    </div>
                </form>
            </Modal>
            
            <Lightbox
                isOpen={isViewerOpen}
                onClose={handleCloseViewer}
                memory={selectedMemory}
                uploader={uploader || null}
                onNext={handleNextMemory}
                onPrev={handlePrevMemory}
                onReact={handleReact}
                hasNext={selectedMemoryIndex !== null && selectedMemoryIndex < filteredMemories.length - 1}
                hasPrev={selectedMemoryIndex !== null && selectedMemoryIndex > 0}
            />
            
            {deletingMemory && (
                <Modal isOpen={!!deletingMemory} onClose={() => setDeletingMemory(null)} title="Xác nhận xóa">
                    <p>Bạn có chắc chắn muốn xóa kỷ niệm này không? Hành động này không thể hoàn tác.</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setDeletingMemory(null)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Memories;
