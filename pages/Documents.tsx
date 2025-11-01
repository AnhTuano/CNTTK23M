import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons';
import { Document as DocType, User as UserType, Role } from '../types';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { AnimatePresence, motion } from 'framer-motion';

interface DocumentsProps {
    documents: DocType[];
    setDocuments: React.Dispatch<React.SetStateAction<DocType[]>>;
    users: UserType[];
    currentUser: UserType;
}

const SUBJECT_COLORS: Record<string, string> = {
    'Mạng Máy Tính': 'from-indigo-400/80 to-purple-500/80',
    'Lập Trình Web': 'from-emerald-400/80 to-teal-500/80',
    'Cơ Sở Dữ Liệu': 'from-rose-400/80 to-fuchsia-500/80',
    'Trí Tuệ Nhân Tạo': 'from-amber-400/80 to-orange-500/80',
    'Triết học': 'from-sky-400/80 to-cyan-500/80',
    'Khác': 'from-slate-500/80 to-slate-600/80',
};

const DocumentCard = React.memo<{ doc: DocType; uploader?: UserType; currentUser: UserType; onEdit: () => void; onDelete: () => void; }>(({ doc, uploader, currentUser, onEdit, onDelete }) => {
    const bgGradient = SUBJECT_COLORS[doc.subject] || 'from-gray-500/80 to-gray-400/80';
    const canManage = [Role.Admin, Role.LopPhoHocTap].includes(currentUser.role);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);
    
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault();
        e.stopPropagation();
        action();
    }

    return (
        <a href={doc.link} target="_blank" rel="noopener noreferrer" className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
            <Card className={`relative overflow-hidden group flex flex-col h-full p-0 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                <div className={`absolute -inset-4 opacity-30 dark:opacity-40 blur-2xl bg-gradient-to-br ${bgGradient} transition-opacity duration-500 group-hover:opacity-50`}></div>
                
                <div className="relative z-10 flex flex-col flex-grow p-5 text-slate-800 dark:text-white">
                    <div className="flex justify-between items-center mb-4 text-xs font-semibold">
                        <span className="px-2 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-white backdrop-blur-sm">{doc.subject}</span>
                        <span className="px-2 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-white backdrop-blur-sm">{doc.type}</span>
                    </div>

                    <div className="flex-grow my-2">
                        <h3 className="text-md font-bold text-slate-800 dark:text-white">{doc.title}</h3>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-900/10 dark:border-white/20 flex justify-between items-center">
                        {uploader && (
                            <div className="flex items-center gap-2 text-xs">
                                <img src={uploader.avatar} alt={uploader.name} className="w-7 h-7 rounded-full" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">{uploader.name}</p>
                                    <p className="text-slate-600 dark:text-gray-300">{doc.timestamp}</p>
                                </div>
                            </div>
                        )}
                         {canManage && (
                            <div className="relative" ref={menuRef}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="!w-8 !h-8 bg-slate-900/5 hover:bg-slate-900/10 dark:bg-black/10 dark:hover:bg-black/20 text-slate-700 dark:text-white" 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(prev => !prev); }}>
                                    <Icons.MoreVertical className="w-4 h-4" />
                                </Button>
                                <AnimatePresence>
                                {menuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 bottom-full mb-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20"
                                    >
                                        <div className="py-1 text-gray-700 dark:text-gray-200" role="menu" aria-orientation="vertical">
                                            <button onClick={(e) => handleActionClick(e, onEdit)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                <Icons.Edit className="w-4 h-4 mr-2" /> Sửa
                                            </button>
                                            <button onClick={(e) => handleActionClick(e, onDelete)} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                <Icons.Trash2 className="w-4 h-4 mr-2" /> Xóa
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </a>
    );
});

const initialDocState = { title: '', link: '', subject: 'Khác', type: 'Ghi chú' as DocType['type'] };

const Documents: React.FC<DocumentsProps> = ({ documents, setDocuments, users, currentUser }) => {
    const { addToast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocType | null>(null);
    const [docFormData, setDocFormData] = useState(initialDocState);
    const [deletingDoc, setDeletingDoc] = useState<DocType | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{ subjects: string[]; types: string[] }>({ subjects: [], types: [] });
    const filterRef = useRef<HTMLDivElement>(null);

    const uniqueSubjects = useMemo(() => [...new Set(documents.map(d => d.subject))], [documents]);
    const uniqueTypes = useMemo(() => [...new Set(documents.map(d => d.type))], [documents]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            if (doc.status !== 'đã duyệt') return false;
            const searchMatch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
            const subjectMatch = activeFilters.subjects.length === 0 || activeFilters.subjects.includes(doc.subject);
            const typeMatch = activeFilters.types.length === 0 || activeFilters.types.includes(doc.type);
            return searchMatch && subjectMatch && typeMatch;
        });
    }, [documents, searchTerm, activeFilters]);

    useEffect(() => {
        if (editingDoc) {
            setDocFormData({ title: editingDoc.title, link: editingDoc.link, subject: editingDoc.subject, type: editingDoc.type });
        } else {
            setDocFormData(initialDocState);
        }
    }, [editingDoc]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterRef]);


    const handleOpenAddModal = useCallback(() => {
        setEditingDoc(null);
        setModalOpen(true);
    }, []);

    const handleOpenEditModal = useCallback((doc: DocType) => {
        setEditingDoc(doc);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setEditingDoc(null);
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const canBypassModeration = [Role.Admin, Role.LopTruong, Role.BiThu].includes(currentUser.role);
        
        if (editingDoc) {
            // Edit existing doc
            setDocuments(docs => docs.map(d => d.id === editingDoc.id ? { ...d, ...docFormData } : d));
            addToast({ title: 'Thành công!', message: 'Tài liệu đã được cập nhật.', type: 'success' });
        } else {
            // Add new doc
            const newDoc: DocType = {
                id: Date.now(),
                uploaderId: currentUser.id,
                timestamp: 'Vừa xong',
                ...docFormData,
                status: canBypassModeration ? 'đã duyệt' : 'chờ duyệt',
            };
            setDocuments(docs => [newDoc, ...docs]);
            
            if (canBypassModeration) {
                addToast({ title: 'Thành công!', message: 'Tài liệu của bạn đã được đăng.', type: 'success' });
            } else {
                addToast({ title: 'Thành công!', message: 'Tài liệu của bạn đã được gửi và đang chờ duyệt.', type: 'info' });
            }
        }
        handleCloseModal();
    }, [editingDoc, docFormData, currentUser, setDocuments, addToast, handleCloseModal]);
    
    const handleConfirmDelete = useCallback(() => {
        if (!deletingDoc) return;
        setDocuments(docs => docs.filter(d => d.id !== deletingDoc.id));
        addToast({ title: 'Đã xóa!', message: 'Tài liệu đã được xóa.', type: 'info' });
        setDeletingDoc(null);
    }, [deletingDoc, setDocuments, addToast]);

    const handleFilterChange = (filterType: 'subjects' | 'types', value: string) => {
        setActiveFilters(prev => {
            const currentFilters = prev[filterType];
            const newFilters = currentFilters.includes(value)
                ? currentFilters.filter(item => item !== value)
                : [...currentFilters, value];
            return { ...prev, [filterType]: newFilters };
        });
    };

    const clearFilters = () => setActiveFilters({ subjects: [], types: [] });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Tài liệu học tập</h1>
                 <div className="flex items-center gap-2">
                    <div className="relative">
                        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm tài liệu..." 
                            className="w-full md:w-auto rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative" ref={filterRef}>
                        <Button variant="secondary" onClick={() => setFilterOpen(prev => !prev)}>
                            <Icons.Filter className="w-4 h-4 mr-2" />
                            Lọc
                        </Button>
                        <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 mt-2 w-64 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20"
                            >
                                <div className="p-4">
                                    <h4 className="font-semibold text-sm mb-2">Môn học</h4>
                                    <div className="space-y-1">
                                    {uniqueSubjects.map(subject => (
                                        <label key={subject} className="flex items-center text-sm">
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={activeFilters.subjects.includes(subject)} onChange={() => handleFilterChange('subjects', subject)} />
                                            <span className="ml-2">{subject}</span>
                                        </label>
                                    ))}
                                    </div>
                                    <h4 className="font-semibold text-sm mt-4 mb-2">Loại tài liệu</h4>
                                    <div className="space-y-1">
                                    {uniqueTypes.map(type => (
                                        <label key={type} className="flex items-center text-sm">
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={activeFilters.types.includes(type)} onChange={() => handleFilterChange('types', type)} />
                                            <span className="ml-2">{type}</span>
                                        </label>
                                    ))}
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full mt-4" onClick={clearFilters}>Xóa bộ lọc</Button>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <Button onClick={handleOpenAddModal} size="icon" className="md:w-auto md:px-4">
                        <Icons.Plus className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Thêm tài liệu</span>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map(doc => (
                    <DocumentCard 
                        key={doc.id} 
                        doc={doc} 
                        uploader={users.find(u => u.id === doc.uploaderId)}
                        currentUser={currentUser}
                        onEdit={() => handleOpenEditModal(doc)}
                        onDelete={() => setDeletingDoc(doc)}
                    />
                ))}
            </div>
             {filteredDocuments.length === 0 && (
                <div className="text-center py-10 col-span-full">
                    <p className="text-gray-500">Không tìm thấy tài liệu nào.</p>
                </div>
             )}
            
            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingDoc ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Tên tài liệu"
                        value={docFormData.title}
                        onChange={(e) => setDocFormData(prev => ({...prev, title: e.target.value}))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="url"
                        placeholder="Link tài liệu (URL)"
                        value={docFormData.link}
                        onChange={(e) => setDocFormData(prev => ({...prev, link: e.target.value}))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Môn học (VD: Mạng Máy Tính)"
                        value={docFormData.subject}
                        onChange={(e) => setDocFormData(prev => ({...prev, subject: e.target.value}))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <select
                        value={docFormData.type}
                        onChange={(e) => setDocFormData(prev => ({...prev, type: e.target.value as DocType['type']}))}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Bài giảng</option>
                        <option>Đề</option>
                        <option>Ghi chú</option>
                        <option>Khác</option>
                    </select>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Hủy</Button>
                        <Button type="submit">{editingDoc ? 'Lưu thay đổi' : 'Thêm'}</Button>
                    </div>
                </form>
            </Modal>
            
            {/* Delete Confirmation Modal */}
            {deletingDoc && (
                <Modal isOpen={!!deletingDoc} onClose={() => setDeletingDoc(null)} title="Xác nhận xóa">
                    <p>Bạn có chắc chắn muốn xóa tài liệu <span className="font-semibold">"{deletingDoc.title}"</span>?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setDeletingDoc(null)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Documents;