import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { useSettingsStore } from '../store/useSettingsStore';
import CategoryManager from '../components/CategoryManager';

declare const __APP_VERSION__: string;

export default function Settings() {
  const { user, isAuthenticated, fetchUser, isLoading, logout } = useUserStore();
  const { aiProvider, aiBaseUrl, aiApiKey, aiModel, systemPromptTemplate, setAiConfig, resetToDefaultPrompt } = useSettingsStore();
  const navigate = useNavigate();

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const handleFetchModels = async () => {
    if (!aiBaseUrl || !aiApiKey) {
      setFetchError('Base URL and API Key required');
      return;
    }
    setIsFetchingModels(true);
    setFetchError('');
    try {
      const endpoint = aiBaseUrl.endsWith('/') ? `${aiBaseUrl}models` : `${aiBaseUrl}/models`;
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${aiApiKey}`
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id);
        setAvailableModels(models);
        if (models.length > 0 && (!aiModel || !models.includes(aiModel))) {
          setAiConfig({ aiModel: models[0] });
        }
      } else {
        throw new Error('Invalid format from API');
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch');
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUser();
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto w-full relative">
        <header className="flex justify-between items-end border-b-2 border-ink pb-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold font-serif italic">Press Setup</h2>
            <p className="text-ink-light font-mono uppercase tracking-widest text-xs mt-2 font-bold">
              Account Configuration
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information */}
          <section className="neo-box p-8 bg-white">
            <h3 className="text-xl font-serif font-bold italic mb-6 border-b-2 border-ink pb-2">Subscriber Details</h3>
            
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 w-1/3 bg-ink/10"></div>
                <div className="h-6 w-1/2 bg-ink/10"></div>
                <div className="h-6 w-1/4 bg-ink/10"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-ink-light mb-1">Full Name</p>
                  <p className="font-bold text-lg text-ink">{user?.name}</p>
                </div>
                
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-ink-light mb-1">Email Address</p>
                  <p className="font-mono text-ink">{user?.email}</p>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-ink-light mb-1">Current Capital</p>
                  <p className="font-serif font-bold italic text-2xl text-ink mb-6">
                    ${(user?.stats?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="pt-4 border-t-2 border-dashed border-ink/20">
                  <button 
                    onClick={() => logout()}
                    className="w-full bg-paper border-2 border-brick text-brick font-bold py-3 hover:bg-brick hover:text-paper transition-colors flex items-center justify-center gap-2"
                  >
                    Logout / Disconnect
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Preferences / Placeholder */}
          <section className="neo-box p-8 bg-paper">
            <h3 className="text-xl font-serif font-bold italic mb-6 border-b-2 border-ink pb-2">Preferences</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
                <input type="checkbox" disabled checked className="w-4 h-4 accent-ink" />
                <span className="font-mono text-sm font-bold">Retro Theme (Default)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-not-allowed opacity-50">
                <input type="checkbox" disabled className="w-4 h-4 accent-ink" />
                <span className="font-mono text-sm font-bold">Daily Report Email</span>
              </label>
              
              <p className="font-mono text-[10px] uppercase tracking-widest mt-6 text-ink-light">
                * Additional preferences will be available in the next volume.
              </p>
            </div>
          </section>
        </div>

        {/* AI Configuration */}
        <section className="neo-box p-8 bg-white mt-8">
          <div className="flex justify-between items-center mb-6 border-b-2 border-ink pb-2">
            <h3 className="text-xl font-serif font-bold italic">AI Assistant Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2">Provider Name</label>
              <input 
                type="text" 
                value={aiProvider}
                onChange={e => setAiConfig({ aiProvider: e.target.value })}
                className="neo-input"
                placeholder="e.g. DeepSeek"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold font-mono uppercase tracking-widest">Model</label>
                <button 
                  onClick={handleFetchModels}
                  disabled={isFetchingModels || !aiBaseUrl || !aiApiKey}
                  className="text-[10px] font-mono underline hover:text-brick disabled:opacity-50"
                >
                  {isFetchingModels ? 'Fetching...' : 'Fetch Models'}
                </button>
              </div>
              
              {availableModels.length > 0 ? (
                <select 
                  className="neo-input cursor-pointer appearance-none"
                  onChange={e => setAiConfig({ aiModel: e.target.value })}
                  value={availableModels.includes(aiModel) ? aiModel : ''}
                >
                  <option value="" disabled>Select from list...</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={aiModel}
                  onChange={e => setAiConfig({ aiModel: e.target.value })}
                  className="neo-input"
                  placeholder="e.g. deepseek-chat"
                />
              )}
              {fetchError && <p className="text-brick text-[10px] font-mono mt-1 font-bold">{fetchError}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2">Base URL</label>
              <input 
                type="text" 
                value={aiBaseUrl}
                onChange={e => setAiConfig({ aiBaseUrl: e.target.value })}
                className="neo-input"
                placeholder="https://api.deepseek.com/v1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold font-mono uppercase tracking-widest mb-2">API Key (Stored locally)</label>
              <input 
                type="password" 
                value={aiApiKey}
                onChange={e => setAiConfig({ aiApiKey: e.target.value })}
                className="neo-input"
                placeholder="sk-..."
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold font-mono uppercase tracking-widest">System Prompt Template</label>
              <button onClick={resetToDefaultPrompt} className="text-xs font-mono underline hover:text-brick">Reset to Default</button>
            </div>
            <p className="text-xs font-mono text-ink-light mb-2">
              Use <code className="bg-ink/10 px-1">{'{{HOTWORDS}}'}</code>, <code className="bg-ink/10 px-1">{'{{CATEGORIES}}'}</code>, <code className="bg-ink/10 px-1">{'{{ENTITIES}}'}</code>, and <code className="bg-ink/10 px-1">{'{{TRANSCRIPT}}'}</code> as dynamic variables.
            </p>
            <textarea 
              value={systemPromptTemplate}
              onChange={e => setAiConfig({ systemPromptTemplate: e.target.value })}
              className="neo-input h-64 font-mono text-sm leading-relaxed"
            />
          </div>
        </section>

        {/* Category Management */}
        <CategoryManager />

        <div className="mt-12 text-center">
          <p className="font-mono text-[10px] text-ink-light/50 tracking-widest uppercase">
            Build Version: {__APP_VERSION__}
          </p>
        </div>
        
      </main>
    </>
  );
}
