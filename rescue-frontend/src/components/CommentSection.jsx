import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Trash2 } from 'lucide-react';

const CommentSection = ({ needId }) => {
    const { user } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [needId]);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/comments/need/${needId}`);
            setComments(response.data);
        } catch (error) {
            console.error('Yorumlar yüklenirken hata:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            await api.post('/comments', {
                content: newComment.trim(),
                needId: needId,
                userId: user.id,
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Yorum ekleme hatası:', error);
            alert('Yorum eklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await api.delete(`/comments/${commentId}`);
            fetchComments();
        } catch (error) {
            console.error('Yorum silme hatası:', error);
            alert('Yorum silinirken bir hata oluştu.');
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={18} className="text-blue-500" />
                <h5 className="text-sm font-bold text-slate-400">Yorumlar ({comments.length})</h5>
            </div>

            <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Yorumunuzu yazın..."
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-white text-sm resize-none"
                    rows="2"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition disabled:opacity-50"
                >
                    {isLoading ? 'Gönderiliyor...' : 'Yorum Ekle'}
                </button>
            </form>

            <div className="space-y-3">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-sm text-slate-300">{comment.content}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {comment.user?.email || 'Bilinmeyen'} - {new Date(comment.createdAt || Date.now()).toLocaleString('tr-TR')}
                                </p>
                            </div>
                            {comment.user?.id === user?.id && (
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-500 hover:text-red-400 transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;

