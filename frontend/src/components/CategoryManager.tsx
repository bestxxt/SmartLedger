import { useState, useEffect } from 'react';
import { useCategoryStore } from '../store/useCategoryStore';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

export default function CategoryManager() {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useCategoryStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', icon: '', imageUrl: '', type: 'expense' });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (id?: string) => {
    if (!formData.name.trim()) return;
    
    if (id) {
      await updateCategory(id, formData);
      setEditingId(null);
    } else {
      await createCategory(formData);
      setIsAdding(false);
    }
  };

  const startEdit = (category: any) => {
    setFormData({ 
      name: category.name, 
      icon: category.icon || '', 
      imageUrl: category.imageUrl || '', 
      type: category.type 
    });
    setEditingId(category.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <section className="neo-box p-8 bg-white mt-8">
      <div className="flex justify-between items-center mb-6 border-b-2 border-ink pb-2">
        <h3 className="text-xl font-serif font-bold italic">Classification Categories</h3>
        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); setFormData({ name: '', icon: '', imageUrl: '', type: 'expense' }); }}
            className="flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-widest hover:text-brick"
          >
            <Plus size={14} /> Add Category
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading && categories.length === 0 ? (
          <p className="font-mono text-xs text-ink-light">Loading categories...</p>
        ) : categories.length === 0 && !isAdding ? (
          <p className="font-mono text-xs text-ink-light">No custom categories found.</p>
        ) : null}

        {categories.map((c) => (
          <div key={c.id} className="border-b border-ink/10 pb-4">
            {editingId === c.id ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="neo-input text-sm py-2 px-3" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase mb-1">Emoji Icon</label>
                  <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="neo-input text-sm py-2 px-3" placeholder="🛒" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase mb-1">Image URL (Optional)</label>
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="neo-input text-sm py-2 px-3" placeholder="https://..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSave(c.id)} className="neo-button flex-1 !py-2 !px-3 text-xs flex justify-center items-center gap-1"><Check size={14} /> Save</button>
                  <button onClick={cancelEdit} className="bg-paper border-2 border-ink text-ink font-bold px-3 hover:bg-brick hover:text-paper transition-colors"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl">{c.icon || '📌'}</span>
                  )}
                  <div>
                    <p className="font-bold font-mono text-sm">{c.name}</p>
                    <p className="text-[10px] font-mono uppercase text-ink-light">{c.type}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startEdit(c)} className="text-ink-light hover:text-ink"><Edit2 size={16} /></button>
                  <button onClick={() => deleteCategory(c.id)} className="text-ink-light hover:text-brick"><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="border-2 border-dashed border-ink p-4 bg-paper/50">
            <h4 className="font-mono text-xs font-bold uppercase mb-4">New Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="neo-input text-sm py-2 px-3" placeholder="E.g. Groceries" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="neo-input text-sm py-2 px-3 appearance-none cursor-pointer">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1">Emoji Icon</label>
                <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="neo-input text-sm py-2 px-3" placeholder="🛒" />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase mb-1">Image URL (Optional)</label>
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="neo-input text-sm py-2 px-3" placeholder="https://..." />
              </div>
              <div className="lg:col-span-4 flex gap-2 justify-end">
                <button onClick={cancelEdit} className="bg-paper border-2 border-ink text-ink font-bold px-4 py-2 text-xs uppercase hover:bg-brick hover:text-paper transition-colors">Cancel</button>
                <button onClick={() => handleSave()} disabled={!formData.name} className="bg-ink border-2 border-ink text-paper font-bold px-6 py-2 text-xs uppercase disabled:opacity-50">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
