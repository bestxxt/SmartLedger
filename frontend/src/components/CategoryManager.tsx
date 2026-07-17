import { useState, useEffect } from 'react';
import { useCategoryStore } from '../store/useCategoryStore';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const RETRO_ICONS = [
  '/icons/retro-coffee.png', '/icons/retro-dining.png', '/icons/retro-drinks.png', 
  '/icons/retro-snacks.png', '/icons/retro-train.png', '/icons/retro-taxi.png', 
  '/icons/retro-transit.png', '/icons/retro-flight.png', '/icons/retro-housing.png', 
  '/icons/retro-utilities.png', '/icons/retro-groceries.png', '/icons/retro-telecom.png', 
  '/icons/retro-shopping.png', '/icons/retro-movies.png', '/icons/retro-music.png', 
  '/icons/retro-hobbies.png', '/icons/retro-salary.png', '/icons/retro-investments.png', 
  '/icons/retro-bonus.png', '/icons/retro-medical.png', '/icons/retro-education.png', 
  '/icons/retro-book.png', '/icons/retro-gift.png', '/icons/retro-tool.png', '/icons/retro-misc.png'
];

export default function CategoryManager() {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useCategoryStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  
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
                  <label className="block text-[10px] font-mono font-bold uppercase mb-1">Retro Icon</label>
                  <button 
                    onClick={() => setIsIconPickerOpen(true)}
                    className="neo-input text-sm py-2 px-3 flex items-center justify-center bg-paper hover:bg-ink hover:text-paper transition-colors"
                  >
                    {formData.imageUrl ? <img src={formData.imageUrl} className="w-6 h-6 object-contain" alt="selected" /> : 'Select Icon'}
                  </button>
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
                <label className="block text-[10px] font-mono font-bold uppercase mb-1">Retro Icon</label>
                <button 
                  onClick={() => setIsIconPickerOpen(true)}
                  className="neo-input text-sm py-2 px-3 flex items-center justify-center bg-paper hover:bg-ink hover:text-paper transition-colors"
                >
                  {formData.imageUrl ? <img src={formData.imageUrl} className="w-6 h-6 object-contain" alt="selected" /> : 'Select Icon'}
                </button>
              </div>
              <div className="lg:col-span-4 flex gap-2 justify-end">
                <button onClick={cancelEdit} className="bg-paper border-2 border-ink text-ink font-bold px-4 py-2 text-xs uppercase hover:bg-brick hover:text-paper transition-colors">Cancel</button>
                <button onClick={() => handleSave()} disabled={!formData.name} className="bg-ink border-2 border-ink text-paper font-bold px-6 py-2 text-xs uppercase disabled:opacity-50">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsIconPickerOpen(false)}></div>
          <div className="neo-box bg-paper w-full max-w-2xl max-h-[80vh] flex flex-col relative z-10">
            <div className="flex justify-between items-center p-4 border-b-2 border-ink bg-white">
              <h3 className="font-serif font-bold italic text-xl">Select Retro Icon</h3>
              <button onClick={() => setIsIconPickerOpen(false)} className="hover:text-brick"><X size={20} /></button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-4">
              {RETRO_ICONS.map((iconPath) => (
                <button
                  key={iconPath}
                  onClick={() => {
                    setFormData({ ...formData, imageUrl: iconPath });
                    setIsIconPickerOpen(false);
                  }}
                  className={`p-2 border-2 ${formData.imageUrl === iconPath ? 'border-brick bg-brick/10' : 'border-ink/20 hover:border-ink hover:bg-white'} transition-all flex items-center justify-center aspect-square`}
                >
                  <img src={iconPath} alt="icon" className="w-10 h-10 object-contain" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
